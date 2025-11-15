import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/lib/i18n";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  status: string;
  currentStage: string;
  progressPercent: number;
  createdAt: string;
}

interface OrdersTableProps {
  orders: Order[];
  onViewOrder: (orderId: string) => void;
}

export default function OrdersTable({ orders, onViewOrder }: OrdersTableProps) {
  const { t } = useTranslation();
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING_MEASUREMENT: "bg-yellow-600",
      DESIGN_APPROVAL: "bg-blue-600",
      IN_PRODUCTION: "bg-purple-600",
      QUALITY_CHECK: "bg-indigo-600",
      READY_FOR_INSTALL: "bg-green-600",
      INSTALLED: "bg-emerald-600",
      COMPLETED: "bg-green-700",
      CANCELLED: "bg-red-600"
    };
    return colors[status] || "bg-gray-600";
  };

  const formatStatus = (status: string) => {
    return status.split("_").map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(" ");
  };

  const formatStage = (stage: string) => {
    return stage.split("_").map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(" ");
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">{t('admin.orders.orderNumber')}</TableHead>
            <TableHead className="font-semibold">{t('admin.orders.customer')}</TableHead>
            <TableHead className="font-semibold">{t('admin.orders.phone')}</TableHead>
            <TableHead className="font-semibold">{t('admin.orders.status')}</TableHead>
            <TableHead className="font-semibold">{t('admin.orders.currentStage')}</TableHead>
            <TableHead className="font-semibold">{t('admin.orders.progress')}</TableHead>
            <TableHead className="font-semibold">{t('admin.orders.created')}</TableHead>
            <TableHead className="text-right font-semibold">{t('admin.orders.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
              <TableCell className="font-medium" data-testid={`text-order-number-${order.id}`}>
                {order.orderNumber}
              </TableCell>
              <TableCell data-testid={`text-customer-${order.id}`}>
                {order.customerName}
              </TableCell>
              <TableCell className="text-muted-foreground">{order.phone}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(order.status)}>
                  {formatStatus(order.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                {formatStage(order.currentStage)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={order.progressPercent} className="w-20 h-2" />
                  <span className="text-sm text-muted-foreground w-10">
                    {order.progressPercent}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onViewOrder(order.id)}
                  data-testid={`button-view-${order.id}`}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {t('common.viewDetails')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
