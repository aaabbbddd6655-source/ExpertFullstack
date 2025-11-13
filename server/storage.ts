import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import * as schema from "@shared/schema";
import type {
  Customer,
  InsertCustomer,
  Order,
  InsertOrder,
  OrderStage,
  InsertOrderStage,
  OrderEvent,
  InsertOrderEvent,
  MediaFile,
  InsertMediaFile,
  User,
  InsertUser,
  InstallationAppointment,
  InsertInstallationAppointment,
  CustomerRating,
  InsertCustomerRating
} from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

export interface IStorage {
  // Customer operations
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  getCustomerById(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  
  // Order operations
  getOrderById(id: string): Promise<Order | undefined>;
  getOrderByExternalId(externalOrderId: string): Promise<Order | undefined>;
  getOrdersByStatus(status: string, limit?: number): Promise<Order[]>;
  getOrdersByDateRange(fromDate: Date, toDate: Date): Promise<Order[]>;
  getAllOrders(limit?: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order | undefined>;
  
  // Order lookup for customers
  getOrderWithDetails(phone: string, orderNumber: string): Promise<{
    order: Order;
    customer: Customer;
    stages: OrderStage[];
    media: MediaFile[];
    appointment?: InstallationAppointment;
    rating?: CustomerRating;
  } | undefined>;
  
  // Order stage operations
  getStagesByOrderId(orderId: string): Promise<OrderStage[]>;
  getStageById(id: string): Promise<OrderStage | undefined>;
  createStage(stage: InsertOrderStage): Promise<OrderStage>;
  updateStage(id: string, updates: Partial<InsertOrderStage>): Promise<OrderStage | undefined>;
  
  // Order event operations
  getEventsByOrderId(orderId: string): Promise<OrderEvent[]>;
  createEvent(event: InsertOrderEvent): Promise<OrderEvent>;
  
  // Media operations
  getMediaByOrderId(orderId: string): Promise<MediaFile[]>;
  getMediaByStageId(stageId: string): Promise<MediaFile[]>;
  createMedia(media: InsertMediaFile): Promise<MediaFile>;
  
  // User operations (admin)
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Installation appointment operations
  getAppointmentByOrderId(orderId: string): Promise<InstallationAppointment | undefined>;
  createAppointment(appointment: InsertInstallationAppointment): Promise<InstallationAppointment>;
  updateAppointment(orderId: string, updates: Partial<InsertInstallationAppointment>): Promise<InstallationAppointment | undefined>;
  
  // Customer rating operations
  getRatingByOrderId(orderId: string): Promise<CustomerRating | undefined>;
  createRating(rating: InsertCustomerRating): Promise<CustomerRating>;
}

export class DatabaseStorage implements IStorage {
  // Customer operations
  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const results = await db.select().from(schema.customers).where(eq(schema.customers.phone, phone));
    return results[0];
  }

  async getCustomerById(id: string): Promise<Customer | undefined> {
    const results = await db.select().from(schema.customers).where(eq(schema.customers.id, id));
    return results[0];
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const results = await db.insert(schema.customers).values(customer).returning();
    return results[0];
  }

  // Order operations
  async getOrderById(id: string): Promise<Order | undefined> {
    const results = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
    return results[0];
  }

  async getOrderByExternalId(externalOrderId: string): Promise<Order | undefined> {
    const results = await db.select().from(schema.orders).where(eq(schema.orders.externalOrderId, externalOrderId));
    return results[0];
  }

  async getOrdersByStatus(status: string, limit = 100): Promise<Order[]> {
    return await db.select()
      .from(schema.orders)
      .where(eq(schema.orders.status, status as any))
      .limit(limit)
      .orderBy(desc(schema.orders.createdAt));
  }

  async getOrdersByDateRange(fromDate: Date, toDate: Date): Promise<Order[]> {
    return await db.select()
      .from(schema.orders)
      .where(
        and(
          gte(schema.orders.createdAt, fromDate),
          lte(schema.orders.createdAt, toDate)
        )
      )
      .orderBy(desc(schema.orders.createdAt));
  }

  async getAllOrders(limit = 100): Promise<Order[]> {
    return await db.select()
      .from(schema.orders)
      .limit(limit)
      .orderBy(desc(schema.orders.createdAt));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const results = await db.insert(schema.orders).values(order).returning();
    return results[0];
  }

  async updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order | undefined> {
    const results = await db.update(schema.orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.orders.id, id))
      .returning();
    return results[0];
  }

