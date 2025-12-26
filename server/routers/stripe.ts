/**
 * Stripe tRPC Router - Backend API for Stripe integration
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import Stripe from 'stripe';

// Initialize Stripe (will use STRIPE_SECRET_KEY from env)
const getStripe = () => {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(apiKey, {
    apiVersion: '2025-12-15.clover',
  });
};

export const stripeRouter = router({
  /**
   * Create a Stripe Checkout Session for subscription
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        vehicleCount: z.number().min(0),
        employeeCount: z.number().min(0),
        enabledFeatures: z.array(z.string()).optional(),
        successUrl: z.string(),
        cancelUrl: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const stripe = getStripe();
      const user = ctx.user;

      // Create or retrieve customer
      let customer: Stripe.Customer;
      const existingCustomers = await stripe.customers.search({
        query: `email:'${user.email}'`,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
      customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.name || undefined,
          metadata: {
            userId: user.id,
          },
        });
      }

      // Create line items based on usage
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

      // Add vehicles (using metered billing)
      if (input.vehicleCount > 0) {
        // TODO: Create price in Stripe Dashboard and use actual price ID
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Véhicules',
              description: `${input.vehicleCount} véhicules`,
            },
            unit_amount: 1500, // 15$ in cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: input.vehicleCount,
        });
      }

      // Add employees
      if (input.employeeCount > 0) {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Employés/Techniciens',
              description: `${input.employeeCount} techniciens`,
            },
            unit_amount: 2500, // 25$ in cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: input.employeeCount,
        });
      }

      // Add features
      if (input.enabledFeatures && input.enabledFeatures.length > 0) {
        if (input.enabledFeatures.includes('advancedMetrics')) {
          lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Métriques avancées',
              },
              unit_amount: 5000, // 50$ in cents
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          });
        }

        if (input.enabledFeatures.includes('premiumPdfExport')) {
          lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Export PDF Premium',
              },
              unit_amount: 3000, // 30$ in cents
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          });
        }

        if (input.enabledFeatures.includes('cloudSync')) {
          lineItems.push({
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Synchronisation Cloud',
              },
              unit_amount: 4000, // 40$ in cents
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          });
        }
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        mode: 'subscription',
        line_items: lineItems,
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        subscription_data: {
          trial_period_days: 14, // 14 days free trial
          metadata: {
            userId: user.id,
            vehicleCount: input.vehicleCount.toString(),
            employeeCount: input.employeeCount.toString(),
          },
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    }),

  /**
   * Get current subscription
   */
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const stripe = getStripe();
    const user = ctx.user;

    // Find customer
    const customers = await stripe.customers.search({
      query: `email:'${user.email}'`,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return null;
    }

    const customer = customers.data[0];

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return null;
    }

    const subscription = subscriptions.data[0];

    return {
      id: subscription.id,
      customerId: customer.id,
      status: subscription.status,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      items: subscription.items.data.map((item) => ({
        id: item.id,
        priceId: item.price.id,
        quantity: item.quantity,
      })),
    };
  }),

  /**
   * Cancel subscription
   */
  cancelSubscription: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.string(),
        immediately: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const stripe = getStripe();

      if (input.immediately) {
        await stripe.subscriptions.cancel(input.subscriptionId);
      } else {
        await stripe.subscriptions.update(input.subscriptionId, {
          cancel_at_period_end: true,
        });
      }

      return { success: true };
    }),

  /**
   * Update subscription (change quantities)
   */
  updateSubscription: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.string(),
        vehicleCount: z.number().min(0).optional(),
        employeeCount: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const stripe = getStripe();

      const subscription = await stripe.subscriptions.retrieve(input.subscriptionId);

      // Update quantities for each item
      const itemsToUpdate: Stripe.SubscriptionUpdateParams.Item[] = [];

      subscription.items.data.forEach((item) => {
        // TODO: Match by price ID instead of product name
        if (input.vehicleCount !== undefined) {
          itemsToUpdate.push({
            id: item.id,
            quantity: input.vehicleCount,
          });
        }
        if (input.employeeCount !== undefined) {
          itemsToUpdate.push({
            id: item.id,
            quantity: input.employeeCount,
          });
        }
      });

      await stripe.subscriptions.update(input.subscriptionId, {
        items: itemsToUpdate,
        proration_behavior: 'create_prorations', // Prorata for upgrades/downgrades
      });

      return { success: true };
    }),

  /**
   * Get invoices
   */
  getInvoices: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const stripe = getStripe();
      const user = ctx.user;

      // Find customer
      const customers = await stripe.customers.search({
        query: `email:'${user.email}'`,
        limit: 1,
      });

      if (customers.data.length === 0) {
        return [];
      }

      const customer = customers.data[0];

      const invoices = await stripe.invoices.list({
        customer: customer.id,
        limit: input?.limit || 10,
      });

      return invoices.data.map((invoice) => ({
        id: invoice.id,
        number: invoice.number,
        status: invoice.status,
        amountDue: invoice.amount_due,
        amountPaid: invoice.amount_paid,
        currency: invoice.currency,
        created: new Date(invoice.created * 1000).toISOString(),
        pdfUrl: invoice.invoice_pdf,
        hostedUrl: invoice.hosted_invoice_url,
      }));
    }),

  /**
   * Create customer portal session (for managing subscription)
   */
  createPortalSession: protectedProcedure
    .input(
      z.object({
        returnUrl: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const stripe = getStripe();
      const user = ctx.user;

      // Find customer
      const customers = await stripe.customers.search({
        query: `email:'${user.email}'`,
        limit: 1,
      });

      if (customers.data.length === 0) {
        throw new Error('No customer found');
      }

      const customer = customers.data[0];

      const session = await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: input.returnUrl,
      });

      return {
        url: session.url,
      };
    }),
});
