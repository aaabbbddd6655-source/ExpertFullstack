import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import OrderSummary from "@/components/OrderSummary";
import OrderTimeline from "@/components/OrderTimeline";
import RatingForm from "@/components/RatingForm";
import type { OrderLookupResponse } from "@/lib/api";
import * as api from "@/lib/api";

interface CustomerTrackingPageProps {
  orderData: OrderLookupResponse;
  onBack: () => void;
}

export default function CustomerTrackingPage({ orderData, onBack }: CustomerTrackingPageProps) {
  const { toast } = useToast();
  const [hasRating, setHasRating] = useState(!!orderData.rating);
  const { order, customer, stages, media } = orderData;
  
  const showRatingForm = order.status === "INSTALLED" && !hasRating;

  const handleRatingSubmit = async (rating: number, comment: string) => {
    try {
      await api.submitRating(order.id, rating, comment);
      setHasRating(true);
      toast({
        title: "Thank you for your feedback!",
        description: "Your rating has been submitted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Failed to submit rating",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Map stages to include media
  const stagesWithMedia = stages.map(stage => ({
    ...stage,
    status: stage.status as "PENDING" | "IN_PROGRESS" | "DONE",
    media: media.filter(m => m.stageId === stage.id)
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={onBack}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lookup
          </Button>
          <LanguageSwitcher />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <OrderSummary 
          orderNumber={order.externalOrderId}
          customerName={customer.fullName}
          phone={customer.phone}
          createdAt={order.createdAt}
          totalAmount={order.totalAmount}
          status={order.status}
          progressPercent={order.progressPercent}
        />
        
        <div>
          <h2 className="text-2xl font-serif font-semibold mb-6">Order Timeline</h2>
          <OrderTimeline stages={stagesWithMedia} />
        </div>

        {showRatingForm && (
          <RatingForm
            orderId={order.id}
            onSubmit={handleRatingSubmit}
          />
        )}
      </div>
    </div>
  );
}
