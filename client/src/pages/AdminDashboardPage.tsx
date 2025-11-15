import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  Scissors,
  Truck,
  Wrench,
  ClipboardCheck,
  Bell,
  Calendar
} from "lucide-react";
import { getOrders } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { generateShortOrderId } from "@/lib/utils";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n";

type DateFilter = "today" | "thisWeek" | "thisMonth" | "custom";

export default function AdminDashboardPage() {
  const token = getToken();
  const { t } = useTranslation();
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      if (!token) throw new Error("Not authenticated");
      return getOrders(token);
    },
    enabled: !!token
  });

  // Calculate date range based on filter
  const getDateRange = () => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (dateFilter) {
      case "today":
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "thisWeek":
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate.setDate(now.getDate() - diff);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "thisMonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case "custom":
        if (customStartDate) {
          startDate = new Date(customStartDate);
          startDate.setHours(0, 0, 0, 0);
        }
        if (customEndDate) {
          endDate = new Date(customEndDate);
          endDate.setHours(23, 59, 59, 999);
        }
        break;
    }

    return { startDate, endDate };
  };

  const { startDate, endDate } = getDateRange();

  // Filter orders by date range
  const filteredOrders = orders.filter((o: any) => {
    const orderDate = new Date(o.createdAt);
    return orderDate >= startDate && orderDate <= endDate;
  });

  // Statistics based on filtered orders
  const newOrders = filteredOrders.length;
  const inProgressOrders = filteredOrders.filter((o: any) => 
    o.status === "IN_PRODUCTION" || 
    o.status === "MATERIALS_PROCUREMENT" ||
    o.status === "QUALITY_CHECK"
  ).length;
  const completedOrders = filteredOrders.filter((o: any) => o.status === "COMPLETED").length;
  
  // Calculate delayed orders based on actual data
  const delayedOrders = filteredOrders.filter((o: any) => {
    if (!o.createdAt) return false;
    const orderDate = new Date(o.createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    // Consider delayed if older than 7 days and not completed
    return daysDiff > 7 && o.status !== "COMPLETED";
  }).length;

  // Production Pipeline Counts
  const rawMaterials = filteredOrders.filter((o: any) => o.status === "MATERIALS_PROCUREMENT").length;
  const cutting = filteredOrders.filter((o: any) => o.status === "IN_PRODUCTION").length;
  const sewing = filteredOrders.filter((o: any) => o.status === "IN_PRODUCTION").length;
  const finishing = filteredOrders.filter((o: any) => o.status === "IN_PRODUCTION").length;
  const qualityCheck = filteredOrders.filter((o: any) => o.status === "QUALITY_CHECK").length;
  const delivery = filteredOrders.filter((o: any) => o.status === "PACKAGING").length;
  const installation = filteredOrders.filter((o: any) => o.status === "READY_FOR_INSTALL").length;

  // Workload Overview
  const inProduction = filteredOrders.filter((o: any) => o.status === "IN_PRODUCTION").length;
  const inDelivery = filteredOrders.filter((o: any) => 
    o.status === "PACKAGING" || o.status === "READY_FOR_INSTALL"
  ).length;
  const inInstallation = filteredOrders.filter((o: any) => o.status === "READY_FOR_INSTALL").length;
  const awaitingPayment = filteredOrders.filter((o: any) => 
    o.status === "PENDING_MEASUREMENT" || o.status === "DESIGN_APPROVAL"
  ).length;

  // Delayed Orders Data from filtered orders
  const delayedOrdersData = filteredOrders
    .filter((o: any) => {
      if (!o.createdAt) return false;
      const orderDate = new Date(o.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff > 7 && o.status !== "COMPLETED";
    })
    .map((o: any) => {
      const orderDate = new Date(o.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: o.orderNumber || o.id,
        customer: o.customer?.fullName || "Unknown",
        stage: o.currentStage || o.status || "Unknown",
        days: daysDiff - 7 // Days beyond the 7-day threshold
      };
    })
    .slice(0, 5); // Show only top 5

  // Notifications from filtered orders (recent events)
  const notifications = filteredOrders
    .filter((o: any) => o.createdAt)
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((o: any) => ({
      message: `Order ${o.orderNumber || o.id} - ${o.status}`,
      time: new Date(o.createdAt).toLocaleDateString()
    }));

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-semibold" data-testid="text-dashboard-title">{t("admin.dashboard.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("admin.dashboard.subtitle")}
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <Select
            value={dateFilter}
            onValueChange={(value) => setDateFilter(value as DateFilter)}
          >
            <SelectTrigger className="w-full sm:w-[180px] gap-2" data-testid="select-date-filter">
              <Calendar className="w-4 h-4" />
              <SelectValue placeholder={t("common.dateRange")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today" data-testid="option-today">{t("common.today")}</SelectItem>
              <SelectItem value="thisWeek" data-testid="option-this-week">{t("common.thisWeek")}</SelectItem>
              <SelectItem value="thisMonth" data-testid="option-this-month">{t("common.thisMonth")}</SelectItem>
              <SelectItem value="custom" data-testid="option-custom">{t("common.custom")}</SelectItem>
            </SelectContent>
          </Select>

          {/* Custom Date Range Inputs */}
          {dateFilter === "custom" && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-[140px]"
                placeholder={t("common.from")}
                data-testid="input-start-date"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-[140px]"
                placeholder={t("common.to")}
                data-testid="input-end-date"
              />
            </div>
          )}
        </div>
      </div>

      {/* 1. Today Orders - 4 Stats Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          {dateFilter === "today" && t("common.today")} 
          {dateFilter === "thisWeek" && t("common.thisWeek")} 
          {dateFilter === "thisMonth" && t("common.thisMonth")} 
          {dateFilter === "custom" && t("common.custom")} {t("common.orders")}
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card data-testid="card-new-orders">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.stats.newOrders")}</CardTitle>
              <Package className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-new-orders-count">{newOrders}</div>
              <p className="text-xs text-muted-foreground">
                {dateFilter === "today" && t("admin.stats.receivedToday")}
                {dateFilter === "thisWeek" && t("admin.stats.receivedThisWeek")}
                {dateFilter === "thisMonth" && t("admin.stats.receivedThisMonth")}
                {dateFilter === "custom" && t("admin.stats.inSelectedRange")}
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-in-progress">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.stats.inProgress")}</CardTitle>
              <TrendingUp className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-in-progress-count">{inProgressOrders}</div>
              <p className="text-xs text-muted-foreground">{t("admin.stats.currentlyActive")}</p>
            </CardContent>
          </Card>

          <Card data-testid="card-completed">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.stats.completed")}</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-completed-count">{completedOrders}</div>
              <p className="text-xs text-muted-foreground">{t("admin.stats.successfullyDelivered")}</p>
            </CardContent>
          </Card>

          <Card data-testid="card-delayed">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("admin.stats.delayed")}</CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-delayed-count">{delayedOrders}</div>
              <p className="text-xs text-muted-foreground">{t("admin.stats.needsAttention")}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 2. Production Pipeline */}
      <Card data-testid="card-production-pipeline">
        <CardHeader>
          <CardTitle>{t("admin.dashboard.productionPipeline")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-7">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Package className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold" data-testid="text-pipeline-materials">{rawMaterials}</div>
              <p className="text-xs text-muted-foreground">{t("admin.dashboard.rawMaterials")}</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Scissors className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold" data-testid="text-pipeline-cutting">{cutting}</div>
              <p className="text-xs text-muted-foreground">{t("admin.dashboard.cutting")}</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold" data-testid="text-pipeline-sewing">{sewing}</div>
              <p className="text-xs text-muted-foreground">{t("admin.dashboard.sewing")}</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Wrench className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold" data-testid="text-pipeline-finishing">{finishing}</div>
              <p className="text-xs text-muted-foreground">{t("admin.dashboard.finalFinishing")}</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                <ClipboardCheck className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold" data-testid="text-pipeline-quality">{qualityCheck}</div>
              <p className="text-xs text-muted-foreground">{t("admin.dashboard.qualityCheck")}</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Truck className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold" data-testid="text-pipeline-delivery">{delivery}</div>
              <p className="text-xs text-muted-foreground">{t("admin.dashboard.delivery")}</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Wrench className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold" data-testid="text-pipeline-installation">{installation}</div>
              <p className="text-xs text-muted-foreground">{t("common.installation")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 3. Delayed Orders Table */}
        <Card data-testid="card-delayed-orders">
          <CardHeader>
            <CardTitle>{t("admin.dashboard.delayedOrders")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-start text-xs font-medium text-muted-foreground pb-2">{t("admin.dashboard.orderId")}</th>
                    <th className="text-start text-xs font-medium text-muted-foreground pb-2">{t("admin.dashboard.customerName")}</th>
                    <th className="text-start text-xs font-medium text-muted-foreground pb-2">{t("admin.dashboard.currentStage")}</th>
                    <th className="text-start text-xs font-medium text-muted-foreground pb-2">{t("admin.dashboard.daysDelayed")}</th>
                  </tr>
                </thead>
                <tbody>
                  {delayedOrdersData.length > 0 ? (
                    delayedOrdersData.map((order: { id: string; customer: string; stage: string; days: number }, idx: number) => (
                      <tr key={idx} className="border-b last:border-0" data-testid={`row-delayed-order-${idx}`}>
                        <td className="py-3 text-sm font-medium">{order.id}</td>
                        <td className="py-3 text-sm">{order.customer}</td>
                        <td className="py-3 text-sm">{order.stage}</td>
                        <td className="py-3 text-sm">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-50 text-red-700 text-xs font-medium">
                            {order.days} {t("common.days")}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                        {t("admin.dashboard.noDelayedOrders")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 4. Workload Overview */}
        <Card data-testid="card-workload-overview">
          <CardHeader>
            <CardTitle>{t("admin.dashboard.workloadOverview")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("admin.dashboard.inProduction")}</p>
                <p className="text-2xl font-bold" data-testid="text-workload-production">{inProduction}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("admin.dashboard.inDelivery")}</p>
                <p className="text-2xl font-bold" data-testid="text-workload-delivery">{inDelivery}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("admin.dashboard.inInstallation")}</p>
                <p className="text-2xl font-bold" data-testid="text-workload-installation">{inInstallation}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("admin.dashboard.awaitingPayment")}</p>
                <p className="text-2xl font-bold" data-testid="text-workload-payment">{awaitingPayment}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. Notifications */}
      <Card data-testid="card-notifications">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {t("admin.dashboard.notifications")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.length > 0 ? (
              notifications.map((notif: { message: string; time: string }, idx: number) => (
                <div 
                  key={idx} 
                  className="flex items-start justify-between gap-4 py-2 border-b last:border-0"
                  data-testid={`notification-${idx}`}
                >
                  <p className="text-sm">{notif.message}</p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {notif.time}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t("admin.dashboard.noActivity")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
