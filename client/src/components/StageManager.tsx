import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CheckCircle2, Clock, Circle, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { useStageTypeSettings, createStageTypeMap } from "@/hooks/useStageTypeSettings";
import { AVAILABLE_ICONS } from "@/components/IconPicker";
import { useTranslation } from "@/lib/i18n";
import { STANDARD_STAGE_TYPES } from "@shared/constants";

interface Stage {
  id: string;
  stageType: string;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
  notes?: string;
}

interface StageManagerProps {
  stages: Stage[];
  onUpdate: (stageId: string, status: string, notes: string) => void;
  onAdd?: (stageType: string, status: string, notes?: string) => void;
  onDelete?: (stageId: string) => void;
}

const addStageSchema = z.object({
  stageType: z.string().min(1, "Stage type is required"),
  status: z.enum(["PENDING", "IN_PROGRESS", "DONE"]),
  notes: z.string().optional()
});

export default function StageManager({ stages, onUpdate, onAdd, onDelete }: StageManagerProps) {
  const { t } = useTranslation();
  const [expandedStageId, setExpandedStageId] = useState<string | null>(
    stages.find(s => s.status === "IN_PROGRESS")?.id || stages[0]?.id || null
  );
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stageToDelete, setStageToDelete] = useState<Stage | null>(null);
  
  // Fetch stage type settings for icons and display names
  const { data: stageTypeSettings = [] } = useStageTypeSettings();
  const stageTypeMap = createStageTypeMap(stageTypeSettings);
  
  // Scroll indicators state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const getStageTypeLabel = (type: string) => {
    // For standard stage types, always use translations for bilingual support
    if (STANDARD_STAGE_TYPES.includes(type as any)) {
      return t(`admin.stages.types.${type}`);
    }
    // For custom stage types, use displayName or fallback to translation
    const setting = stageTypeMap.get(type);
    return setting?.displayName || t(`admin.stages.types.${type}`) || type;
  };
  
  const getStageIconName = (stageType: string) => {
    const setting = stageTypeMap.get(stageType);
    return setting?.icon;
  };

  const getStatusIcon = (status: string, iconName?: string) => {
    if (status === "DONE") return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (status === "IN_PROGRESS") return <Clock className="w-5 h-5 text-blue-600" />;
    const IconComponent = iconName && AVAILABLE_ICONS[iconName] ? AVAILABLE_ICONS[iconName] : Circle;
    return <IconComponent className="w-5 h-5 text-muted-foreground" />;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      PENDING: "bg-gray-100 text-gray-700",
      IN_PROGRESS: "bg-blue-100 text-blue-700",
      DONE: "bg-green-100 text-green-700"
    };
    const labels: Record<string, string> = {
      PENDING: t('admin.stages.pending'),
      IN_PROGRESS: t('admin.stages.inProgress'),
      DONE: t('admin.stages.done')
    };
    return (
      <Badge className={variants[status]}>
        {labels[status] || status.replace("_", " ")}
      </Badge>
    );
  };

  const handleDeleteClick = (stage: Stage) => {
    setStageToDelete(stage);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (stageToDelete && onDelete) {
      onDelete(stageToDelete.id);
      setDeleteDialogOpen(false);
      setStageToDelete(null);
    }
  };

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const threshold = 10;

    setCanScrollUp(scrollTop > threshold);
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - threshold);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScroll();

    const handleScroll = () => checkScroll();
    const resizeObserver = new ResizeObserver(() => checkScroll());

    container.addEventListener("scroll", handleScroll);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, [stages]);

  return (
    <>
      <Card className="relative">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-2">
            <CardTitle>{t('admin.stages.title')}</CardTitle>
            {onAdd && (
              <Button 
                size="sm"
                variant="outline"
                onClick={() => setAddDialogOpen(true)}
                data-testid="button-add-stage"
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('admin.stages.addStage')}
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Top scroll indicator */}
        {canScrollUp && (
          <div 
            className="absolute left-0 right-0 z-10 pointer-events-none flex justify-center pt-2"
            style={{ top: 'calc(var(--header-height, 4rem))' }}
            data-testid="stage-scroll-indicator-top"
          >
            <div className="bg-background/80 backdrop-blur-sm rounded-full p-1 border shadow-sm">
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        )}

        {/* Scrollable content */}
        <CardContent 
          ref={scrollContainerRef}
          className="space-y-3 max-h-[60vh] lg:max-h-[70vh] overflow-visible overflow-y-auto"
          data-testid="stage-scroll-container"
        >
          {stages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t('admin.stages.noStages')}
            </p>
          ) : (
            stages.map((stage) => (
              <StageCard
                key={stage.id}
                stage={stage}
                isExpanded={expandedStageId === stage.id}
                onToggle={() => setExpandedStageId(expandedStageId === stage.id ? null : stage.id)}
                onUpdate={onUpdate}
                onDelete={onDelete ? () => handleDeleteClick(stage) : undefined}
                formatStageType={getStageTypeLabel}
                getStatusIcon={getStatusIcon}
                getStageIconName={getStageIconName}
                getStatusBadge={getStatusBadge}
                t={t}
              />
            ))
          )}
        </CardContent>

        {/* Bottom scroll indicator */}
        {canScrollDown && (
          <div 
            className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none flex justify-center pb-2"
            data-testid="stage-scroll-indicator-bottom"
          >
            <div className="bg-background/80 backdrop-blur-sm rounded-full p-1 border shadow-sm">
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        )}
      </Card>

      {/* Add Stage Dialog */}
      {onAdd && (
        <AddStageDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onSubmit={(data) => {
            onAdd(data.stageType, data.status, data.notes);
            setAddDialogOpen(false);
          }}
          t={t}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {onDelete && (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md" data-testid="dialog-delete-stage">
            <DialogHeader>
              <DialogTitle>{t('admin.stages.deleteStage')}</DialogTitle>
              <DialogDescription>
                {t('admin.stages.deleteConfirmation').replace('{stage}', stageToDelete ? getStageTypeLabel(stageToDelete.stageType) : '')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                data-testid="button-delete-cancel"
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                data-testid="button-delete-confirm"
              >
                {t('admin.stages.deleteStage')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// Individual Stage Card Component
function StageCard({
  stage,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
  formatStageType: getStageTypeLabel,
  getStatusIcon,
  getStatusBadge,
  getStageIconName,
  t
}: {
  stage: Stage;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (stageId: string, status: string, notes: string) => void;
  onDelete?: () => void;
  formatStageType: (type: string) => string;
  getStatusIcon: (status: string, iconName?: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
  getStageIconName: (stageType: string) => string | undefined;
  t: (key: string) => string;
}) {
  const [status, setStatus] = useState(stage.status);
  const [notes, setNotes] = useState(stage.notes || "");

  // Sync local state when stage prop changes
  useEffect(() => {
    setStatus(stage.status);
    setNotes(stage.notes || "");
  }, [stage.status, stage.notes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(stage.id, status, notes);
  };

  const canDelete = stage.status === "PENDING" && onDelete;

  return (
    <div className="border rounded-md">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover-elevate"
        data-testid={`stage-header-${stage.id}`}
      >
        <div className="flex items-center gap-3">
          {getStatusIcon(stage.status, getStageIconName(stage.stageType))}
          <span className="font-medium text-sm">{getStageTypeLabel(stage.stageType)}</span>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(stage.status)}
          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8"
                  data-testid={`button-stage-menu-${stage.id}`}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="text-destructive gap-2"
                  data-testid={`button-delete-stage-${stage.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                  {t('admin.stages.deleteStage')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </button>

      {isExpanded && (
        <form key={`${stage.id}-${stage.status}-${stage.notes}`} onSubmit={handleSubmit} className="border-t p-3 space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`status-${stage.id}`}>{t('admin.stages.stageStatus')}</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger id={`status-${stage.id}`} data-testid={`select-stage-status-${stage.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">
                  <div className="flex items-center gap-2">
                    <Circle className="w-4 h-4" />
                    {t('admin.stages.pending')}
                  </div>
                </SelectItem>
                <SelectItem value="IN_PROGRESS">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    {t('admin.stages.inProgress')}
                  </div>
                </SelectItem>
                <SelectItem value="DONE">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    {t('admin.stages.done')}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`notes-${stage.id}`}>{t('admin.stages.notes')}</Label>
            <Textarea
              id={`notes-${stage.id}`}
              placeholder={t('admin.stages.notesPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-24 resize-none"
              data-testid={`textarea-notes-${stage.id}`}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            data-testid={`button-update-stage-${stage.id}`}
          >
            {t('admin.stages.updateStage')}
          </Button>
        </form>
      )}
    </div>
  );
}

// Add Stage Dialog Component
function AddStageDialog({
  open,
  onOpenChange,
  onSubmit,
  t
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: z.infer<typeof addStageSchema>) => void;
  t: (key: string) => string;
}) {
  const form = useForm<z.infer<typeof addStageSchema>>({
    resolver: zodResolver(addStageSchema),
    defaultValues: {
      stageType: "",
      status: "PENDING",
      notes: ""
    }
  });

  const handleSubmit = (data: z.infer<typeof addStageSchema>) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-testid="dialog-add-stage">
        <DialogHeader>
          <DialogTitle>{t('admin.stages.addNewStage')}</DialogTitle>
          <DialogDescription>
            {t('admin.stages.addStageDescription')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="stageType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.stages.stageType')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-add-stage-type">
                        <SelectValue placeholder={t('admin.stages.selectStageType')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STAGE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.split("_").map(word => 
                            word.charAt(0) + word.slice(1).toLowerCase()
                          ).join(" ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.stages.initialStatus')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-add-stage-status">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PENDING">{t('admin.stages.pending')}</SelectItem>
                      <SelectItem value="IN_PROGRESS">{t('admin.stages.inProgress')}</SelectItem>
                      <SelectItem value="DONE">{t('admin.stages.done')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.stages.notes')} ({t('common.optional')})</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t('admin.stages.notesPlaceholder')}
                      {...field}
                      data-testid="textarea-add-stage-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                data-testid="button-add-stage-cancel"
              >
                {t('common.cancel')}
              </Button>
              <Button 
                type="submit"
                data-testid="button-add-stage-submit"
              >
                {t('admin.stages.addStage')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
