import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, FileText } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useStageTypeSettings, createStageTypeMap } from "@/hooks/useStageTypeSettings";
import { AVAILABLE_ICONS } from "@/components/IconPicker";

type StageStatus = "PENDING" | "IN_PROGRESS" | "DONE";

interface TimelineStage {
  id: string;
  stageType: string;
  status: StageStatus;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  media?: { url: string; type: "IMAGE" | "DOCUMENT" }[];
}

interface OrderTimelineProps {
  stages: TimelineStage[];
}

const getStatusBadge = (status: StageStatus, t: any) => {
  const variants = {
    DONE: { variant: "default" as const, label: t('admin.stages.done'), className: "bg-green-600 hover:bg-green-600" },
    IN_PROGRESS: { variant: "default" as const, label: t('admin.stages.inProgress'), className: "bg-blue-600 hover:bg-blue-600" },
    PENDING: { variant: "secondary" as const, label: t('admin.stages.pending'), className: "" },
  };
  
  const config = variants[status];
  return (
    <Badge variant={config.variant} className={config.className} data-testid={`badge-status-${status.toLowerCase()}`}>
      {config.label}
    </Badge>
  );
};

const getStageIcon = (stageType: string, status: StageStatus, iconName?: string) => {
  // Use status-specific icons for DONE and IN_PROGRESS
  if (status === "DONE") {
    return <CheckCircle2 className="w-6 h-6 text-green-600" />;
  } else if (status === "IN_PROGRESS") {
    return <Clock className="w-6 h-6 text-blue-600" />;
  } else {
    // For PENDING, use the stage type's custom icon
    const IconComponent = iconName && AVAILABLE_ICONS[iconName] ? AVAILABLE_ICONS[iconName] : Circle;
    return <IconComponent className="w-6 h-6 text-muted-foreground" />;
  }
};

export default function OrderTimeline({ stages }: OrderTimelineProps) {
  const { t } = useTranslation();
  const { data: stageTypeSettings = [] } = useStageTypeSettings();
  const stageTypeMap = createStageTypeMap(stageTypeSettings);
  
  const getStageLabel = (stageType: string) => {
    const setting = stageTypeMap.get(stageType);
    return setting?.displayName || t(`admin.stages.types.${stageType}` as any) || stageType;
  };
  
  const getStageDescription = (stageType: string) => {
    return t(`admin.stages.descriptions.${stageType}` as any) || "";
  };
  
  const getStageIconName = (stageType: string) => {
    const setting = stageTypeMap.get(stageType);
    return setting?.icon;
  };
  
  return (
    <div className="space-y-4">
      {stages.map((stage, index) => {
        const label = getStageLabel(stage.stageType);
        const description = getStageDescription(stage.stageType);
        const iconName = getStageIconName(stage.stageType);
        const isLast = index === stages.length - 1;
        
        return (
          <div key={stage.id} className="relative">
            <Card 
              className={cn(
                "transition-all",
                stage.status === "IN_PROGRESS" && "ring-2 ring-primary shadow-md"
              )}
              data-testid={`card-stage-${stage.id}`}
            >
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      stage.status === "DONE" && "bg-green-100 dark:bg-green-950",
                      stage.status === "IN_PROGRESS" && "bg-blue-100 dark:bg-blue-950",
                      stage.status === "PENDING" && "bg-muted"
                    )}>
                      {getStageIcon(stage.stageType, stage.status, iconName)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold" data-testid={`text-stage-name-${stage.id}`}>
                          {label}
                        </h3>
                        <p className="text-sm text-muted-foreground">{description}</p>
                      </div>
                      {getStatusBadge(stage.status, t)}
                    </div>

                    {stage.completedAt && (
                      <p className="text-sm text-muted-foreground mb-2" data-testid={`text-completed-date-${stage.id}`}>
                        {t('customer.completed')} {new Date(stage.completedAt).toLocaleDateString("en-US", { 
                          month: "long", 
                          day: "numeric", 
                          year: "numeric" 
                        })}
                      </p>
                    )}

                    {stage.startedAt && stage.status === "IN_PROGRESS" && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {t('customer.started')} {new Date(stage.startedAt).toLocaleDateString("en-US", { 
                          month: "long", 
                          day: "numeric" 
                        })}
                      </p>
                    )}

                    {stage.notes && (
                      <div className="mt-3 p-3 bg-muted rounded-md" data-testid={`text-notes-${stage.id}`}>
                        <p className="text-sm">{stage.notes}</p>
                      </div>
                    )}

                    {stage.media && stage.media.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                        {stage.media.map((item, idx) => (
                          <div 
                            key={idx} 
                            className="aspect-square rounded-md bg-muted flex items-center justify-center"
                            data-testid={`media-${stage.id}-${idx}`}
                          >
                            {item.type === "IMAGE" ? (
                              <img 
                                src={item.url} 
                                alt="Stage media" 
                                className="w-full h-full object-cover rounded-md"
                              />
                            ) : (
                              <FileText className="w-8 h-8 text-muted-foreground" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {!isLast && (
              <div className="flex justify-center py-2">
                <div className={cn(
                  "w-0.5 h-6",
                  stage.status === "DONE" ? "bg-green-600" : "bg-border"
                )} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
