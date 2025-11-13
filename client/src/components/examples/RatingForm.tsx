import RatingForm from "../RatingForm";

export default function RatingFormExample() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <RatingForm
        orderId="123"
        onSubmit={(rating, comment) => {
          console.log("Rating submitted:", { rating, comment });
        }}
      />
    </div>
  );
}
