import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Edit2, Save, X } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { getToken } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface StageTypeSetting {
  id: string;
  stageType: string;
  displayName: string;
  isActive: number;
  sortOrder: number;
  defaultNotes: string | null;
}

export default function StageTypeSettings() {
  const { toast } = useToast();
  const token = getToken();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<StageTypeSetting>>({});

  const { data: stageTypes = [] } = useQuery({
    queryKey: ["/api/admin/stage-types"]
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

  const startEdit = (stage: StageTypeSetting) => {
    setEditingId(stage.id);
    setEditData({
      displayName: stage.displayName,
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

  return (
    <Card data-testid="card-stage-type-settings">
      <CardHeader>
        <CardTitle>Stage Type Settings</CardTitle>
        <CardDescription>
          Configure display names, visibility, and defaults for order stage types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {(stageTypes as StageTypeSetting[]).map((stage: StageTypeSetting) => (
            <div
              key={stage.id}
              className="flex items-start gap-4 p-4 rounded-md border"
              data-testid={`stage-setting-${stage.stageType}`}
            >
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
      </CardContent>
    </Card>
  );
}
