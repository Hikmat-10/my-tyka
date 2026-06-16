import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Explorer from "./pages/Explorer";
import Community from "./pages/Community";
import CoCreate from "./pages/CoCreate";
import UserProfile from "./pages/UserProfile";
import EditProfile from "./pages/EditProfile";
import CommunityProfile from "./pages/CommunityProfile";
import MemberDashboard from "./pages/MemberDashboard";
import Trombinoscope from "./pages/Trombinoscope";
import TykaCompass from "./pages/TykaCompass";
import CompassHistory from "./pages/CompassHistory";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminRouter from "./pages/admin/AdminRouter";
import SupabaseTest from "./pages/SupabaseTest";
import TestMemberAuth from "./pages/TestMemberAuth";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/explorer",
    Component: Explorer,
  },
  {
    path: "/communaute",
    Component: Community,
  },
  {
    path: "/co-creer",
    Component: CoCreate,
  },
  {
    path: "/profile",
    Component: UserProfile,
  },
  {
    path: "/profil/modifier",
    Component: EditProfile,
  },
  {
    path: "/profil/communaute",
    Component: CommunityProfile,
  },
  {
    path: "/dashboard",
    Component: MemberDashboard,
  },
  {
    path: "/trombinoscope",
    Component: Trombinoscope,
  },
  {
    path: "/compass",
    Component: TykaCompass,
  },
  {
    path: "/compass/historique",
    Component: CompassHistory,
  },
  {
    path: "/admin-tyka-secure/login",
    Component: AdminLogin,
  },
  {
    path: "/admin-tyka-secure/*",
    Component: AdminRouter,
  },
  {
    path: "/test-supabase",
    Component: SupabaseTest,
  },
  {
    path: "/test-auth",
    Component: TestMemberAuth,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);