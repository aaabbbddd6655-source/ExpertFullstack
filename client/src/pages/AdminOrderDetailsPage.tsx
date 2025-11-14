import { ArrowLeft, ImagePlus, Mail, XCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OrderSummary from "@/components/OrderSummary";
import OrderTimeline from "@/components/OrderTimeline";
import StageManager from "@/components/StageManager";
import AppointmentForm from "@/components/AppointmentForm";
import { getOrderDetails, updateStage, createAppointment, sendEmailUpdate, cancelOrder } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface AdminOrderDetailsPageProps {
  orderId: string;
  onBack: () => void;
}

// Schemas for dialogs
const emailSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters")
});

const mediaSchema = z.object({
  mediaUrl: z.string().url("Must be a valid URL"),
  stageId: z.string().min(1, "Stage is required"),
  notes: z.string().optional()
});

const cancelSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters")
});

export default function AdminOrderDetailsPage({ orderId, onBack }: AdminOrderDetailsPageProps) {
  const { toast } = useToast();
  const token = getToken();
  
  // Dialog state
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

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

  // Form refs for dialog forms
  const [emailFormReset, setEmailFormReset] = useState<(() => void) | null>(null);
  const [mediaFormReset, setMediaFormReset] = useState<(() => void) | null>(null);
  const [cancelFormReset, setCancelFormReset] = useState<(() => void) | null>(null);

  const sendEmailMutation = useMutation({
    mutationFn: async (emailData: { subject: string; message: string }) => {
      if (!token) throw new Error("Not authenticated");
      return sendEmailUpdate(token, orderId, emailData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders", orderId] });
      setEmailDialogOpen(false);
      if (emailFormReset) emailFormReset();
      toast({
        title: "Success",
        description: "Email sent successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send email",
        variant: "destructive"
      });
    }
  });

  const addMediaMutation = useMutation({
    mutationFn: async (mediaData: { mediaUrl: string; stageId: string; notes?: string }) => {
      if (!token) throw new Error("Not authenticated");
      return apiRequest("POST", `/api/admin/orders/${orderId}/media`, { 
        url: mediaData.mediaUrl, 
        stageId: mediaData.stageId,
        notes: mediaData.notes 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders", orderId] });
      setMediaDialogOpen(false);
      if (mediaFormReset) mediaFormReset();
      toast({
        title: "Success",
        description: "Media added successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add media",
        variant: "destructive"
      });
    }
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (cancelData: { reason: string }) => {
      if (!token) throw new Error("Not authenticated");
      if (!orderId) throw new Error("Order ID is missing");
      return cancelOrder(token, orderId, cancelData.reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders", orderId] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      setCancelDialogOpen(false);
      if (cancelFormReset) cancelFormReset();
      toast({
        title: "Success",
        description: "Order cancelled successfully"
      });
      // Navigate back after successful cancellation
      setTimeout(() => onBack(), 500);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel order",
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
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setMediaDialogOpen(true)}
                data-testid="button-add-media"
              >
                <ImagePlus className="w-4 h-4 mr-2" />
                Add Media
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setEmailDialogOpen(true)}
                data-testid="button-send-email"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Email Update
              </Button>
              <Button 
                variant="outline" 
                className="w-full text-destructive" 
                onClick={() => setCancelDialogOpen(true)}
                data-testid="button-cancel-order"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Email Dialog */}
      <EmailDialog 
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        onSubmit={(data) => sendEmailMutation.mutate(data)}
        onResetRef={setEmailFormReset}
        isPending={sendEmailMutation.isPending}
      />

      {/* Media Dialog */}
      <MediaDialog 
        open={mediaDialogOpen}
        onOpenChange={setMediaDialogOpen}
        stages={data?.stages || []}
        onSubmit={(data) => addMediaMutation.mutate(data)}
        onResetRef={setMediaFormReset}
        isPending={addMediaMutation.isPending}
      />

      {/* Cancel Dialog */}
      <CancelDialog 
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        orderNumber={order.externalOrderId}
        onConfirm={(data) => cancelOrderMutation.mutate(data)}
        onResetRef={setCancelFormReset}
        isPending={cancelOrderMutation.isPending}
      />
    </div>
  );
}

// Email Dialog Component
function EmailDialog({ open, onOpenChange, onSubmit, onResetRef, isPending }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { subject: string; message: string }) => void;
  onResetRef: (reset: () => void) => void;
  isPending: boolean;
}) {
  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      subject: "",
      message: ""
    }
  });

  // Provide reset function to parent
  useState(() => {
    onResetRef(() => form.reset);
  });

  const handleSubmit = (data: z.infer<typeof emailSchema>) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-testid="dialog-send-email">
        <DialogHeader>
          <DialogTitle>Send Email Update</DialogTitle>
          <DialogDescription>
            Send a custom email notification to the customer about their order status.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Order Update: Your curtains are ready"
                      {...field}
                      data-testid="input-email-subject"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write your message here..."
                      className="min-h-32"
                      {...field}
                      data-testid="textarea-email-message"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                data-testid="button-email-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                data-testid="button-email-send"
              >
                {isPending ? "Sending..." : "Send Email"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Media Dialog Component
function MediaDialog({ open, onOpenChange, stages, onSubmit, onResetRef, isPending }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stages: any[];
  onSubmit: (data: { mediaUrl: string; stageId: string; notes?: string }) => void;
  onResetRef: (reset: () => void) => void;
  isPending: boolean;
}) {
  const form = useForm<z.infer<typeof mediaSchema>>({
    resolver: zodResolver(mediaSchema),
    defaultValues: {
      mediaUrl: "",
      stageId: "",
      notes: ""
    }
  });

  // Provide reset function to parent
  useState(() => {
    onResetRef(() => form.reset);
  });

  const handleSubmit = (data: z.infer<typeof mediaSchema>) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-testid="dialog-add-media">
        <DialogHeader>
          <DialogTitle>Add Media</DialogTitle>
          <DialogDescription>
            Add a photo or document URL to a specific stage of this order.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="mediaUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Media URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/photo.jpg"
                      {...field}
                      data-testid="input-media-url"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-stage">
                        <SelectValue placeholder="Select a stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          {stage.stageType.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any notes about this media..."
                      {...field}
                      data-testid="textarea-media-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                data-testid="button-media-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                data-testid="button-media-add"
              >
                {isPending ? "Adding..." : "Add Media"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Cancel Dialog Component
function CancelDialog({ open, onOpenChange, orderNumber, onConfirm, onResetRef, isPending }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  onConfirm: (data: { reason: string }) => void;
  onResetRef: (reset: () => void) => void;
  isPending: boolean;
}) {
  const form = useForm<z.infer<typeof cancelSchema>>({
    resolver: zodResolver(cancelSchema),
    defaultValues: {
      reason: ""
    }
  });

  // Provide reset function to parent
  useState(() => {
    onResetRef(() => form.reset);
  });

  const handleSubmit = (data: z.infer<typeof cancelSchema>) => {
    onConfirm(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-testid="dialog-cancel-order">
        <DialogHeader>
          <DialogTitle className="text-destructive">Cancel Order</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Order {orderNumber} will be permanently cancelled and any scheduled installation appointments will be deleted.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cancellation Reason</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please provide a reason for cancellation..."
                      className="min-h-24"
                      {...field}
                      data-testid="textarea-cancel-reason"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-no"
              >
                Keep Order
              </Button>
              <Button 
                type="submit" 
                variant="destructive"
                disabled={isPending}
                data-testid="button-cancel-yes"
              >
                {isPending ? "Cancelling..." : "Cancel Order"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
