import AdminOrderDetailsPage from "../AdminOrderDetailsPage";

export default function AdminOrderDetailsPageExample() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <AdminOrderDetailsPage
        orderId="1"
        onBack={() => console.log("Navigate back")}
      />
    </div>
  );
}
