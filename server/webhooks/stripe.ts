/**
 * Stripe Webhooks Handler
 * Handles Stripe events and syncs subscription status
 */

import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { getDb } from '../db';
import { subscriptions } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

const getStripe = () => {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(apiKey, {
    apiVersion: '2025-12-15.clover',
  });
};

const getWebhookSecret = () => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET not configured');
  }
  return secret;
};

/**
 * Stripe Webhook Handler
 * Endpoint: POST /api/webhooks/stripe
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const stripe = getStripe();
  const webhookSecret = getWebhookSecret();
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    console.error('[Stripe Webhook] No signature provided');
    return res.status(400).send('No signature');
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('[Stripe Webhook] Error processing event:', error);
    res.status(500).send(`Webhook processing error: ${error.message}`);
  }
}

/**
 * Handle successful payment
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`[Stripe Webhook] Payment succeeded for invoice: ${invoice.id}`);

  const db = await getDb();
  if (!db) {
    console.error('[Stripe Webhook] Database not available');
    return;
  }
  const customerId = invoice.customer as string;

  // Update subscription status to active
  if ((invoice as any).subscription) {
    await db
      .update(subscriptions)
      .set({
        status: 'active',
        lastPaymentDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.stripeSubscriptionId, (invoice as any).subscription as string));

    console.log(`[Stripe Webhook] Subscription ${(invoice as any).subscription} marked as active`);
  }

  // TODO: Send success notification to user
  // await sendNotification(customerId, {
  //   title: 'Paiement réussi',
  //   body: `Votre paiement de ${(invoice.amount_paid / 100).toFixed(2)}$ a été traité avec succès`,
  // });
}

/**
 * Handle failed payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`[Stripe Webhook] Payment failed for invoice: ${invoice.id}`);

  const db = await getDb();
  if (!db) {
    console.error('[Stripe Webhook] Database not available');
    return;
  }
  const customerId = invoice.customer as string;

  // Update subscription status to past_due
  if ((invoice as any).subscription) {
    await db
      .update(subscriptions)
      .set({
        status: 'past_due',
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.stripeSubscriptionId, (invoice as any).subscription as string));

    console.log(`[Stripe Webhook] Subscription ${(invoice as any).subscription} marked as past_due`);
  }

  // TODO: Send failure notification to user
  // await sendNotification(customerId, {
  //   title: 'Échec du paiement',
  //   body: 'Le paiement de votre abonnement a échoué. Veuillez mettre à jour vos informations de paiement.',
  // });
}

/**
 * Handle subscription created or updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`[Stripe Webhook] Subscription updated: ${subscription.id}`);

  const db = await getDb();
  if (!db) {
    console.error('[Stripe Webhook] Database not available');
    return;
  }
  const customerId = subscription.customer as string;

  // Extract subscription details
  const status = subscription.status;
  const currentPeriodStart = new Date((subscription as any).current_period_start * 1000);
  const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);
  const cancelAtPeriodEnd = subscription.cancel_at_period_end;

  // Upsert subscription in database
  const existing = await db.select().from(subscriptions).where(eq(subscriptions.stripeSubscriptionId, subscription.id)).limit(1);

  if (existing && existing.length > 0) {
    await db
      .update(subscriptions)
      .set({
        status,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: cancelAtPeriodEnd ? 1 : 0,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
  } else {
    // Create new subscription record
    // Note: This requires knowing the userId from the customer
    // You may need to store userId in Stripe customer metadata
    console.log(`[Stripe Webhook] New subscription ${subscription.id} - manual DB insert may be needed`);
  }

  console.log(`[Stripe Webhook] Subscription ${subscription.id} synced to database`);

  // TODO: Send notification if status changed
  if (status === 'active') {
    // await sendNotification(customerId, {
    //   title: 'Abonnement activé',
    //   body: 'Votre abonnement FleetCore est maintenant actif',
    // });
  }
}

/**
 * Handle subscription deleted/canceled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`[Stripe Webhook] Subscription deleted: ${subscription.id}`);

  const db = await getDb();
  if (!db) {
    console.error('[Stripe Webhook] Database not available');
    return;
  }

  // Update subscription status to canceled
  await db
    .update(subscriptions)
    .set({
      status: 'canceled',
      canceledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  console.log(`[Stripe Webhook] Subscription ${subscription.id} marked as canceled`);

  // TODO: Send cancellation notification
  // await sendNotification(subscription.customer as string, {
  //   title: 'Abonnement annulé',
  //   body: 'Votre abonnement FleetCore a été annulé',
  // });
}

/**
 * Handle trial ending soon
 */
async function handleTrialWillEnd(subscription: Stripe.Subscription) {
  console.log(`[Stripe Webhook] Trial will end for subscription: ${subscription.id}`);

  // TODO: Send reminder notification
  // const trialEnd = new Date((subscription as any).trial_end * 1000);
  // await sendNotification(subscription.customer as string, {
  //   title: 'Fin de période d\'essai',
  //   body: `Votre période d'essai se termine le ${trialEnd.toLocaleDateString('fr-FR')}`,
  // });
}
