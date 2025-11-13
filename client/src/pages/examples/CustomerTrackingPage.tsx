import CustomerTrackingPage from "../CustomerTrackingPage";

export default function CustomerTrackingPageExample() {
  return (
    <CustomerTrackingPage
      onBack={() => console.log("Navigate back")}
    />
  );
}
