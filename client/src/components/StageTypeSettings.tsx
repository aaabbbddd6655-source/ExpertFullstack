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
import { queryClient } from "@/lib/queryClient";
import { getToken } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import IconPicker, { AVAILABLE_ICONS } from "@/components/IconPicker";
import { useTranslation } from "@/lib/i18n";

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
  const { t } = useTranslation();
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
      if (!token) throw new Error("Not authenticated");
      const response = await fetch(`/api/admin/stage-types/${stageType}`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update stage type");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stage-types"] });
      setEditingId(null);
      setEditData({});
      toast({
        title: t('common.success'),
        description: t('admin.stages.stageTypeUpdated')
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message || t('admin.stages.updateError'),
        variant: "destructive"
      });
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newStageData) => {
      if (!token) throw new Error("Not authenticated");
      const response = await fetch("/api/admin/stage-types", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create stage type");
      }
      
      return response.json();
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
        title: t('common.success'),
        description: t('admin.stages.stageTypeCreated')
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message || t('admin.stages.createError'),
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

  const getStageTypeLabel = (type: string) => {
    return t(`admin.stages.types.${type}`) || type;
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
          <CardTitle>{t('admin.stages.stageTypeSettings')}</CardTitle>
          <CardDescription>
            {t('admin.stages.stageTypeSettingsDescription')}
          </CardDescription>
        </div>
        <Button 
          onClick={() => setAddDialogOpen(true)}
          data-testid="button-add-stage-type"
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('admin.stages.addNewStage')}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <p className="text-sm text-muted-foreground text-center py-4">{t('common.loading')}</p>
        )}
        {error && (
          <p className="text-sm text-destructive text-center py-4">{t('admin.stages.loadError')}</p>
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
                      <Label htmlFor={`name-${stage.id}`}>{t('admin.stages.displayName')}</Label>
                      <Input
                        id={`name-${stage.id}`}
                        value={editData.displayName || ""}
                        onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                        data-testid={`input-display-name-${stage.stageType}`}
                      />
                    </div>
                    <IconPicker
                      label={t('admin.stages.stageIcon')}
                      value={editData.icon || "Circle"}
                      onChange={(iconName) => setEditData({ ...editData, icon: iconName })}
                    />
                    <div className="space-y-2">
                      <Label htmlFor={`order-${stage.id}`}>{t('admin.stages.sortOrder')}</Label>
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
                      <Label>{t('admin.stages.activeLabel')}</Label>
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
                        {stage.isActive ? t('admin.stages.active') : t('admin.stages.inactive')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ({stage.stageType})
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t('admin.stages.orderLabel')}: {stage.sortOrder}
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
          <DialogTitle>{t('admin.stages.addNewStageType')}</DialogTitle>
          <DialogDescription>
            {t('admin.stages.addStageTypeDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-stage-type">{t('admin.stages.stageTypeUniqueId')}</Label>
            <Input
              id="new-stage-type"
              placeholder={t('admin.stages.stageTypePlaceholder')}
              value={newStageData.stageType}
              onChange={(e) => setNewStageData({ ...newStageData, stageType: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
              data-testid="input-new-stage-type"
            />
            <p className="text-xs text-muted-foreground">
              {t('admin.stages.stageTypeHelp')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-display-name">{t('admin.stages.displayName')}</Label>
            <Input
              id="new-display-name"
              placeholder={t('admin.stages.displayNamePlaceholder')}
              value={newStageData.displayName}
              onChange={(e) => setNewStageData({ ...newStageData, displayName: e.target.value })}
              data-testid="input-new-display-name"
            />
          </div>

          <IconPicker
            label={t('admin.stages.stageIcon')}
            value={newStageData.icon}
            onChange={(iconName) => setNewStageData({ ...newStageData, icon: iconName })}
          />

          <div className="space-y-2">
            <Label htmlFor="new-sort-order">{t('admin.stages.sortOrder')}</Label>
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
            <Label>{t('admin.stages.activeLabel')}</Label>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="ghost" 
            onClick={() => setAddDialogOpen(false)}
            data-testid="button-cancel-add"
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={() => createMutation.mutate(newStageData)}
            disabled={createMutation.isPending || !newStageData.stageType || !newStageData.displayName}
            data-testid="button-create-stage"
          >
            {createMutation.isPending ? t('admin.stages.creating') : t('admin.stages.createStage')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
