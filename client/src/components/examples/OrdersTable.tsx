import OrdersTable from "../OrdersTable";

export default function OrdersTableExample() {
  const mockOrders = [
    {
      id: "1",
      orderNumber: "EV-2024-0123",
      customerName: "Sarah Johnson",
      phone: "+1 (555) 123-4567",
      status: "DESIGN_APPROVAL",
      currentStage: "DESIGN_APPROVAL",
      progressPercent: 25,
      createdAt: "2024-01-15T10:00:00Z"
    },
    {
      id: "2",
      orderNumber: "EV-2024-0124",
      customerName: "Michael Chen",
      phone: "+1 (555) 234-5678",
      status: "IN_PRODUCTION",
      currentStage: "PRODUCTION_CUTTING",
      progressPercent: 45,
      createdAt: "2024-01-14T14:30:00Z"
    },
    {
      id: "3",
      orderNumber: "EV-2024-0125",
      customerName: "Emma Davis",
      phone: "+1 (555) 345-6789",
      status: "QUALITY_CHECK",
      currentStage: "QUALITY_CHECK",
      progressPercent: 75,
      createdAt: "2024-01-13T09:15:00Z"
    }
  ];

  return (
    <div className="p-6">
      <OrdersTable 
        orders={mockOrders}
        onViewOrder={(id) => console.log("View order:", id)}
      />
    </div>
  );
}
