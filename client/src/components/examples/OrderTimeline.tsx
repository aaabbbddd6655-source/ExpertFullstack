import OrderTimeline from "../OrderTimeline";

export default function OrderTimelineExample() {
  const mockStages = [
    {
      id: "1",
      stageType: "ORDER_RECEIVED",
      status: "DONE" as const,
      completedAt: "2024-01-15T10:00:00Z",
      notes: "Your order has been successfully received and confirmed."
    },
    {
      id: "2",
      stageType: "SITE_MEASUREMENT",
      status: "DONE" as const,
      startedAt: "2024-01-16T09:00:00Z",
      completedAt: "2024-01-16T11:00:00Z",
      notes: "Measurements completed. Window dimensions: 120\" x 84\""
    },
    {
      id: "3",
      stageType: "DESIGN_APPROVAL",
      status: "IN_PROGRESS" as const,
      startedAt: "2024-01-17T08:00:00Z",
      notes: "Design mockup sent to your email. Please review and approve."
    },
    {
      id: "4",
      stageType: "MATERIALS_PROCUREMENT",
      status: "PENDING" as const
    },
    {
      id: "5",
      stageType: "PRODUCTION_CUTTING",
      status: "PENDING" as const
    },
    {
      id: "6",
      stageType: "QUALITY_CHECK",
      status: "PENDING" as const
    }
  ];

  return (
    <div className="max-w-3xl mx-auto p-6">
      <OrderTimeline stages={mockStages} />
    </div>
  );
}
