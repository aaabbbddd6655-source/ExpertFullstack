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
import { useTranslation } from "@/lib/i18n";

interface AdminOrdersPageProps {
  onViewOrder: (orderId: string) => void;
}

export default function AdminOrdersPage({ onViewOrder }: AdminOrdersPageProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
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
      title: t('common.error'),
      description: t('errors.general'),
      variant: "destructive"
    });
  }

  const formattedOrders = orders.map((order: any) => ({
    id: order.id,
    orderNumber: order.orderNumber,
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
          <h1 className="text-3xl font-serif font-semibold">{t('admin.orders.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('admin.orders.subtitle')}
          </p>
        </div>
        <Button onClick={() => setShowNewOrderDialog(true)} data-testid="button-new-order" className="gap-2">
          <Plus className="w-4 h-4" />
          {t('admin.orders.newOrder')}
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
          <p className="text-muted-foreground">{t('common.loading')}</p>
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
