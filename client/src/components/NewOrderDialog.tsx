import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createOrder } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { useTranslation } from "@/lib/i18n";

const createOrderFormSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  totalAmount: z.coerce.number().positive("Total amount must be positive"),
  externalOrderId: z.string().optional()
});

type CreateOrderFormValues = z.infer<typeof createOrderFormSchema>;

interface NewOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewOrderDialog({ open, onOpenChange }: NewOrderDialogProps) {
  const { toast } = useToast();
  const { t } = useTranslation();

  const form = useForm<CreateOrderFormValues>({
    resolver: zodResolver(createOrderFormSchema),
    defaultValues: {
      customerName: "",
      phone: "",
      email: "",
      totalAmount: 0,
      externalOrderId: ""
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateOrderFormValues) => {
      const token = getToken();
      if (!token) throw new Error("Not authenticated");
      return createOrder(token, {
        customerName: data.customerName,
        phone: data.phone,
        email: data.email || undefined,
        totalAmount: data.totalAmount,
        externalOrderId: data.externalOrderId || undefined
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({
        title: t('common.success'),
        description: t('admin.orders.orderCreated')
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message || t('admin.orders.createOrderError'),
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: CreateOrderFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">{t('admin.orders.createNewOrder')}</DialogTitle>
          <DialogDescription>
            {t('admin.orders.createOrderDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('admin.customers.customerName')} <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="John Doe"
                      data-testid="input-customer-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('admin.customers.phoneNumber')} <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      data-testid="input-customer-phone"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.customers.email')} ({t('common.optional')})</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="customer@example.com"
                      data-testid="input-customer-email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('admin.orders.totalAmount')} <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="1500.00"
                      data-testid="input-total-amount"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="externalOrderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.orders.orderNumber')} ({t('common.optional')})</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('admin.orders.autoGenerated')}
                      data-testid="input-order-number"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    {t('admin.orders.autoGeneratedDescription')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
                className="flex-1"
                data-testid="button-cancel"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={mutation.isPending}
                data-testid="button-create-order"
              >
                {mutation.isPending ? t('admin.orders.creating') : t('admin.orders.createOrder')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
