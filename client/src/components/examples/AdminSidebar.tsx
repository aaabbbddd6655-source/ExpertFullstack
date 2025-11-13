import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AdminSidebar from "../AdminSidebar";

export default function AdminSidebarExample() {
  const [activeItem, setActiveItem] = useState("orders");

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AdminSidebar
          activeItem={activeItem}
          onNavigate={(path) => {
            console.log("Navigate to:", path);
            const id = path.split("/").pop() || "dashboard";
            setActiveItem(id);
          }}
          onLogout={() => console.log("Logout")}
        />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-semibold">Content Area</h1>
          <p className="text-muted-foreground">Active: {activeItem}</p>
        </main>
      </div>
    </SidebarProvider>
  );
}
