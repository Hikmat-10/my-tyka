import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Database, 
  Users, 
  Video, 
  Award,
  Activity,
  TrendingUp,
  Server
} from "lucide-react";
import * as supabaseService from "../services/supabaseService";

interface TestResult {
  name: string;
  status: "pending" | "success" | "error";
  message?: string;
  data?: any;
}

export default function SupabaseTest() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [allPassed, setAllPassed] = useState(false);

  const updateTest = (name: string, status: TestResult["status"], message?: string, data?: any) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name);
      if (existing) {
        return prev.map(t => t.name === name ? { ...t, status, message, data } : t);
      }
      return [...prev, { name, status, message, data }];
    });
  };

  const runTests = async () => {
    setIsRunning(true);
    setTests([]);
    setAllPassed(false);

    const testsList = [
      { name: "Health Check", icon: Server },
      { name: "Initialize Default Data", icon: Database },
      { name: "Get All Videos", icon: Video },
      { name: "Get All Members", icon: Users },
      { name: "Get All Ambassadors", icon: Award },
      { name: "Create Test Member", icon: Users },
      { name: "Login Test Member", icon: Users },
      { name: "Get Member Stats", icon: TrendingUp },
      { name: "Create Test Video", icon: Video },
      { name: "Add Watched Video", icon: Activity },
    ];

    // Initialize tests with pending status
    testsList.forEach(test => {
      updateTest(test.name, "pending");
    });

    try {
      // Test 1: Health Check
      const healthResult = await supabaseService.checkHealth();
      if (healthResult.success) {
        updateTest("Health Check", "success", `✅ Server is healthy - ${JSON.stringify(healthResult.data)}`);
      } else {
        updateTest("Health Check", "error", `❌ ${healthResult.error}`);
        setIsRunning(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 2: Initialize Default Data
      const initResult = await supabaseService.initializeDefaultData();
      if (initResult.success) {
        updateTest("Initialize Default Data", "success", `✅ ${initResult.data?.message || 'Data initialized'}`);
      } else {
        updateTest("Initialize Default Data", "error", `❌ ${initResult.error}`);
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 3: Get All Videos
      const videosResult = await supabaseService.getAllVideos();
      if (videosResult.success) {
        updateTest("Get All Videos", "success", `✅ Found ${videosResult.data?.length || 0} videos`, videosResult.data);
      } else {
        updateTest("Get All Videos", "error", `❌ ${videosResult.error}`);
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 4: Get All Members
      const membersResult = await supabaseService.getAllMembers();
      if (membersResult.success) {
        updateTest("Get All Members", "success", `✅ Found ${membersResult.data?.length || 0} members`, membersResult.data);
      } else {
        updateTest("Get All Members", "error", `❌ ${membersResult.error}`);
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 5: Get All Ambassadors
      const ambassadorsResult = await supabaseService.getAllAmbassadors();
      if (ambassadorsResult.success) {
        updateTest("Get All Ambassadors", "success", `✅ Found ${ambassadorsResult.data?.length || 0} ambassadors`, ambassadorsResult.data);
      } else {
        updateTest("Get All Ambassadors", "error", `❌ ${ambassadorsResult.error}`);
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 6: Create Test Member
      const testEmail = `test_${Date.now()}@tyka.com`;
      const createMemberResult = await supabaseService.createMember({
        email: testEmail,
        password: "test123",
        firstName: "Test",
        lastName: "User",
        country: "France",
        city: "Paris",
      });
      
      let testMemberId: string | undefined;
      if (createMemberResult.success && createMemberResult.data) {
        testMemberId = createMemberResult.data.id;
        updateTest("Create Test Member", "success", `✅ Member created: ${createMemberResult.data.firstName} ${createMemberResult.data.lastName} (${createMemberResult.data.ambassadorCode})`, createMemberResult.data);
      } else {
        updateTest("Create Test Member", "error", `❌ ${createMemberResult.error}`);
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 7: Login Test Member (will fail due to validation status)
      if (testMemberId) {
        const loginResult = await supabaseService.login(testEmail, "test123");
        if (!loginResult.success && loginResult.error?.includes("pending validation")) {
          updateTest("Login Test Member", "success", `✅ Login correctly blocked: pending validation`);
          
          // Validate the member
          const validateResult = await supabaseService.validateMember(testMemberId, "active");
          if (validateResult.success) {
            // Try login again
            const loginRetryResult = await supabaseService.login(testEmail, "test123");
            if (loginRetryResult.success) {
              updateTest("Login Test Member", "success", `✅ Login successful after validation`, loginRetryResult.data);
            } else {
              updateTest("Login Test Member", "error", `❌ Login failed after validation: ${loginRetryResult.error}`);
            }
          }
        } else if (loginResult.success) {
          updateTest("Login Test Member", "success", `✅ Login successful`, loginResult.data);
        } else {
          updateTest("Login Test Member", "error", `❌ ${loginResult.error}`);
        }
      } else {
        updateTest("Login Test Member", "error", "❌ No member ID to test login");
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 8: Get Member Stats
      if (testMemberId) {
        const statsResult = await supabaseService.getMemberStats(testMemberId);
        if (statsResult.success) {
          updateTest("Get Member Stats", "success", `✅ Stats retrieved`, statsResult.data);
        } else {
          updateTest("Get Member Stats", "error", `❌ ${statsResult.error}`);
        }
      } else {
        updateTest("Get Member Stats", "error", "❌ No member ID to get stats");
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 9: Create Test Video
      const createVideoResult = await supabaseService.createVideo({
        title: "Test Video " + Date.now(),
        instructor: "Test Instructor",
        duration: "10 min",
        thumbnail: "https://via.placeholder.com/300",
        type: "formation",
        category: "test",
      });
      
      let testVideoId: string | undefined;
      if (createVideoResult.success && createVideoResult.data) {
        testVideoId = createVideoResult.data.id;
        updateTest("Create Test Video", "success", `✅ Video created: ${createVideoResult.data.title}`, createVideoResult.data);
      } else {
        updateTest("Create Test Video", "error", `❌ ${createVideoResult.error}`);
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 10: Add Watched Video
      if (testMemberId && testVideoId) {
        const watchedResult = await supabaseService.addWatchedVideo(testMemberId, {
          videoId: testVideoId,
          videoTitle: "Test Video",
          videoThumbnail: "https://via.placeholder.com/300",
          videoInstructor: "Test Instructor",
          videoDuration: "10 min",
        });
        
        if (watchedResult.success) {
          updateTest("Add Watched Video", "success", `✅ Watched video added`, watchedResult.data);
        } else {
          updateTest("Add Watched Video", "error", `❌ ${watchedResult.error}`);
        }
      } else {
        updateTest("Add Watched Video", "error", "❌ Missing member or video ID");
      }

      // Check if all tests passed
      const allSuccess = tests.every(t => t.status === "success");
      setAllPassed(allSuccess);

    } catch (error) {
      console.error("Test suite error:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "pending":
        return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
    }
  };

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "pending":
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🧪 TYKA Supabase Connection Test
          </h1>
          <p className="text-gray-600">
            Vérification de la connexion et des fonctionnalités de la base de données Supabase
          </p>
        </div>

        <Card className="mb-6 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-6 h-6 text-blue-500" />
              Test Suite
            </CardTitle>
            <CardDescription>
              Cliquez sur "Lancer les tests" pour vérifier toutes les connexions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={runTests}
              disabled={isRunning}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              size="lg"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Tests en cours...
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5 mr-2" />
                  Lancer les tests
                </>
              )}
            </Button>

            {tests.length > 0 && !isRunning && (
              <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Résultat global</span>
                  {allPassed ? (
                    <Badge className="bg-green-500">
                      ✅ Tous les tests sont passés !
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500">
                      ⚠️ Certains tests ont échoué
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {tests.length > 0 && (
          <div className="space-y-4">
            {tests.map((test, index) => (
              <Card key={test.name} className={`border-2 ${getStatusColor(test.status)}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(test.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {index + 1}. {test.name}
                        </h3>
                        <Badge variant={test.status === "success" ? "default" : test.status === "error" ? "destructive" : "secondary"}>
                          {test.status}
                        </Badge>
                      </div>
                      {test.message && (
                        <p className="text-sm text-gray-600 mb-2">{test.message}</p>
                      )}
                      {test.data && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            Voir les données
                          </summary>
                          <pre className="mt-2 p-3 bg-gray-900 text-green-400 rounded text-xs overflow-x-auto">
                            {JSON.stringify(test.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {tests.length === 0 && !isRunning && (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="pt-12 pb-12 text-center">
              <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun test lancé. Cliquez sur le bouton ci-dessus pour commencer.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
