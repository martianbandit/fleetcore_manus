import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// FleetCore Tables
// ============================================================================

export const vehicles = mysqlTable('vehicles', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: int('userId').notNull(),
  vin: varchar('vin', { length: 17 }).notNull().unique(),
  plate: varchar('plate', { length: 20 }).notNull(),
  unit: varchar('unit', { length: 50 }).notNull(),
  vehicleClass: mysqlEnum('vehicleClass', ['A', 'B', 'C', 'D', 'E']).notNull(),
  make: varchar('make', { length: 100 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  year: int('year').notNull(),
  companyId: varchar('companyId', { length: 100 }),
  status: mysqlEnum('status', ['active', 'inactive', 'maintenance']).notNull().default('active'),
  lastInspectionDate: timestamp('lastInspectionDate'),
  lastInspectionStatus: mysqlEnum('lastInspectionStatus', ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED']),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export const inspections = mysqlTable('inspections', {
  id: varchar('id', { length: 36 }).primaryKey(),
  vehicleId: varchar('vehicleId', { length: 36 }).notNull(),
  userId: int('userId').notNull(),
  technicianId: varchar('technicianId', { length: 100 }).notNull(),
  technicianName: varchar('technicianName', { length: 200 }).notNull(),
  type: mysqlEnum('type', ['periodic', 'pre_trip', 'post_trip', 'incident']).notNull(),
  status: mysqlEnum('status', ['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED']).notNull().default('DRAFT'),
  startedAt: timestamp('startedAt').notNull(),
  completedAt: timestamp('completedAt'),
  totalItems: int('totalItems').notNull().default(0),
  completedItems: int('completedItems').notNull().default(0),
  okCount: int('okCount').notNull().default(0),
  minorDefectCount: int('minorDefectCount').notNull().default(0),
  majorDefectCount: int('majorDefectCount').notNull().default(0),
  notes: text('notes'),
  pdfReportUrl: text('pdfReportUrl'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export const checklistItems = mysqlTable('checklistItems', {
  id: varchar('id', { length: 36 }).primaryKey(),
  inspectionId: varchar('inspectionId', { length: 36 }).notNull(),
  sectionId: varchar('sectionId', { length: 50 }).notNull(),
  sectionName: varchar('sectionName', { length: 200 }).notNull(),
  itemNumber: int('itemNumber').notNull(),
  title: varchar('title', { length: 300 }).notNull(),
  description: text('description').notNull(),
  vmrsCode: varchar('vmrsCode', { length: 50 }),
  saaqCode: varchar('saaqCode', { length: 50 }),
  status: mysqlEnum('status', ['pending', 'ok', 'minor_defect', 'major_defect']).notNull().default('pending'),
  notes: text('notes'),
  isRequired: int('isRequired').notNull().default(0), // 0 = false, 1 = true
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export const proofs = mysqlTable('proofs', {
  id: varchar('id', { length: 36 }).primaryKey(),
  checklistItemId: varchar('checklistItemId', { length: 36 }).notNull(),
  type: mysqlEnum('type', ['photo', 'video']).notNull(),
  uri: text('uri').notNull(),
  localUri: text('localUri'),
  thumbnail: text('thumbnail'),
  timestamp: timestamp('timestamp').notNull(),
  location: varchar('location', { length: 10 }),
  notes: text('notes'),
  uploadedToS3: int('uploadedToS3').notNull().default(0),
  s3Key: text('s3Key'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;

export type InspectionDB = typeof inspections.$inferSelect;
export type NewInspection = typeof inspections.$inferInsert;

export type ChecklistItemDB = typeof checklistItems.$inferSelect;
export type NewChecklistItem = typeof checklistItems.$inferInsert;

export type ProofDB = typeof proofs.$inferSelect;
export type NewProof = typeof proofs.$inferInsert;
