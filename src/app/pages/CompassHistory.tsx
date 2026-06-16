import { Header } from "../components/Header";
import { useMemberAuth } from "../contexts/MemberAuthContext";
import { useNavigate } from "react-router";
import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  Compass, TrendingUp, TrendingDown, Minus, Calendar, Filter, ArrowLeft,
  BarChart3, Eye, Download, Clock
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import type { CompassDiagnostic } from "./TykaCompass";

const STORAGE_KEY_PREFIX = "tykaCompass_";

const BLOCK_LABELS: Record<string, string> = {
  personal: "Développement Personnel",
  professional: "Développement Professionnel",
  entrepreneurial: "Développement Entrepreneurial",
  academic: "Orientation Académique",
};

const BLOCK_COLORS: Record<string, string> = {
  personal: "bg-rose-100 text-rose-700 border-rose-300",
  professional: "bg-blue-100 text-blue-700 border-blue-300",
  entrepreneurial: "bg-purple-100 text-purple-700 border-purple-300",
  academic: "bg-indigo-100 text-indigo-700 border-indigo-300",
};

function getDiagnostics(memberId: string): CompassDiagnostic[] {
  const key = `${STORAGE_KEY_PREFIX}${memberId}`;
  const diags = JSON.parse(localStorage.getItem(key) || "[]");
  return diags.filter((d: CompassDiagnostic) => d.status === "completed");
}

