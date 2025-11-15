/**
 * Standard predefined stage types in the Ivea order workflow.
 * These stage types should always use translation keys for bilingual support.
 * Custom stage types created by admins will use their displayName instead.
 */
export const STANDARD_STAGE_TYPES = [
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
] as const;

export type StandardStageType = typeof STANDARD_STAGE_TYPES[number];
