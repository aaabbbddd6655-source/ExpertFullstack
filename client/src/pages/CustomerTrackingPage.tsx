import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrderSummary from "@/components/OrderSummary";
import OrderTimeline from "@/components/OrderTimeline";
import RatingForm from "@/components/RatingForm";

interface CustomerTrackingPageProps {
  onBack: () => void;
}

export default function CustomerTrackingPage({ onBack }: CustomerTrackingPageProps) {
  const mockOrder = {
    orderNumber: "EV-2024-0123",
    customerName: "Sarah Johnson",
    phone: "+1 (555) 123-4567",
    createdAt: "2024-01-15T10:00:00Z",
    totalAmount: 3500,
    status: "DESIGN_APPROVAL",
    progressPercent: 25
  };

  const mockStages = [
    {
      id: "1",
      stageType: "ORDER_RECEIVED",
      status: "DONE" as const,
      completedAt: "2024-01-15T10:00:00Z",
      notes: "Your order has been successfully received and confirmed. Order total: $3,500"
    },
    {
      id: "2",
      stageType: "SITE_MEASUREMENT",
      status: "DONE" as const,
      startedAt: "2024-01-16T09:00:00Z",
      completedAt: "2024-01-16T11:00:00Z",
      notes: "Measurements completed successfully. Window dimensions: 120\" x 84\". Custom specifications noted."
    },
    {
      id: "3",
      stageType: "DESIGN_APPROVAL",
      status: "IN_PROGRESS" as const,
      startedAt: "2024-01-17T08:00:00Z",
      notes: "Design mockup has been sent to your email. Please review the fabric samples and approve the final design."
    },
    {
      id: "4",
      stageType: "MATERIALS_PROCUREMENT",
      status: "PENDING" as const
    },
    {
      id: "5",
      stageType: "PRODUCTION_CUTTING",
      status: "PENDING" as const
    },
    {
      id: "6",
      stageType: "PRODUCTION_STITCHING",
      status: "PENDING" as const
    },
    {
      id: "7",
      stageType: "FINISHING",
      status: "PENDING" as const
    },
    {
      id: "8",
      stageType: "QUALITY_CHECK",
      status: "PENDING" as const
    },
    {
      id: "9",
      stageType: "PACKAGING",
      status: "PENDING" as const
    },
    {
      id: "10",
      stageType: "DELIVERY_SCHEDULING",
      status: "PENDING" as const
    },
    {
      id: "11",
      stageType: "INSTALLATION",
      status: "PENDING" as const
    }
  ];

  const showRatingForm = false;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lookup
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <OrderSummary {...mockOrder} />
        
        <div>
          <h2 className="text-2xl font-serif font-semibold mb-6">Order Timeline</h2>
          <OrderTimeline stages={mockStages} />
        </div>

        {showRatingForm && (
          <RatingForm
            orderId="123"
            onSubmit={(rating, comment) => {
              console.log("Rating submitted:", { rating, comment });
            }}
          />
        )}
      </div>
    </div>
  );
}
