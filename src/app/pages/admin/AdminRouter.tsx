import { useEffect } from "react";
import { useNavigate, Routes, Route } from "react-router";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import SuperAdminDashboard from "./SuperAdminDashboard";
import BusinessDevDashboard from "./BusinessDevDashboard";
import LearningDevDashboard from "./LearningDevDashboard";
import AmbassadorDashboard from "./AmbassadorDashboard";
import MembersDirectory from "./MembersDirectory";
import PartnersDirectory from "./PartnersDirectory";
import CompassAdminDashboard from "./CompassAdminDashboard";
import FinancialDashboard from "./FinancialDashboard";

export default function AdminRouter() {
  const { user, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin-tyka-secure/login");
    }
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  const DefaultDashboard = () => {
    switch (user.role) {
      case "super_admin":    return <SuperAdminDashboard />;
      case "business_dev":   return <BusinessDevDashboard />;
      case "learning_dev":   return <LearningDevDashboard />;
      case "ambassador":     return <AmbassadorDashboard />;
      default:               return <SuperAdminDashboard />;
    }
  };

  return (
    <Routes>
      <Route index element={<DefaultDashboard />} />
      <Route path="membres" element={<MembersDirectory />} />
      <Route path="partenaires" element={<PartnersDirectory />} />
      <Route path="compass" element={<CompassAdminDashboard />} />
      <Route path="finances" element={<FinancialDashboard />} />
      <Route path="*" element={<DefaultDashboard />} />
    </Routes>
  );
}
