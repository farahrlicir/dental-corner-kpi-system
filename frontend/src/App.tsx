
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DentistsPage from "./pages/admin/dentists/DentistsPage";
import AssistantsPage from "./pages/admin/assistants/AssistantsPage";
import KpiManagementPage from "./pages/admin/kpis/KpiManagementPage";
import EvaluationsPage from "./pages/evaluations/EvaluationsPage";
import EvaluationHistoryPage from "./pages/evaluations/EvaluationHistoryPage";
import MonthlyReportsPage from "./pages/admin/reports/MonthlyReportsPage";
import MyPerformancePage from "./pages/assistant/MyPerformancePage";
import WelcomePage from "./pages/public/WelcomePage";
import LoginPage from "./pages/auth/LoginPage";
import DentistRegisterPage from "./pages/auth/DentistRegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ChangePasswordPage from "./pages/settings/ChangePasswordPage";
import ProfilePage from "./pages/settings/ProfilePage";
import SettingsPage from "./pages/settings/SettingsPage";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          <Route path="dentists" element={<DentistsPage />} />
          <Route path="assistants" element={<AssistantsPage />} />
          <Route path="kpis" element={<KpiManagementPage />} />
          <Route path="evaluations" element={<EvaluationsPage />} />
          <Route path="evaluation-history" element={<EvaluationHistoryPage />}/>
          <Route path="reports" element={<MonthlyReportsPage />} />
          <Route path="my-performance" element={<MyPerformancePage />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login/:role" element={<LoginPage />} />
        <Route path="/register/dentist" element={<DentistRegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
