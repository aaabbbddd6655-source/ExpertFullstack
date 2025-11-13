import OrderSummary from "../OrderSummary";

export default function OrderSummaryExample() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <OrderSummary
        orderNumber="EV-2024-0123"
        customerName="Sarah Johnson"
        phone="+1 (555) 123-4567"
        createdAt="2024-01-15T10:00:00Z"
        totalAmount={3500}
        status="DESIGN_APPROVAL"
        progressPercent={25}
      />
    </div>
  );
}
