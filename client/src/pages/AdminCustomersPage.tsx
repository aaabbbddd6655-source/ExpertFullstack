import { useQuery } from "@tanstack/react-query";
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
import { useState } from "react";
import { getOrders } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { Search } from "lucide-react";

export default function AdminCustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const token = getToken();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      if (!token) throw new Error("Not authenticated");
      return getOrders(token);
    },
    enabled: !!token
  });

  // Group orders by customer
  const customersMap = new Map();
  orders.forEach((order: any) => {
    const phone = order.phone;
    if (!customersMap.has(phone)) {
      customersMap.set(phone, {
        name: order.customerName,
        phone: phone,
        email: order.email || "-",
        orders: []
      });
    }
    customersMap.get(phone).orders.push(order);
  });

  const customers = Array.from(customersMap.values());

  // Filter customers based on search
  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-semibold">Customers</h1>
        <p className="text-muted-foreground mt-1">
          Manage and view all customer information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
          <CardDescription>
            Total: {customers.length} customers
          </CardDescription>
          <div className="relative pt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search-customers"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading customers...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">
                {searchTerm ? "No customers found matching your search" : "No customers yet"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Total Orders</TableHead>
                  <TableHead className="text-right">Active Orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => {
                  const activeOrders = customer.orders.filter(
                    (o: any) => o.status !== "COMPLETED" && o.status !== "CANCELLED"
                  ).length;

                  return (
                    <TableRow key={customer.phone} data-testid={`row-customer-${customer.phone}`}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell className="text-right">{customer.orders.length}</TableCell>
                      <TableCell className="text-right">{activeOrders}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
