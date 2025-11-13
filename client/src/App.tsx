import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import NotFound from "@/pages/not-found";
import OrderLookup from "@/components/OrderLookup";
import CustomerTrackingPage from "@/pages/CustomerTrackingPage";
import AdminLogin from "@/components/AdminLogin";
import AdminSidebar from "@/components/AdminSidebar";
import AdminOrdersPage from "@/pages/AdminOrdersPage";
import AdminOrderDetailsPage from "@/pages/AdminOrderDetailsPage";
import * as api from "@/lib/api";
import * as auth from "@/lib/auth";

function CustomerRouter() {
  const [orderData, setOrderData] = useState<api.OrderLookupResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLookup = async (phone: string, orderNumber: string) => {
    setIsLoading(true);
    try {
      const data = await api.lookupOrder(phone, orderNumber);
      setOrderData(data);
    } catch (error: any) {
      toast({
        title: "Order not found",
        description: error.message || "Please check your phone number and order number",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (orderData) {
    return (
      <CustomerTrackingPage 
        orderData={orderData}
        onBack={() => setOrderData(null)} 
      />
    );
  }

  return <OrderLookup onLookup={handleLookup} isLoading={isLoading} />;
}

function AdminRouter() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("orders");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoggedIn(auth.isAuthenticated());
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await api.adminLogin(email, password);
      auth.saveAuth(response.token, response.user);
      setIsLoggedIn(true);
      toast({
        title: "Welcome back!",
        description: `Logged in as ${response.user.name}`
      });
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    auth.clearAuth();
    setIsLoggedIn(false);
    setActivePage("orders");
    setSelectedOrderId(null);
    toast({
      title: "Signed out",
      description: "You have been successfully logged out"
    });
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const sidebarStyle = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar
          activeItem={activePage}
          onNavigate={(path) => {
            const page = path.split("/").pop() || "dashboard";
            setActivePage(page);
            setSelectedOrderId(null);
          }}
          onLogout={handleLogout}
        />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b bg-card">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Admin Portal</span>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-8">
            {selectedOrderId ? (
              <AdminOrderDetailsPage
                orderId={selectedOrderId}
                onBack={() => setSelectedOrderId(null)}
              />
            ) : (
              <>
                {activePage === "orders" && (
                  <AdminOrdersPage onViewOrder={(id) => setSelectedOrderId(id)} />
                )}
                {activePage === "dashboard" && (
                  <div>
                    <h1 className="text-3xl font-serif font-semibold mb-4">Dashboard</h1>
                    <p className="text-muted-foreground">Dashboard overview coming soon...</p>
                  </div>
                )}
                {activePage === "customers" && (
                  <div>
                    <h1 className="text-3xl font-serif font-semibold mb-4">Customers</h1>
                    <p className="text-muted-foreground">Customer management coming soon...</p>
                  </div>
                )}
                {activePage === "settings" && (
                  <div>
                    <h1 className="text-3xl font-serif font-semibold mb-4">Settings</h1>
                    <p className="text-muted-foreground">Settings panel coming soon...</p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={CustomerRouter} />
      <Route path="/admin" component={AdminRouter} />
      <Route path="/admin/*" component={AdminRouter} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
