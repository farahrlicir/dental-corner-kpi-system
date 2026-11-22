
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

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
        {/* Public pages */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login/:role" element={<LoginPage />} />
        <Route path="/register/dentist" element={<DentistRegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Authenticated application */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "DENTIST"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dentists"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DentistsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/assistants"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "DENTIST"]}>
                <AssistantsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/kpis"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <KpiManagementPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/evaluations"
            element={
              <ProtectedRoute allowedRoles={["DENTIST"]}>
                <EvaluationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/evaluation-history"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <EvaluationHistoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-performance"
            element={
              <ProtectedRoute allowedRoles={["ASSISTANT"]}>
                <MyPerformancePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MonthlyReportsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/change-password"
            element={<ChangePasswordPage />}
          />

          <Route
            path="/profile"
            element={<ProfilePage />}
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Unknown URLs */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
