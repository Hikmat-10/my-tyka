import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { MemberAuthProvider } from "./contexts/MemberAuthContext";
import { Toaster } from "./components/ui/sonner";
import { useEffect } from "react";
import { createTestMember } from "./utils/createTestMember";

export default function App() {
  useEffect(() => {
    // Load Supabase init asynchronously
    import("./supabase-init").catch((error) => {
      console.warn("Supabase init warning:", error);
    });

    // Create test member for development
    if (!localStorage.getItem("tykaTestMemberCreated")) {
      createTestMember();
      localStorage.setItem("tykaTestMemberCreated", "true");
    }
  }, []);

  return (
    <AdminAuthProvider>
      <MemberAuthProvider>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
      </MemberAuthProvider>
    </AdminAuthProvider>
  );
}