import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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
  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-48 space-y-2">
        <Label htmlFor="status-filter">Order Status</Label>
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger id="status-filter" data-testid="select-status-filter">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PENDING_MEASUREMENT">Pending Measurement</SelectItem>
            <SelectItem value="DESIGN_APPROVAL">Design Approval</SelectItem>
            <SelectItem value="IN_PRODUCTION">In Production</SelectItem>
            <SelectItem value="QUALITY_CHECK">Quality Check</SelectItem>
            <SelectItem value="READY_FOR_INSTALL">Ready for Install</SelectItem>
            <SelectItem value="INSTALLED">Installed</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-48 space-y-2">
        <Label htmlFor="stage-filter">Current Stage</Label>
        <Select value={selectedStage} onValueChange={onStageChange}>
          <SelectTrigger id="stage-filter" data-testid="select-stage-filter">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="ORDER_RECEIVED">Order Received</SelectItem>
            <SelectItem value="SITE_MEASUREMENT">Site Measurement</SelectItem>
            <SelectItem value="DESIGN_APPROVAL">Design Approval</SelectItem>
            <SelectItem value="MATERIALS_PROCUREMENT">Materials Procurement</SelectItem>
            <SelectItem value="PRODUCTION_CUTTING">Production - Cutting</SelectItem>
            <SelectItem value="QUALITY_CHECK">Quality Check</SelectItem>
            <SelectItem value="INSTALLATION">Installation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-48 space-y-2">
        <Label>Date From</Label>
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
              {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
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
        <Label>Date To</Label>
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
              {dateTo ? format(dateTo, "PPP") : "Pick a date"}
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
        Reset
      </Button>
    </div>
  );
}
