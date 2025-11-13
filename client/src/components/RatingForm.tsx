import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingFormProps {
  orderId: string;
  onSubmit: (rating: number, comment: string) => void;
}

export default function RatingForm({ orderId, onSubmit }: RatingFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0) {
      onSubmit(rating, comment);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-serif">Rate Your Experience</CardTitle>
        <CardDescription>
          We'd love to hear about your experience with Ivea
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">How would you rate your experience?</label>
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
                {rating === 5 && "Excellent! We're thrilled to hear that!"}
                {rating === 4 && "Great! Thank you for your feedback!"}
                {rating === 3 && "Good! We appreciate your input!"}
                {rating === 2 && "We'll work on improving your experience."}
                {rating === 1 && "We're sorry to hear that. Please share more details."}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Additional Comments (Optional)
            </label>
            <Textarea
              id="comment"
              placeholder="Tell us more about your experience..."
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
            Submit Rating
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
