import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface Appointment {
  scheduledAt?: string;
  locationAddress?: string;
  notes?: string;
}

interface AppointmentFormProps {
  appointment?: Appointment;
  onSubmit: (data: { scheduledAt: string; locationAddress: string; notes: string }) => void;
}

export default function AppointmentForm({ appointment, onSubmit }: AppointmentFormProps) {
  const [scheduledAt, setScheduledAt] = useState(
    appointment?.scheduledAt ? new Date(appointment.scheduledAt).toISOString().slice(0, 16) : ""
  );
  const [locationAddress, setLocationAddress] = useState(appointment?.locationAddress || "");
  const [notes, setNotes] = useState(appointment?.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      scheduledAt,
      locationAddress,
      notes
    });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <CardTitle>Installation Appointment</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Scheduled Date & Time</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              data-testid="input-scheduled-at"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationAddress">Location Address</Label>
            <Textarea
              id="locationAddress"
              placeholder="123 Main St, City, State ZIP"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              required
              className="min-h-20 resize-none"
              data-testid="textarea-location"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appointmentNotes">Notes (Optional)</Label>
            <Textarea
              id="appointmentNotes"
              placeholder="Special instructions or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-20 resize-none"
              data-testid="textarea-appointment-notes"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            data-testid="button-save-appointment"
          >
            {appointment?.scheduledAt ? "Update" : "Schedule"} Appointment
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
