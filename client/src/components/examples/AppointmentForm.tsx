import AppointmentForm from "../AppointmentForm";

export default function AppointmentFormExample() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <AppointmentForm
        onSubmit={(data) => {
          console.log("Appointment submitted:", data);
        }}
      />
    </div>
  );
}
