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

const STAGE_TYPES = [
  "ORDER_RECEIVED",
  "SITE_MEASUREMENT",
  "DESIGN_APPROVAL",
  "MATERIALS_PROCUREMENT",
  "PRODUCTION_CUTTING",
  "PRODUCTION_STITCHING",
  "PRODUCTION_ASSEMBLY",
  "FINISHING",
  "QUALITY_CHECK",
  "PACKAGING",
  "DELIVERY_SCHEDULING",
  "INSTALLATION",
  "RATING"
];

export default function StageManager({ stages, onUpdate, onAdd, onDelete }: StageManagerProps) {
  const [expandedStageId, setExpandedStageId] = useState<string | null>(
    stages.find(s => s.status === "IN_PROGRESS")?.id || stages[0]?.id || null
  );
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stageToDelete, setStageToDelete] = useState<Stage | null>(null);
  
  // Scroll indicators state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const formatStageType = (type: string) => {
    return type.split("_").map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(" ");
  };

  const getStatusIcon = (status: string) => {
    if (status === "DONE") return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (status === "IN_PROGRESS") return <Clock className="w-5 h-5 text-blue-600" />;
    return <Circle className="w-5 h-5 text-muted-foreground" />;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      PENDING: "bg-gray-100 text-gray-700",
      IN_PROGRESS: "bg-blue-100 text-blue-700",
      DONE: "bg-green-100 text-green-700"
    };
    return (
      <Badge className={variants[status]}>
        {status.replace("_", " ")}
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
            <CardTitle>Stage Management</CardTitle>
            {onAdd && (
              <Button 
                size="sm"
                variant="outline"
                onClick={() => setAddDialogOpen(true)}
                data-testid="button-add-stage"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Stage
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
              No stages yet. Click "Add Stage" to create one.
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
                formatStageType={formatStageType}
                getStatusIcon={getStatusIcon}
                getStatusBadge={getStatusBadge}
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
        />
      )}

      {/* Delete Confirmation Dialog */}
      {onDelete && (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md" data-testid="dialog-delete-stage">
            <DialogHeader>
              <DialogTitle>Delete Stage</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the stage "{stageToDelete ? formatStageType(stageToDelete.stageType) : ''}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                data-testid="button-delete-cancel"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                data-testid="button-delete-confirm"
              >
                Delete Stage
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
  formatStageType,
  getStatusIcon,
  getStatusBadge
}: {
  stage: Stage;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (stageId: string, status: string, notes: string) => void;
  onDelete?: () => void;
  formatStageType: (type: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
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
          {getStatusIcon(stage.status)}
          <span className="font-medium text-sm">{formatStageType(stage.stageType)}</span>
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
                  className="text-destructive"
                  data-testid={`button-delete-stage-${stage.id}`}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Stage
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </button>

      {isExpanded && (
        <form key={`${stage.id}-${stage.status}-${stage.notes}`} onSubmit={handleSubmit} className="border-t p-3 space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`status-${stage.id}`}>Stage Status</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger id={`status-${stage.id}`} data-testid={`select-stage-status-${stage.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">
                  <div className="flex items-center gap-2">
                    <Circle className="w-4 h-4" />
                    Pending
                  </div>
                </SelectItem>
                <SelectItem value="IN_PROGRESS">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    In Progress
                  </div>
                </SelectItem>
                <SelectItem value="DONE">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Done
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`notes-${stage.id}`}>Notes</Label>
            <Textarea
              id={`notes-${stage.id}`}
              placeholder="Add notes about this stage..."
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
            Update Stage
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
  onSubmit
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: z.infer<typeof addStageSchema>) => void;
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
          <DialogTitle>Add New Stage</DialogTitle>
          <DialogDescription>
            Add a new stage to this order's workflow.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="stageType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-add-stage-type">
                        <SelectValue placeholder="Select a stage type" />
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
                  <FormLabel>Initial Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-add-stage-status">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="DONE">Done</SelectItem>
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
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any notes..."
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
                Cancel
              </Button>
              <Button 
                type="submit"
                data-testid="button-add-stage-submit"
              >
                Add Stage
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
