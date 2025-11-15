import { useState } from "react";
import { 
  CheckCircle, Ruler, Palette, ShoppingCart, Scissors, 
  Baseline, Layers, Sparkles, ClipboardCheck, Package, 
  Calendar, Home, Star, Circle, Wrench, Truck, 
  Box, Settings, FileCheck, Paintbrush, Hammer,
  type LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// Available icons for stage types
const AVAILABLE_ICONS: Record<string, LucideIcon> = {
  CheckCircle,
  Ruler,
  Palette,
  ShoppingCart,
  Scissors,
  Baseline,
  Layers,
  Sparkles,
  ClipboardCheck,
  Package,
  Calendar,
  Home,
  Star,
  Circle,
  Wrench,
  Truck,
  Box,
  Settings,
  FileCheck,
  Paintbrush,
  Hammer
};

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  label?: string;
}

export default function IconPicker({ value, onChange, label }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const SelectedIcon = AVAILABLE_ICONS[value] || Circle;

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => setIsOpen(!isOpen)}
          data-testid="button-icon-picker"
        >
          <SelectedIcon className="w-4 h-4" />
          <span>{value || "Select Icon"}</span>
        </Button>
        
        {isOpen && (
          <div className="grid grid-cols-6 gap-2 p-3 border rounded-md bg-card">
            {Object.entries(AVAILABLE_ICONS).map(([name, Icon]) => (
              <Button
                key={name}
                type="button"
                variant={value === name ? "default" : "ghost"}
                size="icon"
                onClick={() => {
                  onChange(name);
                  setIsOpen(false);
                }}
                data-testid={`icon-option-${name}`}
                title={name}
              >
                <Icon className="w-4 h-4" />
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Export the icon map for use in other components
export { AVAILABLE_ICONS };
