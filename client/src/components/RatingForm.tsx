import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface RatingFormProps {
  orderId: string;
  onSubmit: (rating: number, comment: string) => void;
}

export default function RatingForm({ orderId, onSubmit }: RatingFormProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const getRatingMessage = (rating: number) => {
    if (rating === 5) return t('customer.ratingExcellent');
    if (rating === 4) return t('customer.ratingGreat');
    if (rating === 3) return t('customer.ratingGood');
    if (rating === 2) return t('customer.ratingFair');
    if (rating === 1) return t('customer.ratingPoor');
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0) {
      onSubmit(rating, comment);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-serif">{t('customer.rateExperience')}</CardTitle>
        <CardDescription>
          {t('customer.rateDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">{t('customer.ratingPrompt')}</label>
            <div className="flex gap-2 justify-center py-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none focus:scale-110"
                  data-testid={`button-rating-${value}`}
                >
                  <Star
                    className={cn(
                      "w-12 h-12 transition-colors",
                      (hoveredRating >= value || rating >= value)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    )}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                {getRatingMessage(rating)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              {t('customer.additionalComments')}
            </label>
            <Textarea
              id="comment"
              placeholder={t('customer.commentPlaceholder')}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-32 resize-none"
              data-testid="textarea-comment"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={rating === 0}
            data-testid="button-submit-rating"
          >
            {t('customer.submitRating')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
