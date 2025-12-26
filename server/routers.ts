import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { vehicles, inspections, checklistItems, proofs } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // FleetCore routers
  vehicles: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      return await db
        .select()
        .from(vehicles)
        .where(eq(vehicles.userId, ctx.user.id))
        .orderBy(desc(vehicles.updatedAt));
    }),
    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        const result = await db
          .select()
          .from(vehicles)
          .where(and(eq(vehicles.id, input.id), eq(vehicles.userId, ctx.user.id)))
          .limit(1);
        return result[0] || null;
      }),
    create: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          vin: z.string().length(17),
          plate: z.string(),
          unit: z.string(),
          vehicleClass: z.enum(['A', 'B', 'C', 'D', 'E']),
          make: z.string(),
          model: z.string(),
          year: z.number(),
          companyId: z.string().optional(),
          status: z.enum(['active', 'inactive', 'maintenance']).default('active'),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        await db.insert(vehicles).values({
          ...input,
          userId: ctx.user.id,
        });
        return { success: true };
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          status: z.enum(['active', 'inactive', 'maintenance']).optional(),
          lastInspectionDate: z.string().optional(),
          lastInspectionStatus: z.enum(['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED']).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        const { id, lastInspectionDate, ...updates } = input;
        await db
          .update(vehicles)
          .set({
            ...updates,
            lastInspectionDate: lastInspectionDate ? new Date(lastInspectionDate) : undefined,
          })
          .where(and(eq(vehicles.id, id), eq(vehicles.userId, ctx.user.id)));
        return { success: true };
      }),
  }),
  inspections: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      return await db
        .select()
        .from(inspections)
        .where(eq(inspections.userId, ctx.user.id))
        .orderBy(desc(inspections.startedAt));
    }),
    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        const result = await db
          .select()
          .from(inspections)
          .where(and(eq(inspections.id, input.id), eq(inspections.userId, ctx.user.id)))
          .limit(1);
        return result[0] || null;
      }),
    create: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          vehicleId: z.string(),
          technicianId: z.string(),
          technicianName: z.string(),
          type: z.enum(['periodic', 'pre_trip', 'post_trip', 'incident']),
          status: z.enum(['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED']).default('DRAFT'),
          startedAt: z.string(),
          totalItems: z.number().default(0),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        await db.insert(inspections).values({
          ...input,
          startedAt: new Date(input.startedAt),
          userId: ctx.user.id,
        });
        return { success: true };
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          status: z.enum(['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED']).optional(),
          completedAt: z.string().optional(),
          completedItems: z.number().optional(),
          okCount: z.number().optional(),
          minorDefectCount: z.number().optional(),
          majorDefectCount: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        const { id, completedAt, ...updates } = input;
        await db
          .update(inspections)
          .set({
            ...updates,
            completedAt: completedAt ? new Date(completedAt) : undefined,
          })
          .where(and(eq(inspections.id, id), eq(inspections.userId, ctx.user.id)));
        return { success: true };
      }),
  }),
  checklistItems: router({
    listByInspection: protectedProcedure
      .input(z.object({ inspectionId: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        return await db
          .select()
          .from(checklistItems)
          .where(eq(checklistItems.inspectionId, input.inspectionId))
          .orderBy(checklistItems.itemNumber);
      }),
    update: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          status: z.enum(['pending', 'ok', 'minor_defect', 'major_defect']).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        const { id, ...updates } = input;
        await db
          .update(checklistItems)
          .set(updates)
          .where(eq(checklistItems.id, id));
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
