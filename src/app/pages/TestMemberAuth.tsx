import { useState, useEffect } from "react";
import { useMemberAuth } from "../contexts/MemberAuthContext";
import { useNavigate } from "react-router";
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

interface TestResult {
  name: string;
  status: "pending" | "running" | "success" | "error";
  message?: string;
  data?: any;
}

export default function TestMemberAuth() {
  const { login, logout, member, isAuthenticated } = useMemberAuth();
  const navigate = useNavigate();
  const [tests, setTests] = useState<TestResult[]>([
    { name: "1. Create Test Member", status: "pending" },
    { name: "2. Login with Test Member", status: "pending" },
    { name: "3. Verify Authentication State", status: "pending" },
    { name: "4. Check localStorage Persistence", status: "pending" },
    { name: "5. Logout", status: "pending" },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => i === index ? { ...test, ...updates } : test));
  };

  const runTests = async () => {
    setIsRunning(true);

    // Test 1: Create test member
    updateTest(0, { status: "running" });
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const testMember = {
        id: "test_" + Date.now(),
        email: "test@tyka.com",
        password: "test123",
        firstName: "Test",
        lastName: "TYKA",
        phone: "+221 77 123 45 67",
        whatsapp: "+221 77 123 45 67",
        country: "Sénégal",
        city: "Dakar",
        bio: "Membre de test automatique",
        interests: ["Leadership", "Innovation"],
        profileImage: "",
        activity: "Testeur Automatique",
        status: "member" as const,
        ambassadorCode: "TEST1234",
        joinedAt: new Date().toISOString(),
        emailConfirmed: true,
        validationStatus: "active" as const,
        visibleInTrombinoscope: true,
        skills: [],
        privacySettings: {
          showEmail: true,
          showWhatsApp: true,
          showPhone: false
        }
      };

      const members = JSON.parse(localStorage.getItem("tykaMembers") || "[]");
      const existingIndex = members.findIndex((m: any) => m.email === "test@tyka.com");
      if (existingIndex >= 0) {
        members[existingIndex] = testMember;
      } else {
        members.push(testMember);
      }
      localStorage.setItem("tykaMembers", JSON.stringify(members));

      updateTest(0, {
        status: "success",
        message: "Test member created successfully",
        data: { email: testMember.email, id: testMember.id }
      });
    } catch (error: any) {
      updateTest(0, { status: "error", message: error.message });
      setIsRunning(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 2: Login
    updateTest(1, { status: "running" });
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const result = await login("test@tyka.com", "test123");

      if (result.success) {
        updateTest(1, {
          status: "success",
          message: "Login successful",
          data: { success: true }
        });
      } else {
        updateTest(1, {
          status: "error",
          message: result.error || "Login failed"
        });
        setIsRunning(false);
        return;
      }
    } catch (error: any) {
      updateTest(1, { status: "error", message: error.message });
      setIsRunning(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 3: Verify authentication state
    updateTest(2, { status: "running" });
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const authState = {
        isAuthenticated,
        hasMember: !!member,
        memberEmail: member?.email,
        memberName: member ? `${member.firstName} ${member.lastName}` : null
      };

      if (isAuthenticated && member && member.email === "test@tyka.com") {
        updateTest(2, {
          status: "success",
          message: "Authentication state verified",
          data: authState
        });
      } else {
        updateTest(2, {
          status: "error",
          message: "Authentication state mismatch",
          data: authState
        });
      }
    } catch (error: any) {
      updateTest(2, { status: "error", message: error.message });
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 4: Check localStorage
    updateTest(3, { status: "running" });
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const storedMember = localStorage.getItem("tykaMember");
      const parsed = storedMember ? JSON.parse(storedMember) : null;

      if (parsed && parsed.email === "test@tyka.com") {
        updateTest(3, {
          status: "success",
          message: "localStorage contains correct member data",
          data: { email: parsed.email, id: parsed.id }
        });
      } else {
        updateTest(3, {
          status: "error",
          message: "localStorage missing or incorrect",
          data: { stored: !!storedMember }
        });
      }
    } catch (error: any) {
      updateTest(3, { status: "error", message: error.message });
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 5: Logout
    updateTest(4, { status: "running" });
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      logout();
      const storedAfterLogout = localStorage.getItem("tykaMember");

      if (!storedAfterLogout) {
        updateTest(4, {
          status: "success",
          message: "Logout successful, localStorage cleared"
        });
      } else {
        updateTest(4, {
          status: "error",
          message: "Logout failed, data still in localStorage"
        });
      }
    } catch (error: any) {
      updateTest(4, { status: "error", message: error.message });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "running":
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "running":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">
            Test d'Authentification TYKA
          </h1>
          <p className="text-gray-600">
            Test automatisé du flux de connexion membre
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>État Actuel de l'Authentification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Authentifié</p>
                <p className="font-semibold flex items-center gap-2">
                  {isAuthenticated ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Oui
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-600" />
                      Non
                    </>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Membre</p>
                <p className="font-semibold">
                  {member ? `${member.firstName} ${member.lastName}` : "Aucun"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tests Automatiques</span>
              <Button
                onClick={runTests}
                disabled={isRunning}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isRunning ? "Tests en cours..." : "Lancer les tests"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tests.map((test, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border transition-all ${getStatusColor(test.status)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getStatusIcon(test.status)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-gray-900">{test.name}</p>
                    {test.message && (
                      <p className="text-sm text-gray-600">{test.message}</p>
                    )}
                    {test.data && (
                      <pre className="text-xs bg-white/50 p-2 rounded mt-2 overflow-auto">
                        {JSON.stringify(test.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
          >
            Retour à l'accueil
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-amber-600 hover:bg-amber-700"
            disabled={!isAuthenticated}
          >
            Aller au Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
