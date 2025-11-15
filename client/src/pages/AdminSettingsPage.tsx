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
import StageTypeSettings from "@/components/StageTypeSettings";

export default function AdminSettingsPage() {
  const user = getUser();
  const { toast } = useToast();
  const { t, language, setLanguage } = useTranslation();

  const handleSaveProfile = () => {
    toast({
      title: t('common.success'),
      description: t('admin.settings.profileUpdated')
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
        <h1 className="text-3xl font-serif font-semibold">{t("admin.settings.title")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("admin.settings.subtitle")}
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.settings.profileInfo")}</CardTitle>
            <CardDescription>
              {t("admin.settings.profileDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("admin.settings.fullName")}</Label>
              <Input
                id="name"
                defaultValue={user?.name || ""}
                placeholder={t("admin.settings.yourName")}
                data-testid="input-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("admin.settings.email")}</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user?.email || ""}
                placeholder={t("admin.settings.emailPlaceholder")}
                data-testid="input-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">{t("admin.settings.role")}</Label>
              <Input
                id="role"
                defaultValue={user?.role || ""}
                disabled
                className="bg-muted"
                data-testid="input-role"
              />
              <p className="text-xs text-muted-foreground">
                {t("admin.settings.contactAdminRole")}
              </p>
            </div>

            <Button onClick={handleSaveProfile} data-testid="button-save-profile">
              {t("admin.settings.saveChanges")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.settings.security")}</CardTitle>
            <CardDescription>
              {t("admin.settings.securityDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">{t("admin.settings.currentPassword")}</Label>
              <Input
                id="current-password"
                type="password"
                placeholder={t("admin.settings.currentPasswordPlaceholder")}
                data-testid="input-current-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">{t("admin.settings.newPassword")}</Label>
              <Input
                id="new-password"
                type="password"
                placeholder={t("admin.settings.newPasswordPlaceholder")}
                data-testid="input-new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t("admin.settings.confirmPassword")}</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder={t("admin.settings.confirmPasswordPlaceholder")}
                data-testid="input-confirm-password"
              />
            </div>

            <Button 
              variant="outline" 
              onClick={() => toast({
                title: t("admin.settings.passwordChangeTitle"),
                description: t("admin.settings.passwordChangeComingSoon")
              })}
              data-testid="button-change-password"
            >
              {t("admin.settings.changePassword")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <CardTitle>{t("admin.settings.languagePreferences")}</CardTitle>
            </div>
            <CardDescription>
              {t("admin.settings.languageDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">{t("admin.settings.interfaceLanguage")}</Label>
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
                {t("admin.settings.languageChangeNote")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <CardTitle>{t("admin.settings.rolesPermissions")}</CardTitle>
            </div>
            <CardDescription>
              {t("admin.settings.rolesDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3 p-3 rounded-md border" data-testid="role-admin">
                  <div>
                    <h4 className="font-medium text-sm" data-testid="text-role-name-admin">{t("admin.roles.admin")}</h4>
                    <p className="text-xs text-muted-foreground mt-1" data-testid="text-role-desc-admin">
                      {t("admin.roles.adminDescription")}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-md font-medium whitespace-nowrap" data-testid="badge-role-access-admin">
                    {t("admin.roles.allAccess")}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 p-3 rounded-md border" data-testid="role-operations">
                  <div>
                    <h4 className="font-medium text-sm" data-testid="text-role-name-operations">{t("admin.roles.operations")}</h4>
                    <p className="text-xs text-muted-foreground mt-1" data-testid="text-role-desc-operations">
                      {t("admin.roles.operationsDescription")}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100 rounded-md font-medium whitespace-nowrap" data-testid="badge-role-access-operations">
                    {t("admin.roles.highAccess")}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 p-3 rounded-md border" data-testid="role-production">
                  <div>
                    <h4 className="font-medium text-sm" data-testid="text-role-name-production">{t("admin.roles.production")}</h4>
                    <p className="text-xs text-muted-foreground mt-1" data-testid="text-role-desc-production">
                      {t("admin.roles.productionDescription")}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100 rounded-md font-medium whitespace-nowrap" data-testid="badge-role-access-production">
                    {t("admin.roles.productionOnly")}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 p-3 rounded-md border" data-testid="role-quality">
                  <div>
                    <h4 className="font-medium text-sm" data-testid="text-role-name-quality">{t("admin.roles.quality")}</h4>
                    <p className="text-xs text-muted-foreground mt-1" data-testid="text-role-desc-quality">
                      {t("admin.roles.qualityDescription")}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-100 rounded-md font-medium whitespace-nowrap" data-testid="badge-role-access-quality">
                    {t("admin.roles.qcAccess")}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 p-3 rounded-md border" data-testid="role-installation">
                  <div>
                    <h4 className="font-medium text-sm" data-testid="text-role-name-installation">{t("admin.roles.installation")}</h4>
                    <p className="text-xs text-muted-foreground mt-1" data-testid="text-role-desc-installation">
                      {t("admin.roles.installationDescription")}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-100 rounded-md font-medium whitespace-nowrap" data-testid="badge-role-access-installation">
                    {t("admin.roles.installationOnly")}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 p-3 rounded-md border" data-testid="role-support">
                  <div>
                    <h4 className="font-medium text-sm" data-testid="text-role-name-support">{t("admin.roles.support")}</h4>
                    <p className="text-xs text-muted-foreground mt-1" data-testid="text-role-desc-support">
                      {t("admin.roles.supportDescription")}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100 rounded-md font-medium whitespace-nowrap" data-testid="badge-role-access-support">
                    {t("admin.roles.limitedAccess")}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs text-muted-foreground italic">
                  {t("admin.settings.contactAdmin")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <StageTypeSettings />

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.settings.appInfo")}</CardTitle>
            <CardDescription>
              {t("admin.settings.appInfoDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t("admin.settings.platform")}</span>
              <span className="text-sm font-medium">{t("admin.settings.platformName")}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t("admin.settings.version")}</span>
              <span className="text-sm font-medium">1.0.0</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t("admin.settings.environment")}</span>
              <span className="text-sm font-medium">{t("admin.settings.environmentProduction")}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
