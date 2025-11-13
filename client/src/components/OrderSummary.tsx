import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Package, User, Phone, Calendar, DollarSign } from "lucide-react";

interface OrderSummaryProps {
  orderNumber: string;
  customerName: string;
  phone: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  progressPercent: number;
}

export default function OrderSummary({
  orderNumber,
  customerName,
  phone,
  createdAt,
  totalAmount,
  status,
  progressPercent
}: OrderSummaryProps) {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-serif mb-2" data-testid="text-order-number">
                Order {orderNumber}
              </CardTitle>
              <Badge className={getStatusColor(status)} data-testid="badge-order-status">
                {formatStatus(status)}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p className="font-medium" data-testid="text-order-date">
                {new Date(createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric"
                })}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-semibold" data-testid="text-progress-percent">
                {progressPercent}%
              </span>
            </div>
            <Progress value={progressPercent} className="h-3" data-testid="progress-order" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-medium" data-testid="text-customer-name">{customerName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium" data-testid="text-customer-phone">{phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-medium" data-testid="text-total-amount">
                  ${totalAmount.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order Type</p>
                <p className="font-medium">Custom Curtains</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
