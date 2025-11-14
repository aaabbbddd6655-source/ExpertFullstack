import { Home, Package, Users, Settings, LogOut } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
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
  const { t } = useTranslation();
  
  const menuItems = [
    { id: "dashboard", label: t('admin.dashboard'), icon: Home, path: "/admin" },
    { id: "orders", label: t('admin.orders'), icon: Package, path: "/admin/orders" },
    { id: "customers", label: t('admin.customers'), icon: Users, path: "/admin/customers" },
    { id: "settings", label: t('admin.settings'), icon: Settings, path: "/admin/settings" },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <h2 className="text-2xl font-serif font-semibold">Ivea</h2>
        <p className="text-sm text-muted-foreground">{t('admin.welcome')}</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('admin.dashboard')}</SidebarGroupLabel>
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
              <span>{t('admin.logout')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
