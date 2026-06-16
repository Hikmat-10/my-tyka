import { Users, BookOpen, Compass, Home, Shield, User as UserIcon, LogOut, Database } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { useState } from "react";
import { RegisterModal } from "./RegisterModal";
import { LoginModal } from "./LoginModal";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { toast } from "sonner";
import { useMemberAuth } from "../contexts/MemberAuthContext";
import { Badge } from "./ui/badge";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const { currentMember, logout } = useMemberAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    toast.success("Déconnexion réussie");
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 hover:opacity-80 transition-all duration-300 group"
          >
            <div className="h-16 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <img
                src="/src/imports/logo_basic.png"
                alt="TYKA"
                className="h-full w-auto object-contain animate-in fade-in-0 duration-500"
              />
            </div>
            <div>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-300 text-xs px-2 py-0"
                title="Base de données Supabase connectée"
              >
                <Database className="w-3 h-3 mr-1" />
                Supabase
              </Badge>
            </div>
          </button>
          
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => navigate("/")}
              className={`flex items-center gap-2 transition-colors ${
                isActive("/") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="font-bold font-normal font-bold">Accueil</span>
            </button>
            <button 
              onClick={() => navigate("/explorer")}
              className={`flex items-center gap-2 transition-colors ${
                isActive("/explorer") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="font-bold">Explorer</span>
            </button>
            <button 
              onClick={() => navigate("/communaute")}
              className={`flex items-center gap-2 transition-colors ${
                isActive("/communaute") ? "text-orange-600" : "text-gray-600 hover:text-orange-600"
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="font-bold">Communauté</span>
            </button>
            <button
              onClick={() => navigate("/co-creer")}
              className={`flex items-center gap-2 transition-colors ${
                isActive("/co-creer") ? "text-green-600" : "text-gray-600 hover:text-green-600"
              }`}
            >
              
              <span className="font-bold">Créer</span>
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin-tyka-secure/login")}
              className="px-3 py-2 text-sm text-gray-400 hover:text-purple-600 transition-colors"
              title="Administration"
            >
              <Shield className="w-4 h-4" />
            </button>
            
            {currentMember ? (
              <>
                <button 
                  onClick={() => navigate("/dashboard")}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-amber-600 transition-colors flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden lg:inline">{currentMember.firstName}</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Déconnexion</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-blue-600 transition-colors font-bold"
                >
                  Connexion
                </button>
                <button 
                  onClick={() => setShowRegisterModal(true)}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all font-bold"
                >
                  Rejoindre
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <RegisterModal open={showRegisterModal} onOpenChange={setShowRegisterModal} />
      <LoginModal 
        open={showLoginModal} 
        onOpenChange={setShowLoginModal}
        onForgotPassword={() => {
          setShowLoginModal(false);
          setShowForgotPasswordModal(true);
        }}
        onRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />
      <ForgotPasswordModal
        open={showForgotPasswordModal}
        onOpenChange={setShowForgotPasswordModal}
        onBackToLogin={() => {
          setShowForgotPasswordModal(false);
          setShowLoginModal(true);
        }}
      />
    </header>
  );
}