
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import Card from "./components/ui/Card";

function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-main">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Monitor your clinic's performance.
        </p>
      </div>

      <Card>
        <h2 className="font-semibold text-text-main">
          Welcome to your dashboard
        </h2>
        <p className="mt-2 text-sm text-text-muted">
          Your clinic overview will appear here.
        </p>
      </Card>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
