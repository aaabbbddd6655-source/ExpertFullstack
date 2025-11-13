import AdminOrdersPage from "../AdminOrdersPage";

export default function AdminOrdersPageExample() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <AdminOrdersPage
        onViewOrder={(id) => console.log("View order:", id)}
      />
    </div>
  );
}
