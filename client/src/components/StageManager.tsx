import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Circle } from "lucide-react";

interface Stage {
  id: string;
  stageType: string;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
  notes?: string;
}

interface StageManagerProps {
  stage: Stage;
  onUpdate: (stageId: string, status: string, notes: string) => void;
}

export default function StageManager({ stage, onUpdate }: StageManagerProps) {
  const [status, setStatus] = useState(stage.status);
  const [notes, setNotes] = useState(stage.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(stage.id, status, notes);
  };

  const formatStageType = (type: string) => {
    return type.split("_").map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(" ");
  };

  const getStatusIcon = () => {
    if (status === "DONE") return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (status === "IN_PROGRESS") return <Clock className="w-5 h-5 text-blue-600" />;
    return <Circle className="w-5 h-5 text-muted-foreground" />;
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-xl">
            {formatStageType(stage.stageType)}
          </CardTitle>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
      </CardContent>
    </Card>
  );
}
