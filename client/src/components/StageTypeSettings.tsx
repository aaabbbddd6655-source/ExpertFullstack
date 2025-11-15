import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Edit2, Save, X, Plus } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getToken } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import IconPicker, { AVAILABLE_ICONS } from "@/components/IconPicker";

interface StageTypeSetting {
  id: string;
  stageType: string;
  displayName: string;
  icon: string;
  isActive: number;
  sortOrder: number;
  defaultNotes: string | null;
}

export default function StageTypeSettings() {
  const { toast } = useToast();
  const token = getToken();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<StageTypeSetting>>({});
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newStageData, setNewStageData] = useState({
    stageType: "",
    displayName: "",
    icon: "Circle",
    isActive: 1,
    sortOrder: 14
  });

  const { data: stageTypes = [], isLoading, error } = useQuery({
    queryKey: ["/api/admin/stage-types"],
    queryFn: async () => {
      if (!token) throw new Error("Not authenticated");
      const response = await fetch("/api/admin/stage-types", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch stage types");
      return response.json();
    },
    enabled: !!token
  });

  const updateMutation = useMutation({
    mutationFn: async ({ stageType, updates }: { stageType: string; updates: Partial<StageTypeSetting> }) => {
      return apiRequest(`/api/admin/stage-types/${stageType}`, "PATCH", updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stage-types"] });
      setEditingId(null);
      setEditData({});
      toast({
        title: "Success",
        description: "Stage type updated successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update stage type",
        variant: "destructive"
      });
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newStageData) => {
      return apiRequest("/api/admin/stage-types", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stage-types"] });
      setAddDialogOpen(false);
      setNewStageData({
        stageType: "",
        displayName: "",
        icon: "Circle",
        isActive: 1,
        sortOrder: 14
      });
      toast({
        title: "Success",
        description: "New stage type created successfully"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create stage type",
        variant: "destructive"
      });
    }
  });

  const startEdit = (stage: StageTypeSetting) => {
    setEditingId(stage.id);
    setEditData({
      displayName: stage.displayName,
      icon: stage.icon,
      isActive: stage.isActive,
      sortOrder: stage.sortOrder,
      defaultNotes: stage.defaultNotes || ""
    });
  };

  const saveEdit = (stageType: string) => {
    updateMutation.mutate({
      stageType,
      updates: editData
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const formatStageType = (type: string) => {
    return type.split("_").map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(" ");
  };

  const IconComponent = (iconName: string) => {
    const Icon = AVAILABLE_ICONS[iconName] || AVAILABLE_ICONS.Circle;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <>
    <Card data-testid="card-stage-type-settings">
      <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
        <div>
          <CardTitle>Stage Type Settings</CardTitle>
          <CardDescription>
            Configure display names, visibility, and defaults for order stage types
          </CardDescription>
        </div>
        <Button 
          onClick={() => setAddDialogOpen(true)}
          data-testid="button-add-stage-type"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Stage
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <p className="text-sm text-muted-foreground text-center py-4">Loading stage types...</p>
        )}
        {error && (
          <p className="text-sm text-destructive text-center py-4">Failed to load stage types</p>
        )}
        {!isLoading && !error && (
          <div className="space-y-3">
            {(stageTypes as StageTypeSetting[]).map((stage: StageTypeSetting) => (
            <div
              key={stage.id}
              className="flex items-start gap-4 p-4 rounded-md border"
              data-testid={`stage-setting-${stage.stageType}`}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                {IconComponent(stage.icon)}
              </div>
              <div className="flex-1 space-y-3">
                {editingId === stage.id ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor={`name-${stage.id}`}>Display Name</Label>
                      <Input
                        id={`name-${stage.id}`}
                        value={editData.displayName || ""}
                        onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                        data-testid={`input-display-name-${stage.stageType}`}
                      />
                    </div>
                    <IconPicker
                      label="Stage Icon"
                      value={editData.icon || "Circle"}
                      onChange={(iconName) => setEditData({ ...editData, icon: iconName })}
                    />
                    <div className="space-y-2">
                      <Label htmlFor={`order-${stage.id}`}>Sort Order</Label>
                      <Input
                        id={`order-${stage.id}`}
                        type="number"
                        value={editData.sortOrder || 0}
                        onChange={(e) => setEditData({ ...editData, sortOrder: parseInt(e.target.value) })}
                        data-testid={`input-sort-order-${stage.stageType}`}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editData.isActive === 1}
                        onCheckedChange={(checked) => setEditData({ ...editData, isActive: checked ? 1 : 0 })}
                        data-testid={`switch-active-${stage.stageType}`}
                      />
                      <Label>Active (visible in Add Stage dropdown)</Label>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium" data-testid={`text-stage-name-${stage.stageType}`}>
                        {stage.displayName}
                      </h4>
                      <Badge 
                        variant={stage.isActive ? "default" : "secondary"}
                        data-testid={`badge-status-${stage.stageType}`}
                      >
                        {stage.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ({stage.stageType})
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Order: {stage.sortOrder}
                    </p>
                  </>
                )}
              </div>

              <div className="flex gap-2">
                {editingId === stage.id ? (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => saveEdit(stage.stageType)}
                      disabled={updateMutation.isPending}
                      data-testid={`button-save-${stage.stageType}`}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={cancelEdit}
                      disabled={updateMutation.isPending}
                      data-testid={`button-cancel-${stage.stageType}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => startEdit(stage)}
                    data-testid={`button-edit-${stage.stageType}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          </div>
        )}
      </CardContent>
    </Card>

    <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
      <DialogContent data-testid="dialog-add-stage-type">
        <DialogHeader>
          <DialogTitle>Add New Stage Type</DialogTitle>
          <DialogDescription>
            Create a new custom stage type for your order workflow
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-stage-type">Stage Type (Unique ID)</Label>
            <Input
              id="new-stage-type"
              placeholder="e.g., CUSTOM_STAGE"
              value={newStageData.stageType}
              onChange={(e) => setNewStageData({ ...newStageData, stageType: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
              data-testid="input-new-stage-type"
            />
            <p className="text-xs text-muted-foreground">
              Use uppercase letters and underscores only (e.g., CUSTOM_STAGE)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-display-name">Display Name</Label>
            <Input
              id="new-display-name"
              placeholder="e.g., Custom Stage"
              value={newStageData.displayName}
              onChange={(e) => setNewStageData({ ...newStageData, displayName: e.target.value })}
              data-testid="input-new-display-name"
            />
          </div>

          <IconPicker
            label="Stage Icon"
            value={newStageData.icon}
            onChange={(iconName) => setNewStageData({ ...newStageData, icon: iconName })}
          />

          <div className="space-y-2">
            <Label htmlFor="new-sort-order">Sort Order</Label>
            <Input
              id="new-sort-order"
              type="number"
              value={newStageData.sortOrder}
              onChange={(e) => setNewStageData({ ...newStageData, sortOrder: parseInt(e.target.value) })}
              data-testid="input-new-sort-order"
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={newStageData.isActive === 1}
              onCheckedChange={(checked) => setNewStageData({ ...newStageData, isActive: checked ? 1 : 0 })}
              data-testid="switch-new-active"
            />
            <Label>Active (visible in Add Stage dropdown)</Label>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="ghost" 
            onClick={() => setAddDialogOpen(false)}
            data-testid="button-cancel-add"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => createMutation.mutate(newStageData)}
            disabled={createMutation.isPending || !newStageData.stageType || !newStageData.displayName}
            data-testid="button-create-stage"
          >
            {createMutation.isPending ? "Creating..." : "Create Stage"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
