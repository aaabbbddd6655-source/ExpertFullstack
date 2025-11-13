import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, CheckCircle, Clock } from "lucide-react";
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

  // Calculate statistics
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o: any) => o.status === "COMPLETED").length;
  const activeOrders = orders.filter((o: any) => 
    o.status !== "COMPLETED" && o.status !== "CANCELLED"
  ).length;
  const pendingOrders = orders.filter((o: any) => 
    o.status === "PENDING_MEASUREMENT" || o.status === "DESIGN_APPROVAL"
  ).length;

  // Get unique customers count
  const uniqueCustomers = new Set(orders.map((o: any) => o.phone)).size;

  // Recent orders (last 5)
  const recentOrders = [...orders]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders,
      description: "All time orders",
      icon: Package,
      color: "text-blue-600"
    },
    {
      title: "Active Orders",
      value: activeOrders,
      description: "Currently in progress",
      icon: Clock,
      color: "text-orange-600"
    },
    {
      title: "Completed",
      value: completedOrders,
      description: "Successfully delivered",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Customers",
      value: uniqueCustomers,
      description: "Unique customers",
      icon: Users,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your order management system
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders yet</p>
              ) : (
                recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{order.externalOrderId}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customerName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{order.progressPercent}%</p>
                      <p className="text-xs text-muted-foreground">
                        {order.currentStage?.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>Orders by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingOrders > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending</span>
                  <span className="text-sm font-medium">{pendingOrders}</span>
                </div>
              )}
              {activeOrders > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">In Progress</span>
                  <span className="text-sm font-medium">{activeOrders}</span>
                </div>
              )}
              {completedOrders > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completed</span>
                  <span className="text-sm font-medium">{completedOrders}</span>
                </div>
              )}
              {totalOrders === 0 && (
                <p className="text-sm text-muted-foreground">No orders to display</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
