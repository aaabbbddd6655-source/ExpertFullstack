import { ArrowLeft, ImagePlus, Mail, XCircle, Upload, FileText, Image as ImageIcon, ExternalLink } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
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
import { getOrderDetails, updateStage, createAppointment, sendEmailUpdate, cancelOrder, addMedia, createStage, deleteStage, getMediaUploadUrl } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useTranslation } from "@/lib/i18n";

interface AdminOrderDetailsPageProps {
  orderId: string;
  onBack: () => void;
}

// Sanitize media URL to prevent path traversal and validate format
function sanitizeMediaUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  
  // Security: Reject path traversal attempts in the URL
  if (url.includes('..')) {
    console.error("Invalid media URL (path traversal attempt):", url);
    return null;
  }
  
  // If already a proxy path, validate and return
  if (url.startsWith('/objects/')) {
    // Security: Check for double slashes in path component (not protocol)
    const pathPart = url.substring(9); // Skip '/objects/'
    if (pathPart.includes('//')) {
      console.error("Invalid media URL (double slash in path):", url);
      return null;
    }
    // Remove leading slashes beyond /objects/
    return url.replace(/^\/objects\/+/, '/objects/');
  }
  
  // Transform Google Cloud Storage URLs to proxy format
  if (url.startsWith('https://storage.googleapis.com/')) {
    // Extract the bucket and path
    const pathMatch = url.match(/^https:\/\/storage\.googleapis\.com\/([^?]+)/);
    if (pathMatch && pathMatch[1]) {
      const objectPath = pathMatch[1].replace(/^\/+/, '');
      // Additional security checks
      if (objectPath.includes('..') || objectPath.includes('//')) {
        console.error("Invalid object path in GCS URL:", objectPath);
        return null;
      }
      return `/objects/${objectPath}`;
    }
  }
  
  // Allow other HTTPS URLs (external media, CDN URLs, etc.)
  if (url.startsWith('https://') || url.startsWith('http://')) {
    // Basic validation - ensure it's a valid URL
    try {
      new URL(url);
      return url;
    } catch {
      console.error("Invalid URL format:", url);
      return null;
    }
  }
  
  // Unknown format - reject for safety
  console.error("Unrecognized media URL format:", url);
  return null;
}

// Schemas for dialogs
const emailSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters")
});

const mediaSchema = z.object({
  mediaUrl: z.string().optional(),
  type: z.enum(["IMAGE", "DOCUMENT"]),
  stageId: z.string().min(1, "Stage is required"),
  notes: z.string().optional()
});

const cancelSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters")
});

