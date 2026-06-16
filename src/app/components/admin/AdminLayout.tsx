import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard,
  Users,
  Video,
  GraduationCap,
  FileText,
  UserCog,
  BarChart3,
  LogOut,
  Menu,
  X,
  Calculator,
  UserCheck,
  Building2,
  Lightbulb,
  Shield,
  Headphones,
  Compass,
  DollarSign
} from "lucide-react";
import { useState } from "react";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin-tyka-secure/login");
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/admin-tyka-secure/login");
  };

  if (!user) return null;

  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/admin-tyka-secure/") {
      return currentPath === "/admin-tyka-secure/" || currentPath === "/admin-tyka-secure";
    }
    return currentPath.startsWith(path);
  };

  const getMenuItems = () => {
    switch (user.role) {
      case "super_admin":
        return [
          { label: "Tableau de bord", icon: LayoutDashboard, path: "/admin-tyka-secure/", enabled: true },
          { label: "Finances", icon: DollarSign, path: "/admin-tyka-secure/finances", enabled: true },
          { label: "Répertoire Membres", icon: Users, path: "/admin-tyka-secure/membres", enabled: true },
          { label: "Gestion Partenaires", icon: Building2, path: "/admin-tyka-secure/partenaires", enabled: true },
          { label: "TYKA Compass", icon: Compass, path: "/admin-tyka-secure/compass", enabled: true },
          { label: "Initiatives", icon: Lightbulb, path: "/admin-tyka-secure/initiatives", enabled: false },
          { label: "Journal d'Activité", icon: BarChart3, path: "/admin-tyka-secure/activite", enabled: false },
          { label: "Paramètres", icon: Shield, path: "/admin-tyka-secure/parametres", enabled: false },
        ];
      case "business_dev":
        return [
          { label: "Dashboard", icon: LayoutDashboard, path: "/admin-tyka-secure/", enabled: true },
          { label: "Estimations", icon: Calculator, path: "/admin-tyka-secure/", enabled: true },
          { label: "Base Membres", icon: Users, path: "/admin-tyka-secure/membres", enabled: true },
          { label: "TYKA Compass", icon: Compass, path: "/admin-tyka-secure/compass", enabled: true },
        ];
      case "learning_dev":
        return [
          { label: "Dashboard", icon: LayoutDashboard, path: "/admin-tyka-secure/", enabled: true },
          { label: "Vidéos & Podcasts", icon: Video, path: "/admin-tyka-secure/", enabled: true },
          { label: "Cohortes", icon: GraduationCap, path: "/admin-tyka-secure/", enabled: true },
          { label: "Bibliothèque", icon: FileText, path: "/admin-tyka-secure/", enabled: false },
        ];
      case "ambassador":
        return [
          { label: "Dashboard", icon: LayoutDashboard, path: "/admin-tyka-secure/", enabled: true },
          { label: "Base Membres", icon: Users, path: "/admin-tyka-secure/membres", enabled: true },
          { label: "Ambassadeurs", icon: UserCheck, path: "/admin-tyka-secure/", enabled: true },
        ];
      default:
        return [{ label: "Dashboard", icon: LayoutDashboard, path: "/admin-tyka-secure/", enabled: true }];
    }
  };

  const menuItems = getMenuItems();

  const roleNames: Record<string, string> = {
    super_admin: "Super Admin",
    business_dev: "Business Developer",
    learning_dev: "Learning Developer",
    ambassador: "Ambassador Admin"
  };

  const roleColors: Record<string, string> = {
    super_admin: "from-[#8B2500] to-[#D4522A]",
    business_dev: "from-[#1e3a5f] to-[#2563EB]",
    learning_dev: "from-[#1a4731] to-[#16a34a]",
    ambassador: "from-[#44267A] to-[#7C3AED]",
  };

  const gradientClass = roleColors[user.role] || roleColors.super_admin;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-16"} bg-gradient-to-b ${gradientClass} text-white transition-all duration-300 fixed h-full z-30 flex flex-col`}
      >
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Logo / Toggle */}
          <div className={`flex items-center ${sidebarOpen ? "justify-between" : "justify-center"} mb-6`}>
            {sidebarOpen ? (
              <>
                <div>
                  <div className="text-xl font-bold tracking-wide">TYKA</div>
                  <div className="text-xs text-white/60">Administration</div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="hover:bg-white/10 p-1.5 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button onClick={() => setSidebarOpen(true)} className="hover:bg-white/10 p-1.5 rounded-lg transition-colors">
                <Menu className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* User Info */}
          {sidebarOpen && (
            <div className="mb-6 p-3 bg-white/10 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="bg-white/20 text-white text-sm font-bold">
                    {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-white/60 truncate">{roleNames[user.role]}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.path) && item.enabled;

              return (
                <button
                  key={index}
                  onClick={() => item.enabled && navigate(item.path)}
                  disabled={!item.enabled}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                    !item.enabled
                      ? "opacity-30 cursor-not-allowed"
                      : active
                      ? "bg-white/25 font-semibold shadow-sm"
                      : "hover:bg-white/15 opacity-85 hover:opacity-100"
                  } ${!sidebarOpen && "justify-center"}`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="text-sm truncate">{item.label}</span>
                  )}
                  {sidebarOpen && active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/15 transition-colors w-full text-left opacity-80 hover:opacity-100 ${!sidebarOpen && "justify-center"}`}
            title={!sidebarOpen ? "Déconnexion" : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarOpen ? "ml-64" : "ml-16"} transition-all duration-300 min-h-screen`}>
        {/* Top bar */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="font-medium text-gray-900">TYKA Admin</span>
            <span>/</span>
            <span>{roleNames[user.role]}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{user.email}</span>
            <div className={`w-2 h-2 rounded-full bg-emerald-400`} title="Connecté" />
          </div>
        </div>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
