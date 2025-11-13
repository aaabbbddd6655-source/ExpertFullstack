import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OrderSummary from "@/components/OrderSummary";
import OrderTimeline from "@/components/OrderTimeline";
import StageManager from "@/components/StageManager";
import AppointmentForm from "@/components/AppointmentForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AdminOrderDetailsPageProps {
  orderId: string;
  onBack: () => void;
}

export default function AdminOrderDetailsPage({ orderId, onBack }: AdminOrderDetailsPageProps) {
  const mockOrder = {
    orderNumber: "EV-2024-0123",
    customerName: "Sarah Johnson",
    phone: "+1 (555) 123-4567",
    createdAt: "2024-01-15T10:00:00Z",
    totalAmount: 3500,
    status: "DESIGN_APPROVAL",
    progressPercent: 25
  };

  const mockStages = [
    {
      id: "1",
      stageType: "ORDER_RECEIVED",
      status: "DONE" as const,
      completedAt: "2024-01-15T10:00:00Z",
      notes: "Order confirmed and payment received"
    },
    {
      id: "2",
      stageType: "SITE_MEASUREMENT",
      status: "DONE" as const,
      startedAt: "2024-01-16T09:00:00Z",
      completedAt: "2024-01-16T11:00:00Z",
      notes: "Measurements completed. Window: 120\" x 84\""
    },
    {
      id: "3",
      stageType: "DESIGN_APPROVAL",
      status: "IN_PROGRESS" as const,
      startedAt: "2024-01-17T08:00:00Z",
      notes: "Design mockup sent to customer"
    }
  ];

  const currentStage = mockStages.find(s => s.status === "IN_PROGRESS") || mockStages[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          data-testid="button-back-to-orders"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <OrderSummary {...mockOrder} />
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline stages={mockStages} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <StageManager
            stage={currentStage}
            onUpdate={(id, status, notes) => {
              console.log("Update stage:", { id, status, notes });
            }}
          />

          <AppointmentForm
            onSubmit={(data) => {
              console.log("Appointment created:", data);
            }}
          />

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" data-testid="button-add-media">
                Add Media
              </Button>
              <Button variant="outline" className="w-full" data-testid="button-send-email">
                Send Email Update
              </Button>
              <Button variant="outline" className="w-full text-destructive" data-testid="button-cancel-order">
                Cancel Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