export default function AdminOrderDetailsPage({ orderId, onBack }: AdminOrderDetailsPageProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const token = getToken();
  
  // Dialog state
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const { data, isLoading, error } = useQuery<any>({
    queryKey: [`/api/admin/orders/${orderId}`],
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ stageId, status, notes }: { stageId: string; status: string; notes: string }) => {
      if (!token) {
        throw new Error("Not authenticated");
      }
      return updateStage(token, orderId, stageId, status, notes);
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["/api/admin/orders", orderId] });
      toast({
        title: t('common.success'),
        description: t('admin.stages.stageUpdated')
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message || t('admin.stages.updateError'),
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
        title: t('common.success'),
        description: t('admin.appointment.saved')
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message || t('admin.appointment.saveError'),
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
        title: t('common.success'),
        description: t('admin.orders.emailSent')
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message || t('admin.orders.emailError'),
        variant: "destructive"
      });
    }
  });

  const addMediaMutation = useMutation({
    mutationFn: async (mediaData: { mediaUrl: string; type: "IMAGE" | "DOCUMENT"; stageId: string; notes?: string }) => {
      if (!token) throw new Error("Not authenticated");
      return addMedia(token, orderId, {
        mediaUrl: mediaData.mediaUrl,
        type: mediaData.type,
        stageId: mediaData.stageId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders", orderId] });
      setMediaDialogOpen(false);
      if (mediaFormReset) mediaFormReset();
      toast({
        title: t('common.success'),
        description: t('admin.orders.mediaAdded')
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message || t('admin.orders.mediaError'),
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
        title: t('common.success'),
        description: t('admin.orders.orderCancelled')
      });
      // Navigate back after successful cancellation
      setTimeout(() => onBack(), 500);
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message || t('admin.orders.cancelError'),
        variant: "destructive"
      });
    }
  });

  const createStageMutation = useMutation({
    mutationFn: async (stageData: { stageType: string; status: string; notes?: string }) => {
      if (!token) throw new Error("Not authenticated");
      return createStage(token, orderId, stageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders", orderId] });
      toast({
        title: t('common.success'),
        description: t('admin.stages.stageAdded')
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message || t('admin.stages.addError'),
        variant: "destructive"
      });
    }
  });

  const deleteStageMutation = useMutation({
    mutationFn: async (stageId: string) => {
      if (!token) throw new Error("Not authenticated");
      return deleteStage(token, orderId, stageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders", orderId] });
      toast({
        title: t('common.success'),
        description: t('admin.stages.stageDeleted')
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message || t('admin.stages.deleteError'),
        variant: "destructive"
      });
    }
  });

  if (error) {
    toast({
      title: t('common.error'),
      description: t('admin.orders.fetchError'),
      variant: "destructive"
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{t('admin.orders.orderNotFound')}</p>
      </div>
    );
  }

  const { order, customer, stages, appointment, media } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          data-testid="button-back-to-orders"
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('admin.orders.backToOrders')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <OrderSummary 
            orderNumber={order.orderNumber}
            customerName={customer.fullName}
            phone={customer.phone}
            createdAt={order.createdAt}
            totalAmount={order.totalAmount}
            status={order.status}
            progressPercent={order.progressPercent}
          />
          
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-serif">{t('admin.orders.orderTimeline')}</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline stages={stages} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('admin.orders.mediaFiles')}</CardTitle>
            </CardHeader>
            <CardContent>
              {media && media.length > 0 ? (
                <div className="space-y-3" data-testid="media-list">
                  {media.map((item: any) => {
                    // Sanitize URL for safe display
                    const safeUrl = sanitizeMediaUrl(item.url);
                    // Create safe test ID
                    const safeId = String(item.id).replace(/[^a-zA-Z0-9-]/g, '');
                    
                    return (
                      <div 
                        key={item.id} 
                        className="flex items-start gap-3 p-3 rounded-lg border"
                        data-testid={`media-item-${safeId}`}
                      >
                        <div className="flex-shrink-0">
                          {item.type === "IMAGE" ? (
                            <ImageIcon className="w-5 h-5 text-primary" />
                          ) : (
                            <FileText className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {item.type === "IMAGE" ? t('admin.orders.image') : t('admin.orders.document')}
                            </span>
                            {item.stage && (
                              <span className="text-xs text-muted-foreground">
                                ({item.stage.stageType.replace(/_/g, " ")})
                              </span>
                            )}
                          </div>
                          {safeUrl ? (
                            <a 
                              href={safeUrl}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                              data-testid={`media-link-${safeId}`}
                            >
                              {t('admin.orders.viewFile')}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-xs text-destructive">
                              {t('admin.orders.invalidFileUrl')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground" data-testid="no-media-message">
                  {t('admin.orders.noMedia')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Sticky StageManager on desktop */}
          <div className="lg:sticky lg:top-4 space-y-6">
            <StageManager
              stages={stages}
              onUpdate={(stageId, status, notes) => {
                updateStageMutation.mutate({ stageId, status, notes });
              }}
              onAdd={(stageType, status, notes) => {
                createStageMutation.mutate({ stageType, status, notes });
              }}
              onDelete={(stageId) => {
                deleteStageMutation.mutate(stageId);
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
                <CardTitle>{t('admin.orders.quickActions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full gap-2" 
                  onClick={() => setMediaDialogOpen(true)}
                  data-testid="button-add-media"
                >
                  <ImagePlus className="w-4 h-4" />
                  {t('admin.orders.addMedia')}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full gap-2" 
                  onClick={() => setEmailDialogOpen(true)}
                  data-testid="button-send-email"
                >
                  <Mail className="w-4 h-4" />
                  {t('admin.orders.sendEmailUpdate')}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full gap-2 text-destructive" 
                  onClick={() => setCancelDialogOpen(true)}
                  data-testid="button-cancel-order"
                >
                  <XCircle className="w-4 h-4" />
                  {t('admin.orders.cancelOrder')}
                </Button>
              </CardContent>
            </Card>
          </div>
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
        orderNumber={order.orderNumber}
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
  const { t } = useTranslation();
  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      subject: "",
      message: ""
    }
  });

  // Provide reset function to parent
  useEffect(() => {
    onResetRef(() => form.reset);
  }, [onResetRef, form.reset]);

  const handleSubmit = (data: z.infer<typeof emailSchema>) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-testid="dialog-send-email">
        <DialogHeader>
          <DialogTitle>{t('admin.orders.sendEmailUpdate')}</DialogTitle>
          <DialogDescription>
            {t('admin.orders.emailDescription')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.orders.subject')}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t('admin.orders.subjectPlaceholder')}
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
                  <FormLabel>{t('admin.orders.message')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('admin.orders.messagePlaceholder')}
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
                {t('common.cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                data-testid="button-email-send"
              >
                {isPending ? t('admin.orders.sending') : t('admin.orders.sendEmail')}
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
  onSubmit: (data: { mediaUrl: string; type: "IMAGE" | "DOCUMENT"; stageId: string; notes?: string }) => void;
  onResetRef: (reset: () => void) => void;
  isPending: boolean;
}) {
  const { t } = useTranslation();
  const form = useForm<z.infer<typeof mediaSchema>>({
    resolver: zodResolver(mediaSchema),
    defaultValues: {
      mediaUrl: "",
      type: "IMAGE",
      stageId: "",
      notes: ""
    }
  });

  const { toast } = useToast();
  const token = getToken();

  // Provide reset function to parent
  useEffect(() => {
    onResetRef(() => form.reset);
  }, [onResetRef, form.reset]);

  const handleFileUploadComplete = (uploadedUrl: string) => {
    form.setValue("mediaUrl", uploadedUrl);
    toast({
      title: t('admin.orders.fileUploaded'),
      description: t('admin.orders.fileUploadedDescription'),
    });
  };

  const handleGetUploadUrl = async () => {
    if (!token) {
      throw new Error("Not authenticated");
    }
    return {
      method: "PUT" as const,
      url: await getMediaUploadUrl(token),
    };
  };

  const handleSubmit = (data: z.infer<typeof mediaSchema>) => {
    if (!data.mediaUrl) {
      toast({
        title: t('common.error'),
        description: t('admin.orders.mediaUrlRequired'),
        variant: "destructive"
      });
      return;
    }
    onSubmit(data as any);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-testid="dialog-add-media">
        <DialogHeader>
          <DialogTitle>{t('admin.orders.addMedia')}</DialogTitle>
          <DialogDescription>
            {t('admin.orders.addMediaDescription')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="mediaUrl"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{t('admin.orders.mediaUrl')}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t('admin.orders.mediaUrlPlaceholder')}
                        {...field}
                        data-testid="input-media-url"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-center py-2">
              <ObjectUploader
                maxNumberOfFiles={1}
                maxFileSize={10485760}
                onGetUploadParameters={handleGetUploadUrl}
                onComplete={handleFileUploadComplete}
              >
                <Upload className="me-2 h-4 w-4" />
                {t('admin.orders.uploadFile')}
              </ObjectUploader>
            </div>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.orders.type')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-media-type">
                        <SelectValue placeholder={t('admin.orders.selectType')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="IMAGE">{t('admin.orders.image')}</SelectItem>
                      <SelectItem value="DOCUMENT">{t('admin.orders.document')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.stages.stage')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-stage">
                        <SelectValue placeholder={t('admin.stages.selectStage')} />
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
                  <FormLabel>{t('admin.stages.notes')} ({t('common.optional')})</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('admin.orders.mediaNotesPlaceholder')}
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
                {t('common.cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                data-testid="button-media-add"
              >
                {isPending ? t('admin.orders.adding') : t('admin.orders.addMedia')}
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
  const { t } = useTranslation();
  const form = useForm<z.infer<typeof cancelSchema>>({
    resolver: zodResolver(cancelSchema),
    defaultValues: {
      reason: ""
    }
  });

  // Provide reset function to parent
  useEffect(() => {
    onResetRef(() => form.reset);
  }, [onResetRef, form.reset]);

  const handleSubmit = (data: z.infer<typeof cancelSchema>) => {
    onConfirm(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-testid="dialog-cancel-order">
        <DialogHeader>
          <DialogTitle className="text-destructive">{t('admin.orders.cancelOrder')}</DialogTitle>
          <DialogDescription>
            {t('admin.orders.cancelWarning').replace('{orderNumber}', orderNumber)}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.orders.cancellationReason')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('admin.orders.reasonPlaceholder')}
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
                {t('admin.orders.keepOrder')}
              </Button>
              <Button 
                type="submit" 
                variant="destructive"
                disabled={isPending}
                data-testid="button-cancel-yes"
              >
                {isPending ? t('admin.orders.cancelling') : t('admin.orders.cancelOrder')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
