import { useState } from "react";
import { Button } from "@/components/ui/button";
import OrdersTable from "@/components/OrdersTable";
import OrderFilters from "@/components/OrderFilters";
import { Plus } from "lucide-react";

interface AdminOrdersPageProps {
  onViewOrder: (orderId: string) => void;
}

export default function AdminOrdersPage({ onViewOrder }: AdminOrdersPageProps) {
  const [status, setStatus] = useState("all");
  const [stage, setStage] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

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
    },
    {
      id: "4",
      orderNumber: "EV-2024-0126",
      customerName: "James Wilson",
      phone: "+1 (555) 456-7890",
      status: "READY_FOR_INSTALL",
      currentStage: "DELIVERY_SCHEDULING",
      progressPercent: 85,
      createdAt: "2024-01-12T16:45:00Z"
    },
    {
      id: "5",
      orderNumber: "EV-2024-0127",
      customerName: "Olivia Martinez",
      phone: "+1 (555) 567-8901",
      status: "COMPLETED",
      currentStage: "RATING",
      progressPercent: 100,
      createdAt: "2024-01-10T11:20:00Z"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-semibold">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all customer orders
          </p>
        </div>
        <Button data-testid="button-new-order">
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>
      </div>

      <OrderFilters
        selectedStatus={status}
        selectedStage={stage}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onStatusChange={setStatus}
        onStageChange={setStage}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onReset={() => {
          setStatus("all");
          setStage("all");
          setDateFrom(undefined);
          setDateTo(undefined);
        }}
      />

      <OrdersTable orders={mockOrders} onViewOrder={onViewOrder} />
    </div>
  );
}
