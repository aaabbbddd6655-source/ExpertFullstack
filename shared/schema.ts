import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const orderStatusEnum = pgEnum("order_status", [
  "PENDING_MEASUREMENT",
  "DESIGN_APPROVAL",
  "MATERIALS_PROCUREMENT",
  "IN_PRODUCTION",
  "QUALITY_CHECK",
  "PACKAGING",
  "READY_FOR_INSTALL",
  "INSTALLED",
  "COMPLETED",
  "CANCELLED"
]);

export const stageTypeEnum = pgEnum("stage_type", [
  "ORDER_RECEIVED",
  "SITE_MEASUREMENT",
  "DESIGN_APPROVAL",
  "MATERIALS_PROCUREMENT",
  "PRODUCTION_CUTTING",
  "PRODUCTION_STITCHING",
  "PRODUCTION_ASSEMBLY",
  "FINISHING",
  "QUALITY_CHECK",
  "PACKAGING",
  "DELIVERY_SCHEDULING",
  "INSTALLATION",
  "RATING"
]);

export const stageStatusEnum = pgEnum("stage_status", ["PENDING", "IN_PROGRESS", "DONE"]);

export const eventTypeEnum = pgEnum("event_type", [
  "STATUS_CHANGE",
  "NOTE_ADDED",
  "MEDIA_ADDED",
  "APPOINTMENT_SET"
]);

export const mediaTypeEnum = pgEnum("media_type", ["IMAGE", "DOCUMENT"]);

export const userRoleEnum = pgEnum("user_role", [
  "ADMIN",
  "OPERATIONS",
  "PRODUCTION",
  "QUALITY",
  "INSTALLATION",
  "SUPPORT"
]);

// Tables
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email")
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  externalOrderId: text("external_order_id").notNull().unique(),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  totalAmount: integer("total_amount").notNull(),
  status: orderStatusEnum("status").notNull().default("PENDING_MEASUREMENT"),
  progressPercent: integer("progress_percent").notNull().default(0),
  currentStageId: varchar("current_stage_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const orderStages = pgTable("order_stages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  stageType: stageTypeEnum("stage_type").notNull(),
  status: stageStatusEnum("status").notNull().default("PENDING"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  notes: text("notes")
});

export const orderEvents = pgTable("order_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  stageId: varchar("stage_id").references(() => orderStages.id, { onDelete: "set null" }),
  eventType: eventTypeEnum("event_type").notNull(),
  description: text("description").notNull(),
  createdByUserId: varchar("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const mediaFiles = pgTable("media_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  stageId: varchar("stage_id").references(() => orderStages.id, { onDelete: "set null" }),
  url: text("url").notNull(),
  type: mediaTypeEnum("type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("SUPPORT")
});

export const installationAppointments = pgTable("installation_appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  scheduledAt: timestamp("scheduled_at").notNull(),
  locationAddress: text("location_address").notNull(),
  notes: text("notes")
});

export const customerRatings = pgTable("customer_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Insert schemas
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const insertOrderStageSchema = createInsertSchema(orderStages).omit({ id: true });
export const insertOrderEventSchema = createInsertSchema(orderEvents).omit({ 
  id: true, 
  createdAt: true 
});
export const insertMediaFileSchema = createInsertSchema(mediaFiles).omit({ 
  id: true, 
  createdAt: true 
});
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertInstallationAppointmentSchema = createInsertSchema(installationAppointments).omit({ id: true });
export const insertCustomerRatingSchema = createInsertSchema(customerRatings).omit({ 
  id: true, 
  createdAt: true 
});

// Types
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderStage = typeof orderStages.$inferSelect;
export type InsertOrderStage = z.infer<typeof insertOrderStageSchema>;

export type OrderEvent = typeof orderEvents.$inferSelect;
export type InsertOrderEvent = z.infer<typeof insertOrderEventSchema>;

export type MediaFile = typeof mediaFiles.$inferSelect;
export type InsertMediaFile = z.infer<typeof insertMediaFileSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type InstallationAppointment = typeof installationAppointments.$inferSelect;
export type InsertInstallationAppointment = z.infer<typeof insertInstallationAppointmentSchema>;

export type CustomerRating = typeof customerRatings.$inferSelect;
export type InsertCustomerRating = z.infer<typeof insertCustomerRatingSchema>;
