import ProtectedRoute from "./ProtectedRoute";
import DashboardContent from "./DashboardContent";
import DataImport from "./DataImport";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div className="p-4 md:p-8 max-w-4xl mx-auto mb-8">
        <DataImport />
      </div>
      <DashboardContent />
    </ProtectedRoute>
  );
}
