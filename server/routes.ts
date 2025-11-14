import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { emailService } from "./services/email";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { insertCustomerSchema, insertOrderSchema } from "@shared/schema";
import { normalizePhoneNumber, generateOrderNumber, getCurrentYear } from "./utils";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

const JWT_SECRET = process.env.SESSION_SECRET || "evia-secret-key-change-in-production";

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(express.json());

  // ===== PUBLIC / CUSTOMER-FACING ENDPOINTS =====

  // Order lookup
  app.post("/api/public/order-lookup", async (req, res) => {
    try {
      const { phone, orderNumber } = req.body;

      if (!phone || !orderNumber) {
        return res.status(400).json({ error: "Phone and order number are required" });
      }

      const normalizedPhone = normalizePhoneNumber(phone);
      const orderDetails = await storage.getOrderWithDetails(normalizedPhone, orderNumber);

      if (!orderDetails) {
        return res.status(404).json({ error: "Order not found. Please check your phone number and order number." });
      }

      res.json(orderDetails);
    } catch (error) {
      console.error("Order lookup error:", error);
      res.status(500).json({ error: "Failed to lookup order" });
    }
  });

  // Get order timeline
  app.get("/api/public/orders/:orderId/timeline", async (req, res) => {
    try {
      const { orderId } = req.params;
      const stages = await storage.getStagesByOrderId(orderId);
      const events = await storage.getEventsByOrderId(orderId);

      res.json({ stages, events });
    } catch (error) {
      console.error("Timeline fetch error:", error);
      res.status(500).json({ error: "Failed to fetch timeline" });
    }
  });

  // Submit rating
  app.post("/api/public/orders/:orderId/rating", async (req, res) => {
    try {
      const { orderId } = req.params;
      const { rating, comment } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }

      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const existingRating = await storage.getRatingByOrderId(orderId);
      if (existingRating) {
        return res.status(400).json({ error: "Rating already submitted" });
      }

      const newRating = await storage.createRating({
        orderId,
        rating,
        comment: comment || null
      });

      // Update order to completed
      await storage.updateOrder(orderId, {
        status: "COMPLETED",
        progressPercent: 100
      });

      // Create event
      await storage.createEvent({
        orderId,
        stageId: null,
        eventType: "NOTE_ADDED",
        description: `Customer rated the service: ${rating} stars`,
        createdByUserId: null
      });

      res.json(newRating);
    } catch (error) {
      console.error("Rating submission error:", error);
      res.status(500).json({ error: "Failed to submit rating" });
    }
  });

  // ===== WEBHOOK ENDPOINTS =====

  // Store order created webhook
  app.post("/api/webhooks/store-order-created", async (req, res) => {
    try {
      const { externalOrderId, customer, totalAmount, items, phone } = req.body;

      if (!externalOrderId || !customer || !totalAmount || !phone) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const normalizedPhone = normalizePhoneNumber(phone);

      // Create or get customer
      let customerRecord = await storage.getCustomerByPhone(normalizedPhone);
      if (!customerRecord) {
        customerRecord = await storage.createCustomer({
          fullName: customer.name || customer.fullName,
          phone: normalizedPhone,
          email: customer.email || null
        });
      }

      // Create order with transaction-safe sequence generation
      const currentYear = getCurrentYear();
      const order = await storage.createOrderWithSequence({
        externalOrderId,
        customerId: customerRecord.id,
        totalAmount,
        status: "PENDING_MEASUREMENT",
        progressPercent: 5,
        currentStageId: null
      }, currentYear);

      // Create default stages
      const stageTypes = [
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
      ];

      const stages = [];
      for (const stageType of stageTypes) {
        const stage = await storage.createStage({
          orderId: order.id,
          stageType: stageType as any,
          status: stageType === "ORDER_RECEIVED" ? "DONE" : "PENDING",
          startedAt: stageType === "ORDER_RECEIVED" ? new Date() : null,
          completedAt: stageType === "ORDER_RECEIVED" ? new Date() : null,
          notes: stageType === "ORDER_RECEIVED" ? "Order confirmed and payment received" : null
        });
        
        if (stageType === "ORDER_RECEIVED") {
          await storage.updateOrder(order.id, { currentStageId: stage.id });
        }
        
        stages.push(stage);
      }

      // Create order received event
      await storage.createEvent({
        orderId: order.id,
        stageId: stages[0].id,
        eventType: "STATUS_CHANGE",
        description: "Order received and confirmed",
        createdByUserId: null
      });

      // Send email
      await emailService.sendOrderReceivedEmail(customerRecord, order);

      res.json({ order, stages });
    } catch (error) {
      console.error("Store webhook error:", error);
      res.status(500).json({ error: "Failed to process order" });
    }
  });

  // Internal status update webhook
  app.post("/api/webhooks/internal-status-update", async (req, res) => {
    try {
      const { externalOrderId, stageType, status, notes, progressPercent } = req.body;

      if (!externalOrderId || !stageType) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const order = await storage.getOrderByExternalId(externalOrderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Find the stage
      const stages = await storage.getStagesByOrderId(order.id);
      const stage = stages.find(s => s.stageType === stageType);
      
      if (!stage) {
        return res.status(404).json({ error: "Stage not found" });
      }

      // Update stage
      const updates: any = {};
      if (status) updates.status = status;
      if (notes) updates.notes = notes;
      if (status === "IN_PROGRESS" && !stage.startedAt) {
        updates.startedAt = new Date();
      }
      if (status === "DONE" && !stage.completedAt) {
        updates.completedAt = new Date();
      }

      const updatedStage = await storage.updateStage(stage.id, updates);

      // Update order progress
      if (progressPercent !== undefined) {
        await storage.updateOrder(order.id, { progressPercent });
      }

      // Create event
      await storage.createEvent({
        orderId: order.id,
        stageId: stage.id,
        eventType: "STATUS_CHANGE",
        description: `Stage ${stageType} updated to ${status}`,
        createdByUserId: null
      });

      res.json({ stage: updatedStage, order });
    } catch (error) {
      console.error("Internal status update error:", error);
      res.status(500).json({ error: "Failed to update status" });
    }
  });

  // ===== SETUP ENDPOINTS (Production) =====
  
  // Initialize admin user (one-time setup for production)
  // Requires SETUP_SECRET environment variable
  app.post("/api/setup/init-admin", async (req, res) => {
    try {
      const SETUP_SECRET = process.env.SETUP_SECRET;
      
      // Refuse to run if SETUP_SECRET is not configured
      if (!SETUP_SECRET) {
        return res.status(503).json({ error: "Setup endpoint not configured" });
      }
      
      const { secret } = req.body;
      
      // Verify setup secret
      if (!secret || secret !== SETUP_SECRET) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Check if any admin user already exists
      const existingAdmin = await storage.getUserByEmail("admin@evia.com");
      if (existingAdmin) {
        return res.status(400).json({ 
          error: "Admin user already exists",
          message: "Setup has already been completed"
        });
      }
      
      // Create admin user
      const passwordHash = await bcrypt.hash("admin123", 10);
      const adminUser = await storage.createUser({
        name: "Admin User",
        email: "admin@evia.com",
        passwordHash,
        role: "ADMIN"
      });
      
      console.log("✅ Production admin user created successfully");
      
      res.json({
        success: true,
        message: "Admin user created successfully",
        user: {
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role
        },
        credentials: {
          email: "admin@evia.com",
          password: "admin123",
          note: "Please change this password after first login"
        }
      });
    } catch (error) {
      console.error("Setup error:", error);
      res.status(500).json({ error: "Failed to initialize admin user" });
    }
  });

  // ===== ADMIN ENDPOINTS =====

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // Get all orders with filters
  app.get("/api/admin/orders", authenticateToken, async (req, res) => {
    try {
      const { status, stageType, fromDate, toDate } = req.query;

      let orders;
      if (fromDate && toDate) {
        orders = await storage.getOrdersByDateRange(
          new Date(fromDate as string),
          new Date(toDate as string)
        );
      } else if (status && status !== "all") {
        orders = await storage.getOrdersByStatus(status as string);
      } else {
        orders = await storage.getAllOrders();
      }

      // Get customer info and current stage for each order
      const ordersWithDetails = await Promise.all(
        orders.map(async (order) => {
          const customer = await storage.getCustomerById(order.customerId);
          const stages = await storage.getStagesByOrderId(order.id);
          const currentStage = stages.find(s => s.id === order.currentStageId) || stages[0];

          return {
            ...order,
            customerName: customer?.fullName,
            phone: customer?.phone,
            email: customer?.email,
            currentStage: currentStage?.stageType,
            createdAt: order.createdAt
          };
        })
      );

      res.json(ordersWithDetails);
    } catch (error) {
      console.error("Get orders error:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Create new order (admin only)
  app.post("/api/admin/orders", authenticateToken, async (req, res) => {
    try {
      // Validate request body
      const createOrderSchema = z.object({
        customerName: z.string().min(1, "Customer name is required"),
        phone: z.string().min(1, "Phone number is required"),
        email: z.string().email().optional().or(z.literal("")),
        totalAmount: z.coerce.number().positive("Total amount must be positive"),
        externalOrderId: z.string().optional()
      });

      const validatedData = createOrderSchema.parse(req.body);
      const { customerName, phone, email, totalAmount, externalOrderId } = validatedData;

      const normalizedPhone = normalizePhoneNumber(phone);

      // Create or get customer
      let customerRecord = await storage.getCustomerByPhone(normalizedPhone);
      if (!customerRecord) {
        customerRecord = await storage.createCustomer({
          fullName: customerName,
          phone: normalizedPhone,
          email: email || null
        });
      }

      // Use provided externalOrderId or generate one
      const finalExternalOrderId = externalOrderId || `EXT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Create order with transaction-safe sequence generation
      const currentYear = getCurrentYear();
      const order = await storage.createOrderWithSequence({
        externalOrderId: finalExternalOrderId,
        customerId: customerRecord.id,
        totalAmount: totalAmount.toString(),
        status: "PENDING_MEASUREMENT",
        progressPercent: 5,
        currentStageId: null
      }, currentYear);

      // Create default stages
      const stageTypes = [
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
      ];

      const stages = [];
      for (const stageType of stageTypes) {
        const stage = await storage.createStage({
          orderId: order.id,
          stageType: stageType as any,
          status: stageType === "ORDER_RECEIVED" ? "DONE" : "PENDING",
          startedAt: stageType === "ORDER_RECEIVED" ? new Date() : null,
          completedAt: stageType === "ORDER_RECEIVED" ? new Date() : null,
          notes: stageType === "ORDER_RECEIVED" ? "Order confirmed and payment received" : null
        });
        
        if (stageType === "ORDER_RECEIVED") {
          await storage.updateOrder(order.id, { currentStageId: stage.id });
        }
        
        stages.push(stage);
      }

      // Create order received event
      await storage.createEvent({
        orderId: order.id,
        stageId: stages[0].id,
        eventType: "STATUS_CHANGE",
        description: "Order created by admin",
        createdByUserId: (req as any).user.userId
      });

      // Send email
      await emailService.sendOrderReceivedEmail(customerRecord, order);

      res.json({ order, customer: customerRecord, stages });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Get single order details
  app.get("/api/admin/orders/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;

      const order = await storage.getOrderById(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const stages = await storage.getStagesByOrderId(id);
      const events = await storage.getEventsByOrderId(id);
      const media = await storage.getMediaByOrderId(id);
      const appointment = await storage.getAppointmentByOrderId(id);
      const rating = await storage.getRatingByOrderId(id);

      // Get customer info by ID
      const customer = await storage.getCustomerById(order.customerId);

      res.json({
        order,
        customer,
        stages,
        events,
        media,
        appointment,
        rating
      });
    } catch (error) {
      console.error("Get order details error:", error);
      res.status(500).json({ error: "Failed to fetch order details" });
    }
  });

  // Update order status
  app.patch("/api/admin/orders/:id/status", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, progressPercent } = req.body;

      const updates: any = {};
      if (status) updates.status = status;
      if (progressPercent !== undefined) updates.progressPercent = progressPercent;

      const updatedOrder = await storage.updateOrder(id, updates);
      if (!updatedOrder) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Create event
      await storage.createEvent({
        orderId: id,
        stageId: null,
        eventType: "STATUS_CHANGE",
        description: `Order status updated to ${status}`,
        createdByUserId: (req as any).user.userId
      });

      res.json(updatedOrder);
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  // Update stage
  app.patch("/api/admin/orders/:id/stages/:stageId", authenticateToken, async (req, res) => {
    try {
      const { id, stageId } = req.params;
      const { status, notes } = req.body;

      const stage = await storage.getStageById(stageId);
      if (!stage || stage.orderId !== id) {
        return res.status(404).json({ error: "Stage not found" });
      }

      const updates: any = {};
      if (status) updates.status = status;
      if (notes !== undefined) updates.notes = notes;

      // Set timestamps based on status
      if (status === "IN_PROGRESS" && !stage.startedAt) {
        updates.startedAt = new Date();
      }
      if (status === "DONE" && !stage.completedAt) {
        updates.completedAt = new Date();
      }

      const updatedStage = await storage.updateStage(stageId, updates);

      // Create event
      await storage.createEvent({
        orderId: id,
        stageId,
        eventType: notes ? "NOTE_ADDED" : "STATUS_CHANGE",
        description: notes ? `Note added: ${notes}` : `Stage status updated to ${status}`,
        createdByUserId: (req as any).user.userId
      });

      // Check if we should send email for specific stages
      const order = await storage.getOrderById(id);
      if (order && updatedStage) {
        const customer = await storage.getCustomerByPhone(order.customerId as any);
        
        if (customer && ["DESIGN_APPROVAL", "READY_FOR_INSTALL", "INSTALLED"].includes(updatedStage.stageType)) {
          await emailService.sendStageChangedEmail(customer, order, updatedStage);
        }
      }

      res.json(updatedStage);
    } catch (error) {
      console.error("Update stage error:", error);
      res.status(500).json({ error: "Failed to update stage" });
    }
  });

  // Create new stage
  app.post("/api/admin/orders/:id/stages", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { stageType, status, notes } = req.body;

      if (!stageType) {
        return res.status(400).json({ error: "Stage type is required" });
      }

      // Verify order exists
      const order = await storage.getOrderById(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const stage = await storage.createStage({
        orderId: id,
        stageType,
        status: status || "PENDING",
        startedAt: status === "IN_PROGRESS" ? new Date() : null,
        completedAt: status === "DONE" ? new Date() : null,
        notes: notes || null
      });

      await storage.createEvent({
        orderId: id,
        stageId: stage.id,
        eventType: "STATUS_CHANGE",
        description: `New stage added: ${stageType}`,
        createdByUserId: (req as any).user.userId
      });

      res.json(stage);
    } catch (error) {
      console.error("Create stage error:", error);
      res.status(500).json({ error: "Failed to create stage" });
    }
  });

  // Delete stage
  app.delete("/api/admin/orders/:id/stages/:stageId", authenticateToken, async (req, res) => {
    try {
      const { id, stageId } = req.params;

      // Verify order exists
      const order = await storage.getOrderById(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const stage = await storage.getStageById(stageId);
      if (!stage || stage.orderId !== id) {
        return res.status(404).json({ error: "Stage not found" });
      }

      // Prevent deletion of in-progress or completed stages
      if (stage.status === "IN_PROGRESS" || stage.status === "DONE") {
        return res.status(400).json({ 
          error: "Cannot delete stages that are in progress or completed" 
        });
      }

      await storage.deleteStage(stageId);

      await storage.createEvent({
        orderId: id,
        stageId: null,
        eventType: "STATUS_CHANGE",
        description: `Stage deleted: ${stage.stageType}`,
        createdByUserId: (req as any).user.userId
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Delete stage error:", error);
      res.status(500).json({ error: "Failed to delete stage" });
    }
  });

  // Add media to order
  app.post("/api/admin/orders/:id/media", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { url, type, stageId } = req.body;

      if (!url || !type) {
        return res.status(400).json({ error: "URL and type are required" });
      }

      const media = await storage.createMedia({
        orderId: id,
        stageId: stageId || null,
        url,
        type
      });

      // Create event
      await storage.createEvent({
        orderId: id,
        stageId: stageId || null,
        eventType: "MEDIA_ADDED",
        description: `Media added: ${type}`,
        createdByUserId: (req as any).user.userId
      });

      res.json(media);
    } catch (error) {
      console.error("Add media error:", error);
      res.status(500).json({ error: "Failed to add media" });
    }
  });

  // Send email update
  app.post("/api/admin/orders/:id/email", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { subject, message } = req.body;

      if (!subject || !message) {
        return res.status(400).json({ error: "Subject and message are required" });
      }

      const order = await storage.getOrderById(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const customer = await storage.getCustomerById(order.customerId);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      await emailService.sendCustomEmail(customer, order, subject, message);

      await storage.createEvent({
        orderId: id,
        stageId: null,
        eventType: "EMAIL_SENT",
        description: `Email sent: ${subject}`,
        createdByUserId: (req as any).user.userId
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Send email error:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Cancel order
  app.post("/api/admin/orders/:id/cancel", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const order = await storage.getOrderById(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      // Update order status to CANCELLED
      await storage.updateOrder(id, { status: "CANCELLED" });

      // Cancel associated appointment if exists
      const appointment = await storage.getAppointmentByOrderId(id);
      if (appointment) {
        await storage.deleteAppointment(appointment.id);
      }

      await storage.createEvent({
        orderId: id,
        stageId: null,
        eventType: "ORDER_CANCELLED",
        description: reason || "Order cancelled by admin",
        createdByUserId: (req as any).user.userId
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Cancel order error:", error);
      res.status(500).json({ error: "Failed to cancel order" });
    }
  });

  // Create or update appointment
  app.post("/api/admin/orders/:id/appointment", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { scheduledAt, locationAddress, notes } = req.body;

      if (!scheduledAt || !locationAddress) {
        return res.status(400).json({ error: "Scheduled time and location are required" });
      }

      const existingAppointment = await storage.getAppointmentByOrderId(id);

      let appointment;
      if (existingAppointment) {
        appointment = await storage.updateAppointment(id, {
          scheduledAt: new Date(scheduledAt),
          locationAddress,
          notes: notes || null
        });
      } else {
        appointment = await storage.createAppointment({
          orderId: id,
          scheduledAt: new Date(scheduledAt),
          locationAddress,
          notes: notes || null
        });
      }

      // Create event
      await storage.createEvent({
        orderId: id,
        stageId: null,
        eventType: "APPOINTMENT_SET",
        description: `Installation appointment scheduled for ${new Date(scheduledAt).toLocaleString()}`,
        createdByUserId: (req as any).user.userId
      });

      // Send email
      const order = await storage.getOrderById(id);
      if (order && appointment) {
        const customer = await storage.getCustomerByPhone(order.customerId as any);
        if (customer) {
          await emailService.sendInstallationScheduledEmail(customer, appointment);
        }
      }

      res.json(appointment);
    } catch (error) {
      console.error("Appointment error:", error);
      res.status(500).json({ error: "Failed to save appointment" });
    }
  });

  // ===== OBJECT STORAGE ENDPOINTS =====
  // Referenced from blueprint:javascript_object_storage

  // Get presigned upload URL
  app.post("/api/admin/media/upload", authenticateToken, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Upload URL generation error:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  // Add media to order after upload
  app.post("/api/admin/orders/:orderId/media", authenticateToken, async (req, res) => {
    try {
      const { orderId } = req.params;
      const { mediaUrl, type, stageId } = req.body;

      if (!mediaUrl || !type) {
        return res.status(400).json({ error: "mediaUrl and type are required" });
      }

      const objectStorageService = new ObjectStorageService();
      const normalizedPath = await objectStorageService.trySetObjectEntityAclPolicy(
        mediaUrl,
        {
          owner: (req as any).user.userId,
          visibility: "public",
        }
      );

      const media = await storage.createMedia({
        orderId,
        url: normalizedPath,
        type,
        stageId: stageId || null
      });

      await storage.createEvent({
        orderId,
        stageId: stageId || null,
        eventType: "NOTE_ADDED",
        description: `Media file added: ${type}`,
        createdByUserId: (req as any).user.userId
      });

      res.json(media);
    } catch (error) {
      console.error("Media add error:", error);
      res.status(500).json({ error: "Failed to add media" });
    }
  });

  // Serve uploaded files (public read access via ACL)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      // Strip /objects/ prefix from the path
      const objectPath = req.params.objectPath;
      const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Object download error:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
