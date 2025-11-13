import { ArrowLeft } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OrderSummary from "@/components/OrderSummary";
import OrderTimeline from "@/components/OrderTimeline";
import StageManager from "@/components/StageManager";
import AppointmentForm from "@/components/AppointmentForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getOrderDetails, updateStage, createAppointment } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface AdminOrderDetailsPageProps {
  orderId: string;
  onBack: () => void;
}

export default function AdminOrderDetailsPage({ orderId, onBack }: AdminOrderDetailsPageProps) {
  const { toast } = useToast();
  const token = getToken();

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/admin/orders", orderId],
    queryFn: async () => {
      if (!token) {
        throw new Error("Not authenticated");
      }
      return getOrderDetails(token, orderId);
    },
    enabled: !!token && !!orderId
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ stageId, status, notes }: { stageId: string; status: string; notes: string }) => {
      if (!token) {
        throw new Error("Not authenticated");
      }
      return updateStage(token, orderId, stageId, status, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({
        title: "Success",
        description: "Stage updated successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update stage",
        variant: "destructive"
      });
    }
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: { scheduledAt: string; locationAddress: string; notes: string }) => {
      if (!token) {
        throw new Error("Not authenticated");
      }
      return createAppointment(token, orderId, appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders", orderId] });
      toast({
        title: "Success",
        description: "Appointment saved successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save appointment",
        variant: "destructive"
      });
    }
  });

  if (error) {
    toast({
      title: "Error",
      description: "Failed to fetch order details",
      variant: "destructive"
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Order not found</p>
      </div>
    );
  }

  const { order, customer, stages, appointment } = data;
  const currentStage = stages.find((s: any) => s.status === "IN_PROGRESS") || stages[0];

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
          <OrderSummary 
            orderNumber={order.externalOrderId}
            customerName={customer.fullName}
            phone={customer.phone}
            createdAt={order.createdAt}
            totalAmount={order.totalAmount}
            status={order.status}
            progressPercent={order.progressPercent}
          />
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline stages={stages} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <StageManager
            stage={currentStage}
            onUpdate={(stageId, status, notes) => {
              updateStageMutation.mutate({ stageId, status, notes });
            }}
          />

          <AppointmentForm
            appointment={appointment}
            onSubmit={(appointmentData) => {
              createAppointmentMutation.mutate(appointmentData);
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
