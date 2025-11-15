import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Package, Lock } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n";
import heroBackground from "@assets/generated_images/Premium_interior_hero_background_0b86cbc2.png";

interface OrderLookupProps {
  onLookup: (phone: string, orderNumber: string) => void;
  isLoading?: boolean;
}

export default function OrderLookup({ onLookup, isLoading = false }: OrderLookupProps) {
  const { t } = useTranslation();
  const [phone, setPhone] = useState("");
  const [orderNumber, setOrderNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLookup(phone, orderNumber);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/70"></div>
      </div>

      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 end-4 z-20">
        <LanguageSwitcher />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 backdrop-blur-sm mb-4">
            <Package className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-serif font-semibold text-white mb-3">
            {t('customer.title')}
          </h1>
          <p className="text-white/80 text-lg">
            {t('customer.subtitle')}
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-card/95 shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">{t('customer.title')}</CardTitle>
            <CardDescription>
              {t('customer.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  {t('customer.phoneNumber')}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t('customer.phonePlaceholder')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  data-testid="input-phone"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderNumber" className="text-sm font-medium">
                  {t('customer.orderNumber')}
                </Label>
                <Input
                  id="orderNumber"
                  type="text"
                  placeholder={t('customer.orderPlaceholder')}
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  required
                  data-testid="input-order-number"
                  className="h-12"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium"
                data-testid="button-lookup"
                disabled={isLoading}
              >
                {isLoading ? t('common.loading') : t('customer.trackOrder')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6 space-y-2">
          <p className="text-white/60 text-sm">
            Ivea
          </p>
          <Link href="/admin">
            <button 
              className="text-white/50 hover:text-white/80 text-xs flex items-center gap-1 mx-auto transition-colors"
              data-testid="link-admin"
            >
              <Lock className="w-3 h-3" />
              {t('admin.login')}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
