import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useTranslation } from "@/lib/i18n";

interface OrderFiltersProps {
  selectedStatus: string;
  selectedStage: string;
  dateFrom?: Date;
  dateTo?: Date;
  onStatusChange: (status: string) => void;
  onStageChange: (stage: string) => void;
  onDateFromChange: (date?: Date) => void;
  onDateToChange: (date?: Date) => void;
  onReset: () => void;
}

export default function OrderFilters({
  selectedStatus,
  selectedStage,
  dateFrom,
  dateTo,
  onStatusChange,
  onStageChange,
  onDateFromChange,
  onDateToChange,
  onReset
}: OrderFiltersProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-48 space-y-2">
        <Label htmlFor="status-filter">{t('admin.orders.orderStatus')}</Label>
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger id="status-filter" data-testid="select-status-filter">
            <SelectValue placeholder={t('admin.orders.allStatuses')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.orders.allStatuses')}</SelectItem>
            <SelectItem value="PENDING_MEASUREMENT">{t('admin.orders.pendingMeasurement')}</SelectItem>
            <SelectItem value="DESIGN_APPROVAL">{t('admin.orders.designApproval')}</SelectItem>
            <SelectItem value="IN_PRODUCTION">{t('admin.orders.inProduction')}</SelectItem>
            <SelectItem value="QUALITY_CHECK">{t('admin.orders.qualityCheck')}</SelectItem>
            <SelectItem value="READY_FOR_INSTALL">{t('admin.orders.readyForInstall')}</SelectItem>
            <SelectItem value="INSTALLED">{t('admin.orders.installed')}</SelectItem>
            <SelectItem value="COMPLETED">{t('admin.orders.completed')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-48 space-y-2">
        <Label htmlFor="stage-filter">{t('admin.orders.currentStage')}</Label>
        <Select value={selectedStage} onValueChange={onStageChange}>
          <SelectTrigger id="stage-filter" data-testid="select-stage-filter">
            <SelectValue placeholder={t('admin.orders.allStages')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.orders.allStages')}</SelectItem>
            <SelectItem value="ORDER_RECEIVED">{t('admin.stages.orderReceived')}</SelectItem>
            <SelectItem value="SITE_MEASUREMENT">{t('admin.stages.siteMeasurement')}</SelectItem>
            <SelectItem value="DESIGN_APPROVAL">{t('admin.stages.designApproval')}</SelectItem>
            <SelectItem value="MATERIALS_PROCUREMENT">{t('admin.stages.materialsProcurement')}</SelectItem>
            <SelectItem value="PRODUCTION_CUTTING">{t('admin.stages.productionCutting')}</SelectItem>
            <SelectItem value="QUALITY_CHECK">{t('admin.stages.qualityCheck')}</SelectItem>
            <SelectItem value="INSTALLATION">{t('admin.stages.installation')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-48 space-y-2">
        <Label>{t('common.from')}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateFrom && "text-muted-foreground"
              )}
              data-testid="button-date-from"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom ? format(dateFrom, "PPP") : t('common.pickDate')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateFrom}
              onSelect={onDateFromChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex-1 min-w-48 space-y-2">
        <Label>{t('common.to')}</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dateTo && "text-muted-foreground"
              )}
              data-testid="button-date-to"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateTo ? format(dateTo, "PPP") : t('common.pickDate')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateTo}
              onSelect={onDateToChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button 
        variant="outline" 
        onClick={onReset}
        data-testid="button-reset-filters"
      >
        <X className="w-4 h-4 mr-1" />
        {t('admin.orders.resetFilters')}
      </Button>
    </div>
  );
}
