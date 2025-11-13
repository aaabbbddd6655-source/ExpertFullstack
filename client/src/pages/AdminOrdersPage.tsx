import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import OrdersTable from "@/components/OrdersTable";
import OrderFilters from "@/components/OrderFilters";
import NewOrderDialog from "@/components/NewOrderDialog";
import { Plus } from "lucide-react";
import { getOrders } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface AdminOrdersPageProps {
  onViewOrder: (orderId: string) => void;
}

export default function AdminOrdersPage({ onViewOrder }: AdminOrdersPageProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState("all");
  const [stage, setStage] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [showNewOrderDialog, setShowNewOrderDialog] = useState(false);

  const token = getToken();

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ["/api/admin/orders", status, stage, dateFrom?.toISOString(), dateTo?.toISOString()],
    queryFn: async () => {
      if (!token) {
        throw new Error("Not authenticated");
      }

      const filters: any = {};
      if (status !== "all") filters.status = status;
      if (stage !== "all") filters.stageType = stage;
      if (dateFrom) filters.fromDate = dateFrom.toISOString();
      if (dateTo) filters.toDate = dateTo.toISOString();

      return getOrders(token, filters);
    },
    enabled: !!token
  });

  if (error) {
    toast({
      title: "Error",
      description: "Failed to fetch orders. Please try again.",
      variant: "destructive"
    });
  }

  const formattedOrders = orders.map((order: any) => ({
    id: order.id,
    orderNumber: order.externalOrderId,
    customerName: order.customerName,
    phone: order.phone,
    status: order.status,
    currentStage: order.currentStage,
    progressPercent: order.progressPercent,
    createdAt: order.createdAt
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-semibold">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all customer orders
          </p>
        </div>
        <Button onClick={() => setShowNewOrderDialog(true)} data-testid="button-new-order">
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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      ) : (
        <OrdersTable orders={formattedOrders} onViewOrder={onViewOrder} />
      )}

      <NewOrderDialog 
        open={showNewOrderDialog} 
        onOpenChange={setShowNewOrderDialog} 
      />
    </div>
  );
}
