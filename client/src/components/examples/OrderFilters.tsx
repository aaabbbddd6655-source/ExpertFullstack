import { useState } from "react";
import OrderFilters from "../OrderFilters";

export default function OrderFiltersExample() {
  const [status, setStatus] = useState("all");
  const [stage, setStage] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  return (
    <div className="p-6">
      <OrderFilters
        selectedStatus={status}
        selectedStage={stage}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onStatusChange={setStatus}
        onStageChange={setStage}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onReset={() => {
          setStatus("all");
          setStage("all");
          setDateFrom(undefined);
          setDateTo(undefined);
        }}
      />
    </div>
  );
}