export default function CompassHistory() {
  const { currentMember } = useMemberAuth();
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPeriod, setFilterPeriod] = useState<string>("all");
  const [compareMode, setCompareMode] = useState(false);
  const [selectedDiag1, setSelectedDiag1] = useState<CompassDiagnostic | null>(null);
  const [selectedDiag2, setSelectedDiag2] = useState<CompassDiagnostic | null>(null);

  if (!currentMember) {
    navigate("/");
    return null;
  }

  const allDiagnostics = getDiagnostics(currentMember.id);

  // Filter diagnostics
  const filteredDiagnostics = useMemo(() => {
    let filtered = [...allDiagnostics];

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(d => d.mainBlock === filterType);
    }

    // Filter by period
    if (filterPeriod !== "all") {
      const now = new Date();
      const cutoff = new Date();
      
      switch (filterPeriod) {
        case "month":
          cutoff.setMonth(now.getMonth() - 1);
          break;
        case "quarter":
          cutoff.setMonth(now.getMonth() - 3);
          break;
        case "year":
          cutoff.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(d => new Date(d.createdAt) >= cutoff);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allDiagnostics, filterType, filterPeriod]);

  // Evolution data for chart
  const evolutionData = useMemo(() => {
    const sorted = [...filteredDiagnostics].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    return sorted.map(d => ({
      date: new Date(d.createdAt).toLocaleDateString("fr-FR", { month: "short", year: "numeric" }),
      score: Math.round(d.globalScore),
      type: BLOCK_LABELS[d.mainBlock],
    }));
  }, [filteredDiagnostics]);

  // Stats
  const stats = useMemo(() => {
    if (filteredDiagnostics.length === 0) {
      return { total: 0, avgScore: 0, lastScore: 0, evolution: 0, bestDimension: "", worstDimension: "" };
    }

    const total = filteredDiagnostics.length;
    const avgScore = Math.round(filteredDiagnostics.reduce((sum, d) => sum + d.globalScore, 0) / total);
    const lastDiag = filteredDiagnostics[0];
    const lastScore = Math.round(lastDiag.globalScore);
    
    // Evolution calculation
    let evolution = 0;
    if (filteredDiagnostics.length >= 2) {
      const previous = filteredDiagnostics[1];
      evolution = lastScore - Math.round(previous.globalScore);
    }

    // Best and worst dimensions (from last diagnostic)
    const scores = Object.entries(lastDiag.scores);
    const bestDimension = scores.reduce((a, b) => a[1] > b[1] ? a : b)[0].replace(/_/g, " ");
    const worstDimension = scores.reduce((a, b) => a[1] < b[1] ? a : b)[0].replace(/_/g, " ");

    return { total, avgScore, lastScore, evolution, bestDimension, worstDimension };
  }, [filteredDiagnostics]);

  // Comparison logic
  const comparisonData = useMemo(() => {
    if (!selectedDiag1 || !selectedDiag2) return null;

    const dimensions = new Set([
      ...Object.keys(selectedDiag1.scores),
      ...Object.keys(selectedDiag2.scores)
    ]);

    const improved: string[] = [];
    const stable: string[] = [];
    const declined: string[] = [];

    dimensions.forEach(dim => {
      const score1 = selectedDiag1.scores[dim] || 0;
      const score2 = selectedDiag2.scores[dim] || 0;
      const diff = score2 - score1;

      if (diff > 5) improved.push(dim);
      else if (diff < -5) declined.push(dim);
      else stable.push(dim);
    });

    return { improved, stable, declined };
  }, [selectedDiag1, selectedDiag2]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <Button onClick={() => navigate("/compass")} variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à TYKA Compass
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total évaluations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Score moyen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{stats.avgScore}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Dernier score</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.lastScore}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Évolution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold flex items-center gap-2 ${
                  stats.evolution > 0 ? "text-green-600" : stats.evolution < 0 ? "text-red-600" : "text-gray-600"
                }`}>
                  {stats.evolution > 0 ? <TrendingUp className="w-6 h-6" /> : 
                   stats.evolution < 0 ? <TrendingDown className="w-6 h-6" /> : 
                   <Minus className="w-6 h-6" />}
                  {stats.evolution > 0 ? "+" : ""}{stats.evolution}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type d'évaluation</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tous les types</option>
                    {Object.entries(BLOCK_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
                  <select
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Toute la période</option>
                    <option value="month">Dernier mois</option>
                    <option value="quarter">Dernier trimestre</option>
                    <option value="year">Dernière année</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={() => setCompareMode(!compareMode)}
                    variant={compareMode ? "default" : "outline"}
                  >
                    {compareMode ? "Mode normal" : "Comparer 2 évaluations"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Evolution Chart */}
          {evolutionData.length >= 2 && !compareMode && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Évolution de votre score
                </CardTitle>
                <CardDescription>Progression dans le temps</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Best & Worst Dimensions */}
          {stats.total > 0 && !compareMode && (
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="border-l-4 border-green-500">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                    <TrendingUp className="w-5 h-5" />
                    Point fort principal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-gray-900 capitalize">{stats.bestDimension}</p>
                  <p className="text-sm text-gray-600 mt-2">Continuez à cultiver cette compétence !</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-orange-500">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
                    <TrendingDown className="w-5 h-5" />
                    Axe prioritaire d'amélioration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-gray-900 capitalize">{stats.worstDimension}</p>
                  <p className="text-sm text-gray-600 mt-2">Concentrez vos efforts sur cette dimension</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Comparison Mode */}
          {compareMode && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Comparer deux évaluations</CardTitle>
                <CardDescription>Sélectionnez deux diagnostics pour voir l'évolution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Première évaluation</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => {
                        const diag = filteredDiagnostics.find(d => d.id === e.target.value);
                        setSelectedDiag1(diag || null);
                      }}
                    >
                      <option value="">Sélectionner...</option>
                      {filteredDiagnostics.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} - {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deuxième évaluation</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => {
                        const diag = filteredDiagnostics.find(d => d.id === e.target.value);
                        setSelectedDiag2(diag || null);
                      }}
                    >
                      <option value="">Sélectionner...</option>
                      {filteredDiagnostics.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} - {new Date(d.createdAt).toLocaleDateString("fr-FR")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {comparisonData && (
                  <div className="grid md:grid-cols-3 gap-4 mt-8">
                    <Card className="border-green-200 bg-green-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-green-800">Compétences améliorées</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600 mb-2">{comparisonData.improved.length}</div>
                        <ul className="space-y-1">
                          {comparisonData.improved.map(dim => (
                            <li key={dim} className="text-xs text-green-700 capitalize">{dim.replace(/_/g, " ")}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-blue-800">Compétences stables</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600 mb-2">{comparisonData.stable.length}</div>
                        <ul className="space-y-1">
                          {comparisonData.stable.slice(0, 5).map(dim => (
                            <li key={dim} className="text-xs text-blue-700 capitalize">{dim.replace(/_/g, " ")}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-orange-200 bg-orange-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-orange-800">Compétences en régression</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-600 mb-2">{comparisonData.declined.length}</div>
                        <ul className="space-y-1">
                          {comparisonData.declined.map(dim => (
                            <li key={dim} className="text-xs text-orange-700 capitalize">{dim.replace(/_/g, " ")}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Diagnostics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Historique détaillé</CardTitle>
              <CardDescription>{filteredDiagnostics.length} évaluation(s) complétée(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredDiagnostics.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Compass className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Aucune évaluation trouvée</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Score</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Niveau</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Évolution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredDiagnostics.map((diag, idx) => {
                        const prevDiag = filteredDiagnostics[idx + 1];
                        const evolution = prevDiag ? Math.round(diag.globalScore - prevDiag.globalScore) : null;

                        return (
                          <tr key={diag.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-700">
                              {new Date(diag.createdAt).toLocaleDateString("fr-FR")}
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={BLOCK_COLORS[diag.mainBlock]}>
                                {BLOCK_LABELS[diag.mainBlock]}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-lg font-bold text-blue-600">
                                {Math.round(diag.globalScore)}%
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline">
                                {diag.globalScore >= 75 ? "Excellent" :
                                 diag.globalScore >= 60 ? "Bon" :
                                 diag.globalScore >= 40 ? "En progression" :
                                 "À développer"}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              {evolution !== null ? (
                                <span className={`flex items-center gap-1 font-semibold ${
                                  evolution > 0 ? "text-green-600" :
                                  evolution < 0 ? "text-red-600" :
                                  "text-gray-600"
                                }`}>
                                  {evolution > 0 ? <TrendingUp className="w-4 h-4" /> :
                                   evolution < 0 ? <TrendingDown className="w-4 h-4" /> :
                                   <Minus className="w-4 h-4" />}
                                  {evolution > 0 ? "+" : ""}{evolution}%
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}