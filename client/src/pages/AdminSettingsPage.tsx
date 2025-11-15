import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { Globe, Shield } from "lucide-react";

export default function AdminSettingsPage() {
  const user = getUser();
  const { toast } = useToast();
  const { t, language, setLanguage } = useTranslation();

  const handleSaveProfile = () => {
    toast({
      title: t('common.success'),
      description: "Your profile settings have been updated"
    });
  };

  const handleLanguageChange = (newLang: string) => {
    const langName = newLang === 'en' ? t('admin.settings.languageEnglish') : t('admin.settings.languageArabic');
    setLanguage(newLang as 'en' | 'ar');
    toast({
      title: t('common.success'),
      description: t('admin.settings.languageChanged').replace('{language}', langName)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-semibold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and application preferences
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              View and update your account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                defaultValue={user?.name || ""}
                placeholder="Your name"
                data-testid="input-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user?.email || ""}
                placeholder="your.email@example.com"
                data-testid="input-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                defaultValue={user?.role || ""}
                disabled
                className="bg-muted"
                data-testid="input-role"
              />
              <p className="text-xs text-muted-foreground">
                Contact an administrator to change your role
              </p>
            </div>

            <Button onClick={handleSaveProfile} data-testid="button-save-profile">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Manage your password and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Enter current password"
                data-testid="input-current-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                data-testid="input-new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                data-testid="input-confirm-password"
              />
            </div>

            <Button 
              variant="outline" 
              onClick={() => toast({
                title: "Password change",
                description: "Password change functionality coming soon"
              })}
              data-testid="button-change-password"
            >
              Change Password
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <CardTitle>Language Preferences</CardTitle>
            </div>
            <CardDescription>
              Choose your preferred language for the interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Interface Language</Label>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger id="language" data-testid="select-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en" data-testid="option-language-en">
                    English
                  </SelectItem>
                  <SelectItem value="ar" data-testid="option-language-ar">
                    العربية (Arabic)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Changes will be applied immediately across the entire application
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <CardTitle>Roles & Permissions</CardTitle>
            </div>
            <CardDescription>
              User roles and their access levels in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3 p-3 rounded-md border" data-testid="role-admin">
                  <div>
                    <h4 className="font-medium text-sm" data-testid="text-role-name-admin">Admin</h4>
                    <p className="text-xs text-muted-foreground mt-1" data-testid="text-role-desc-admin">
                      Full system access, can manage users, orders, and all settings
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-md font-medium whitespace-nowrap" data-testid="badge-role-access-admin">
                    All Access
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 p-3 rounded-md border" data-testid="role-operations">
                  <div>
                    <h4 className="font-medium text-sm" data-testid="text-role-name-operations">Operations</h4>
                    <p className="text-xs text-muted-foreground mt-1" data-testid="text-role-desc-operations">
                      Manage orders, view customers, schedule appointments
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100 rounded-md font-medium whitespace-nowrap" data-testid="badge-role-access-operations">
                    High Access
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 p-3 rounded-md border" data-testid="role-production">
                  <div>
                    <h4 className="font-medium text-sm" data-testid="text-role-name-production">Production</h4>
                    <p className="text-xs text-muted-foreground mt-1" data-testid="text-role-desc-production">
                      Update production stages, quality checks, packaging
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100 rounded-md font-medium whitespace-nowrap" data-testid="badge-role-access-production">
                    Production Only
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 p-3 rounded-md border" data-testid="role-quality">
                  <div>
                    <h4 className="font-medium text-sm" data-testid="text-role-name-quality">Quality</h4>
                    <p className="text-xs text-muted-foreground mt-1" data-testid="text-role-desc-quality">
                      Perform quality inspections, approve finished products
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-100 rounded-md font-medium whitespace-nowrap" data-testid="badge-role-access-quality">
                    QC Access
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 p-3 rounded-md border" data-testid="role-installation">
                  <div>
                    <h4 className="font-medium text-sm" data-testid="text-role-name-installation">Installation</h4>
                    <p className="text-xs text-muted-foreground mt-1" data-testid="text-role-desc-installation">
                      View installation schedules, update appointment status
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-100 rounded-md font-medium whitespace-nowrap" data-testid="badge-role-access-installation">
                    Installation Only
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 p-3 rounded-md border" data-testid="role-support">
                  <div>
                    <h4 className="font-medium text-sm" data-testid="text-role-name-support">Support</h4>
                    <p className="text-xs text-muted-foreground mt-1" data-testid="text-role-desc-support">
                      View orders, respond to customer inquiries, basic updates
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100 rounded-md font-medium whitespace-nowrap" data-testid="badge-role-access-support">
                    Limited Access
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs text-muted-foreground italic">
                  Contact a system administrator to change role assignments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Information</CardTitle>
            <CardDescription>
              System and version details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Platform</span>
              <span className="text-sm font-medium">Ivea Order Tracking</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Version</span>
              <span className="text-sm font-medium">1.0.0</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Environment</span>
              <span className="text-sm font-medium">Production</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
