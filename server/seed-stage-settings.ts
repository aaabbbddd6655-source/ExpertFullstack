import { db } from "./db";
import * as schema from "@shared/schema";

const DEFAULT_STAGE_SETTINGS = [
  { stageType: "ORDER_RECEIVED", displayName: "Order Received", sortOrder: 1, isActive: 1 },
  { stageType: "SITE_MEASUREMENT", displayName: "Site Measurement", sortOrder: 2, isActive: 1 },
  { stageType: "DESIGN_APPROVAL", displayName: "Design Approval", sortOrder: 3, isActive: 1 },
  { stageType: "MATERIALS_PROCUREMENT", displayName: "Materials Procurement", sortOrder: 4, isActive: 1 },
  { stageType: "PRODUCTION_CUTTING", displayName: "Production Cutting", sortOrder: 5, isActive: 1 },
  { stageType: "PRODUCTION_STITCHING", displayName: "Production Stitching", sortOrder: 6, isActive: 1 },
  { stageType: "PRODUCTION_ASSEMBLY", displayName: "Production Assembly", sortOrder: 7, isActive: 1 },
  { stageType: "FINISHING", displayName: "Finishing", sortOrder: 8, isActive: 1 },
  { stageType: "QUALITY_CHECK", displayName: "Quality Check", sortOrder: 9, isActive: 1 },
  { stageType: "PACKAGING", displayName: "Packaging", sortOrder: 10, isActive: 1 },
  { stageType: "DELIVERY_SCHEDULING", displayName: "Delivery Scheduling", sortOrder: 11, isActive: 1 },
  { stageType: "INSTALLATION", displayName: "Installation", sortOrder: 12, isActive: 1 },
  { stageType: "RATING", displayName: "Rating", sortOrder: 13, isActive: 1 }
] as const;

async function seedStageSettings() {
  console.log("Seeding stage type settings...");
  
  for (const setting of DEFAULT_STAGE_SETTINGS) {
    await db.insert(schema.stageTypeSettings)
      .values(setting as any)
      .onConflictDoNothing();
  }
  
  console.log("✅ Stage type settings seeded successfully");
}

seedStageSettings().catch(console.error);
