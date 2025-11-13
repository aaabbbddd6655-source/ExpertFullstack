import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import NotFound from "@/pages/not-found";
import OrderLookup from "@/components/OrderLookup";
import CustomerTrackingPage from "@/pages/CustomerTrackingPage";
import AdminLogin from "@/components/AdminLogin";
import AdminSidebar from "@/components/AdminSidebar";
import AdminOrdersPage from "@/pages/AdminOrdersPage";
import AdminOrderDetailsPage from "@/pages/AdminOrderDetailsPage";

function CustomerRouter() {
  const [showTracking, setShowTracking] = useState(false);

  if (showTracking) {
    return <CustomerTrackingPage onBack={() => setShowTracking(false)} />;
  }

  return (
    <OrderLookup 
      onLookup={(phone, orderNumber) => {
        console.log("Order lookup:", { phone, orderNumber });
        setShowTracking(true);
      }}
    />
  );
}

function AdminRouter() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("orders");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <AdminLogin 
        onLogin={(email, password) => {
          console.log("Admin login:", { email, password });
          setIsLoggedIn(true);
        }}
      />
    );
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
          onLogout={() => {
            console.log("Logout");
            setIsLoggedIn(false);
          }}
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
