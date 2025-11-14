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
  Bell
} from "lucide-react";
import { getOrders } from "@/lib/api";
import { getToken } from "@/lib/auth";

export default function AdminDashboardPage() {
  const token = getToken();

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      if (!token) throw new Error("Not authenticated");
      return getOrders(token);
    },
    enabled: !!token
  });

  // Today Orders Statistics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayOrders = orders.filter((o: any) => {
    const orderDate = new Date(o.createdAt);
    orderDate.setHours(0, 0, 0, 0);
    return orderDate.getTime() === today.getTime();
  });

  const newOrders = todayOrders.length;
  const inProgressOrders = orders.filter((o: any) => 
    o.status === "IN_PRODUCTION" || 
    o.status === "MATERIALS_PROCUREMENT" ||
    o.status === "QUALITY_CHECK"
  ).length;
  const completedOrders = orders.filter((o: any) => o.status === "COMPLETED").length;
  const delayedOrders = 3; // Sample data

  // Production Pipeline Counts
  const rawMaterials = orders.filter((o: any) => o.status === "MATERIALS_PROCUREMENT").length;
  const cutting = orders.filter((o: any) => o.status === "IN_PRODUCTION").length;
  const sewing = orders.filter((o: any) => o.status === "IN_PRODUCTION").length;
  const finishing = orders.filter((o: any) => o.status === "IN_PRODUCTION").length;
  const qualityCheck = orders.filter((o: any) => o.status === "QUALITY_CHECK").length;
  const delivery = orders.filter((o: any) => o.status === "PACKAGING").length;
  const installation = orders.filter((o: any) => o.status === "READY_FOR_INSTALL").length;

  // Workload Overview
  const inProduction = orders.filter((o: any) => o.status === "IN_PRODUCTION").length;
  const inDelivery = orders.filter((o: any) => 
    o.status === "PACKAGING" || o.status === "READY_FOR_INSTALL"
  ).length;
  const inInstallation = orders.filter((o: any) => o.status === "READY_FOR_INSTALL").length;
  const awaitingPayment = orders.filter((o: any) => 
    o.status === "PENDING_MEASUREMENT" || o.status === "DESIGN_APPROVAL"
  ).length;

  // Sample Delayed Orders Data
  const delayedOrdersData = [
    { id: "IV-1234567", customer: "Ahmed Hassan", stage: "Quality Check", days: 5 },
    { id: "IV-2345678", customer: "Sara Mohamed", stage: "Delivery", days: 3 },
    { id: "IV-3456789", customer: "Omar Khalil", stage: "Installation", days: 7 }
  ];

  // Sample Notifications
  const notifications = [
    { message: "New order received from Ahmed Hassan", time: "2 hours ago" },
    { message: "Order IV-1234567 moved to Quality Check", time: "4 hours ago" },
    { message: "Installation scheduled for tomorrow", time: "5 hours ago" },
    { message: "Payment confirmed for Order IV-9876543", time: "6 hours ago" },
    { message: "Customer rating received: 5 stars", time: "8 hours ago" }
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-serif font-semibold" data-testid="text-dashboard-title">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your order management system
        </p>
      </div>

      {/* 1. Today Orders - 4 Stats Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Today Orders</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card data-testid="card-new-orders">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Orders</CardTitle>
              <Package className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-new-orders-count">{newOrders}</div>
              <p className="text-xs text-muted-foreground">Received today</p>
            </CardContent>
          </Card>

          <Card data-testid="card-in-progress">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <TrendingUp className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-in-progress-count">{inProgressOrders}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card data-testid="card-completed">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-completed-count">{completedOrders}</div>
              <p className="text-xs text-muted-foreground">Successfully delivered</p>
            </CardContent>
          </Card>

          <Card data-testid="card-delayed">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delayed</CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-delayed-count">{delayedOrders}</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 2. Production Pipeline */}
      <Card data-testid="card-production-pipeline">
        <CardHeader>
          <CardTitle>Production Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-7">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Package className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold" data-testid="text-pipeline-materials">{rawMaterials}</div>
              <p className="text-xs text-muted-foreground">Raw Materials</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Scissors className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold" data-testid="text-pipeline-cutting">{cutting}</div>
              <p className="text-xs text-muted-foreground">Cutting</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold" data-testid="text-pipeline-sewing">{sewing}</div>
              <p className="text-xs text-muted-foreground">Sewing</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Wrench className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold" data-testid="text-pipeline-finishing">{finishing}</div>
              <p className="text-xs text-muted-foreground">Final Finishing</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                <ClipboardCheck className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold" data-testid="text-pipeline-quality">{qualityCheck}</div>
              <p className="text-xs text-muted-foreground">Quality Check</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Truck className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold" data-testid="text-pipeline-delivery">{delivery}</div>
              <p className="text-xs text-muted-foreground">Delivery</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Wrench className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold" data-testid="text-pipeline-installation">{installation}</div>
              <p className="text-xs text-muted-foreground">Installation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 3. Delayed Orders Table */}
        <Card data-testid="card-delayed-orders">
          <CardHeader>
            <CardTitle>Delayed Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left text-xs font-medium text-muted-foreground pb-2">Order ID</th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-2">Customer Name</th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-2">Current Stage</th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-2">Days Delayed</th>
                  </tr>
                </thead>
                <tbody>
                  {delayedOrdersData.map((order, idx) => (
                    <tr key={idx} className="border-b last:border-0" data-testid={`row-delayed-order-${idx}`}>
                      <td className="py-3 text-sm font-medium">{order.id}</td>
                      <td className="py-3 text-sm">{order.customer}</td>
                      <td className="py-3 text-sm">{order.stage}</td>
                      <td className="py-3 text-sm">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-red-50 text-red-700 text-xs font-medium">
                          {order.days} days
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 4. Workload Overview */}
        <Card data-testid="card-workload-overview">
          <CardHeader>
            <CardTitle>Workload Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">In Production</p>
                <p className="text-2xl font-bold" data-testid="text-workload-production">{inProduction}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">In Delivery</p>
                <p className="text-2xl font-bold" data-testid="text-workload-delivery">{inDelivery}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">In Installation</p>
                <p className="text-2xl font-bold" data-testid="text-workload-installation">{inInstallation}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Awaiting Payment</p>
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
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.map((notif, idx) => (
              <div 
                key={idx} 
                className="flex items-start justify-between py-2 border-b last:border-0"
                data-testid={`notification-${idx}`}
              >
                <p className="text-sm">{notif.message}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                  {notif.time}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
