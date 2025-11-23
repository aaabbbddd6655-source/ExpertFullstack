import { storage } from "./storage";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Starting database seed...\n");

  // Create admin user
  console.log("Creating admin user...");
  const passwordHash = await bcrypt.hash("admin123", 10);
  
  try {
    const admin = await storage.createUser({
      name: "Admin User",
      email: "admin@evia.com",
      passwordHash,
      role: "ADMIN"
    });
    console.log(`✅ Created admin user: ${admin.email}`);
  } catch (error) {
    console.log("ℹ️  Admin user already exists");
  }

  // Create sample customers
  console.log("\nCreating sample customers...");
  const customerData = [
    { fullName: "Sarah Johnson", phone: "+15551234567", email: "sarah.j@email.com" },
    { fullName: "Michael Chen", phone: "+15552345678", email: "michael.c@email.com" },
    { fullName: "Emma Davis", phone: "+15553456789", email: "emma.d@email.com" },
  ];

  const customers = [];
  for (const data of customerData) {
    try {
      const customer = await storage.createCustomer(data);
      customers.push(customer);
      console.log(`✅ Created customer: ${customer.fullName}`);
    } catch (error) {
      const existing = await storage.getCustomerByPhone(data.phone);
      if (existing) {
        customers.push(existing);
        console.log(`ℹ️  Customer already exists: ${existing.fullName}`);
      }
    }
  }

  // Create sample orders with stages
  console.log("\nCreating sample orders...");
  
  const ordersData = [
    {
      customer: customers[0],
      externalOrderId: "EV-2024-0123",
      totalAmount: 3500,
      status: "DESIGN_APPROVAL" as const,
      progressPercent: 25,
      completedStages: ["ORDER_RECEIVED", "SITE_MEASUREMENT"],
      currentStage: "DESIGN_APPROVAL"
    },
    {
      customer: customers[1],
      externalOrderId: "EV-2024-0124",
      totalAmount: 4200,
      status: "IN_PRODUCTION" as const,
      progressPercent: 55,
      completedStages: ["ORDER_RECEIVED", "SITE_MEASUREMENT", "DESIGN_APPROVAL", "MATERIALS_PROCUREMENT", "PRODUCTION_CUTTING"],
      currentStage: "PRODUCTION_STITCHING"
    },
    {
      customer: customers[2],
      externalOrderId: "EV-2024-0125",
      totalAmount: 2800,
      status: "QUALITY_CHECK" as const,
      progressPercent: 75,
      completedStages: [
        "ORDER_RECEIVED", 
        "SITE_MEASUREMENT", 
        "DESIGN_APPROVAL", 
        "MATERIALS_PROCUREMENT", 
        "PRODUCTION_CUTTING", 
        "PRODUCTION_STITCHING", 
        "PRODUCTION_ASSEMBLY", 
        "FINISHING"
      ],
      currentStage: "QUALITY_CHECK"
    }
  ];

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

  for (const orderData of ordersData) {
    try {
      const existingOrder = await storage.getOrderByExternalId(orderData.externalOrderId);
      if (existingOrder) {
        console.log(`ℹ️  Order already exists: ${orderData.externalOrderId}`);
        continue;
      }

      const currentYear = new Date().getFullYear();
      const order = await storage.createOrderWithSequence({
        externalOrderId: orderData.externalOrderId,
        customerId: orderData.customer.id,
        totalAmount: orderData.totalAmount,
        status: orderData.status,
        progressPercent: orderData.progressPercent,
        currentStageId: null
      }, currentYear);

      console.log(`✅ Created order: ${order.externalOrderId}`);

      // Create stages for this order
      let currentStageId: string | null = null;
      
      for (const stageType of stageTypes) {
        const isCompleted = orderData.completedStages.includes(stageType);
        const isCurrent = orderData.currentStage === stageType;
        
        let status: "PENDING" | "IN_PROGRESS" | "DONE" = "PENDING";
        let startedAt = null;
        let completedAt = null;
        let notes = null;

        if (isCompleted) {
          status = "DONE";
          startedAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
          completedAt = new Date(startedAt.getTime() + Math.random() * 24 * 60 * 60 * 1000);
          
          if (stageType === "ORDER_RECEIVED") {
            notes = "Order confirmed and payment received";
          } else if (stageType === "SITE_MEASUREMENT") {
            notes = "Measurements completed. Window dimensions: 120\" x 84\"";
          }
        } else if (isCurrent) {
          status = "IN_PROGRESS";
          startedAt = new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000);
          
          if (stageType === "DESIGN_APPROVAL") {
            notes = "Design mockup sent to customer for review";
          } else if (stageType === "PRODUCTION_STITCHING") {
            notes = "Production in progress - expert stitching underway";
          } else if (stageType === "QUALITY_CHECK") {
            notes = "Performing rigorous quality inspection";
          }
        }

        const stage = await storage.createStage({
          orderId: order.id,
          stageType: stageType as any,
          status,
          startedAt,
          completedAt,
          notes
        });

        if (isCurrent) {
          currentStageId = stage.id;
        }
      }

      // Update order with current stage
      if (currentStageId) {
        await storage.updateOrder(order.id, { currentStageId });
      }

      // Create some events
      await storage.createEvent({
        orderId: order.id,
        stageId: null,
        eventType: "STATUS_CHANGE",
        description: "Order received and confirmed",
        createdByUserId: null
      });

    } catch (error) {
      console.error(`❌ Error creating order ${orderData.externalOrderId}:`, error);
    }
  }

  console.log("\n✨ Database seed completed!\n");
  console.log("📝 Login credentials:");
  console.log("   Email: admin@evia.com");
  console.log("   Password: admin123\n");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
