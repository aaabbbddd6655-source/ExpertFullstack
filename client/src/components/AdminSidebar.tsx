import { Home, Package, Users, Settings, LogOut } from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter
} from "@/components/ui/sidebar";

interface AdminSidebarProps {
  activeItem: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export default function AdminSidebar({ activeItem, onNavigate, onLogout }: AdminSidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/admin" },
    { id: "orders", label: "Orders", icon: Package, path: "/admin/orders" },
    { id: "customers", label: "Customers", icon: Users, path: "/admin/customers" },
    { id: "settings", label: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <h2 className="text-2xl font-serif font-semibold">Evia</h2>
        <p className="text-sm text-muted-foreground">Operations Portal</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    onClick={() => onNavigate(item.path)}
                    isActive={activeItem === item.id}
                    data-testid={`link-${item.id}`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onLogout} data-testid="button-logout">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
