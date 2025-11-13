import StageManager from "../StageManager";

export default function StageManagerExample() {
  const mockStage = {
    id: "stage-1",
    stageType: "DESIGN_APPROVAL",
    status: "IN_PROGRESS" as const,
    notes: "Sent design mockup to customer for review"
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <StageManager
        stage={mockStage}
        onUpdate={(id, status, notes) => {
          console.log("Stage updated:", { id, status, notes });
        }}
      />
    </div>
  );
}