  async getOrderWithDetails(phone: string, orderNumber: string) {
    const customer = await this.getCustomerByPhone(phone);
    if (!customer) return undefined;

    const order = await this.getOrderByExternalId(orderNumber);
    if (!order || order.customerId !== customer.id) return undefined;

    const stages = await this.getStagesByOrderId(order.id);
    const media = await this.getMediaByOrderId(order.id);
    const appointment = await this.getAppointmentByOrderId(order.id);
    const rating = await this.getRatingByOrderId(order.id);

    return { order, customer, stages, media, appointment, rating };
  }

  // Order stage operations
  async getStagesByOrderId(orderId: string): Promise<OrderStage[]> {
    return await db.select()
      .from(schema.orderStages)
      .where(eq(schema.orderStages.orderId, orderId));
  }

  async getStageById(id: string): Promise<OrderStage | undefined> {
    const results = await db.select().from(schema.orderStages).where(eq(schema.orderStages.id, id));
    return results[0];
  }

  async createStage(stage: InsertOrderStage): Promise<OrderStage> {
    const results = await db.insert(schema.orderStages).values(stage).returning();
    return results[0];
  }

  async updateStage(id: string, updates: Partial<InsertOrderStage>): Promise<OrderStage | undefined> {
    const results = await db.update(schema.orderStages)
      .set(updates)
      .where(eq(schema.orderStages.id, id))
      .returning();
    return results[0];
  }

  // Order event operations
  async getEventsByOrderId(orderId: string): Promise<OrderEvent[]> {
    return await db.select()
      .from(schema.orderEvents)
      .where(eq(schema.orderEvents.orderId, orderId))
      .orderBy(desc(schema.orderEvents.createdAt));
  }

  async createEvent(event: InsertOrderEvent): Promise<OrderEvent> {
    const results = await db.insert(schema.orderEvents).values(event).returning();
    return results[0];
  }

  // Media operations
  async getMediaByOrderId(orderId: string): Promise<MediaFile[]> {
    return await db.select()
      .from(schema.mediaFiles)
      .where(eq(schema.mediaFiles.orderId, orderId));
  }

  async getMediaByStageId(stageId: string): Promise<MediaFile[]> {
    return await db.select()
      .from(schema.mediaFiles)
      .where(eq(schema.mediaFiles.stageId, stageId));
  }

  async createMedia(media: InsertMediaFile): Promise<MediaFile> {
    const results = await db.insert(schema.mediaFiles).values(media).returning();
    return results[0];
  }

  // User operations
  async getUserById(id: string): Promise<User | undefined> {
    const results = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return results[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const results = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return results[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const results = await db.insert(schema.users).values(user).returning();
    return results[0];
  }

  // Installation appointment operations
  async getAppointmentByOrderId(orderId: string): Promise<InstallationAppointment | undefined> {
    const results = await db.select()
      .from(schema.installationAppointments)
      .where(eq(schema.installationAppointments.orderId, orderId));
    return results[0];
  }

  async createAppointment(appointment: InsertInstallationAppointment): Promise<InstallationAppointment> {
    const results = await db.insert(schema.installationAppointments).values(appointment).returning();
    return results[0];
  }

  async updateAppointment(orderId: string, updates: Partial<InsertInstallationAppointment>): Promise<InstallationAppointment | undefined> {
    const results = await db.update(schema.installationAppointments)
      .set(updates)
      .where(eq(schema.installationAppointments.orderId, orderId))
      .returning();
    return results[0];
  }

  // Customer rating operations
  async getRatingByOrderId(orderId: string): Promise<CustomerRating | undefined> {
    const results = await db.select()
      .from(schema.customerRatings)
      .where(eq(schema.customerRatings.orderId, orderId));
    return results[0];
  }

  async createRating(rating: InsertCustomerRating): Promise<CustomerRating> {
    const results = await db.insert(schema.customerRatings).values(rating).returning();
    return results[0];
  }
}

export const storage = new DatabaseStorage();
