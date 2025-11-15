import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertCustomerSchema } from "@shared/schema";
import { useTranslation } from "@/lib/i18n";

// Extend the insert schema with phone validation
const createCustomerFormSchema = insertCustomerSchema.extend({
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal(""))
});

type CreateCustomerForm = z.infer<typeof createCustomerFormSchema>;

export default function AdminCustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const { data: customers = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/customers"],
  });

  const form = useForm<CreateCustomerForm>({
    resolver: zodResolver(createCustomerFormSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: ""
    }
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: CreateCustomerForm) => {
      const res = await apiRequest("POST", "/api/admin/customers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/customers"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: t('common.success'),
        description: t('admin.customers.customerCreated')
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('admin.customers.createError'),
        variant: "destructive"
      });
    }
  });

  // Filter customers based on search
  const filteredCustomers = customers.filter((customer: any) =>
    customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = (data: CreateCustomerForm) => {
    createCustomerMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-serif font-semibold">{t('admin.customers.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('admin.customers.description')}
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-customer" className="gap-2">
              <UserPlus className="w-4 h-4" />
              {t('admin.customers.addCustomer')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('admin.customers.addNewCustomer')}</DialogTitle>
              <DialogDescription>
                {t('admin.customers.addCustomerDescription')}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.customers.fullName')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ahmed Mohammed"
                          {...field}
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
                      <FormLabel>{t('admin.customers.phoneNumber')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+966500000000 or 0500000000"
                          {...field}
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
                          type="email"
                          placeholder="customer@example.com"
                          {...field}
                          data-testid="input-customer-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    data-testid="button-cancel-customer"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={createCustomerMutation.isPending}
                    data-testid="button-submit-customer"
                  >
                    {createCustomerMutation.isPending ? t('admin.customers.creating') : t('admin.customers.createCustomer')}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.customers.customerList')}</CardTitle>
          <CardDescription>
            {t('admin.customers.total')}: {customers.length} {t('admin.customers.customers')}
          </CardDescription>
          <div className="relative pt-2">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('admin.customers.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ps-9"
              data-testid="input-search-customers"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">{t('common.loading')}</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">
                {searchTerm ? t('admin.customers.noCustomersFound') : t('admin.customers.noCustomers')}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.customers.name')}</TableHead>
                  <TableHead>{t('admin.customers.phone')}</TableHead>
                  <TableHead>{t('admin.customers.email')}</TableHead>
                  <TableHead className="text-end">{t('admin.customers.totalOrders')}</TableHead>
                  <TableHead className="text-end">{t('admin.customers.activeOrders')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer: any) => (
                  <TableRow key={customer.phone} data-testid={`row-customer-${customer.phone}`}>
                    <TableCell className="font-medium">{customer.fullName}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.email || "-"}</TableCell>
                    <TableCell className="text-end">{customer.totalOrders}</TableCell>
                    <TableCell className="text-end">{customer.activeOrders}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
