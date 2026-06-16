import { AdminLayout } from "../../components/admin/AdminLayout";
import { History, Users, TrendingUp, Globe, Briefcase, Brain, Download, ChevronRight, Target } from "lucide-react";
import { useState, useEffect, useMemo, type ReactNode } from "react";
import { CostEstimationTool } from "../../components/admin/CostEstimationTool";
import { getAllMembers, getCohortes } from "../../services/dataService";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const CHART_COLORS = ["#D4522A", "#F59E0B", "#3B82F6", "#10B981", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"];

export default function BusinessDevDashboard() {
  const [members, setMembers] = useState<any[]>([]);
  const [cohortes, setCohortes] = useState<any[]>([]);
  const [estimationHistory, setEstimationHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"analytics" | "capital" | "estimation">("analytics");
  const [selectedMemberDiag, setSelectedMemberDiag] = useState<any | null>(null);

  useEffect(() => {
    setMembers(getAllMembers());
    setCohortes(getCohortes());
    setEstimationHistory(JSON.parse(localStorage.getItem("tykaEstimations") || "[]"));
  }, []);

  const validatedMembers = useMemo(() => members.filter(m => (m.validationStatus || "active") === "active"), [members]);

  // Activity/sector distribution
  const activityData = useMemo(() => {
    const counts: Record<string, number> = {};
    validatedMembers.forEach(m => { if (m.activity) counts[m.activity] = (counts[m.activity] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name: name.length > 18 ? name.slice(0, 18) + "…" : name, value }));
  }, [validatedMembers]);

  // Country distribution
  const countryData = useMemo(() => {
    const counts: Record<string, number> = {};
    validatedMembers.forEach(m => { if (m.country) counts[m.country] = (counts[m.country] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));
  }, [validatedMembers]);

  // Skills mapping across all members
  const skillsData = useMemo(() => {
    const totals: Record<string, { sum: number; count: number }> = {};
    validatedMembers.forEach(m => {
      (m.skills || []).forEach((s: any) => {
        if (!totals[s.name]) totals[s.name] = { sum: 0, count: 0 };
        totals[s.name].sum += s.level;
        totals[s.name].count += 1;
      });
    });
    return Object.entries(totals)
      .map(([name, { sum, count }]) => ({ name: name.length > 20 ? name.slice(0, 20) + "…" : name, avg: parseFloat((sum / count).toFixed(1)), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [validatedMembers]);

  // Interests / needs detection
  const interestsData = useMemo(() => {
    const counts: Record<string, number> = {};
    validatedMembers.forEach(m => { (m.interests || []).forEach((i: string) => { counts[i] = (counts[i] || 0) + 1; }); });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));
  }, [validatedMembers]);

  // Cohort demand — most enrolled
  const cohortDemandData = useMemo(() => {
    const counts: Record<string, { title: string; count: number; domain?: string }> = {};
    validatedMembers.forEach(m => {
      const enrollments = JSON.parse(localStorage.getItem(`tykaCohortEnrollments_${m.id}`) || "[]");
      enrollments.forEach((e: any) => {
        if (!counts[e.cohortId]) counts[e.cohortId] = { title: e.cohortTitle || e.cohortId, count: 0, domain: e.cohortDomain };
        counts[e.cohortId].count += 1;
      });
    });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [validatedMembers]);

  // Capital humain per member
  const membersWithDiag = useMemo(() =>
    validatedMembers
      .filter(m => m.skills?.length > 0)
      .map(m => {
        const avgScore = m.skills.reduce((s: number, sk: any) => s + sk.level, 0) / m.skills.length;
        const strongSkills = m.skills.filter((s: any) => s.level >= 4);
        const weakSkills = m.skills.filter((s: any) => s.level <= 2);
        return { ...m, avgScore: parseFloat(avgScore.toFixed(1)), strongSkills, weakSkills };
      })
      .sort((a, b) => b.avgScore - a.avgScore),
    [validatedMembers]
  );

  const formatFCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

  const kpis = [
    { label: "Membres validés", value: validatedMembers.length, color: "from-[#D4522A] to-amber-600", icon: Users },
    { label: "Pays représentés", value: countryData.length, color: "from-blue-600 to-blue-400", icon: Globe },
    { label: "Domaines d'activité", value: activityData.length, color: "from-emerald-600 to-emerald-400", icon: Briefcase },
    { label: "Profils avec diagnostic", value: membersWithDiag.length, color: "from-purple-600 to-purple-400", icon: Brain },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Developer</h1>
            <p className="text-gray-500 mt-1">Tableau de bord stratégique & diagnostic communautaire</p>
          </div>
          <button
            onClick={() => {
              const data = {
                generatedAt: new Date().toISOString(),
                members: validatedMembers.length,
                countries: countryData,
                activities: activityData,
                skills: skillsData,
                interests: interestsData,
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = "tyka-diagnostic.json"; a.click();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-xl text-sm hover:bg-[#162d4a] transition-colors"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(({ label, value, color, icon: Icon }) => (
            <div key={label} className={`rounded-xl p-4 bg-gradient-to-br ${color} text-white shadow-sm`}>
              <Icon className="w-5 h-5 opacity-80 mb-2" />
              <div className="text-3xl font-bold">{value}</div>
              <div className="text-xs opacity-75 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
          {([["analytics", "Analytiques"], ["capital", "Capital Humain"], ["estimation", "Estimations"]] as const).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? "bg-white text-[#1e3a5f] shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* === ANALYTICS TAB === */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Activity + Country */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Répartition par domaine d'activité" icon={Briefcase} subtitle={`${activityData.length} domaines identifiés`}>
                {activityData.length === 0 ? <EmptyChart /> : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={activityData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                      <XAxis type="number" tick={{ fontSize: 11, fill: "#6b7280" }} />
                      <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: "#374151" }} />
                      <Tooltip formatter={(v) => [`${v} membres`, "Effectif"]} contentStyle={{ fontSize: 12 }} />
                      <Bar dataKey="value" fill="#D4522A" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title="Distribution géographique" icon={Globe} subtitle={`${countryData.length} pays représentés`}>
                {countryData.length === 0 ? <EmptyChart /> : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={countryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {countryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => [`${v} membres`, ""]} contentStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            {/* Skills + Interests */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Cartographie des compétences" icon={Brain} subtitle="Niveau moyen par compétence déclarée">
                {skillsData.length === 0 ? <EmptyChart /> : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={skillsData} margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} angle={-35} textAnchor="end" height={60} />
                      <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "#6b7280" }} />
                      <Tooltip formatter={(v, n) => [v, n === "avg" ? "Niveau moyen /5" : "Nb membres"]} contentStyle={{ fontSize: 12 }} />
                      <Bar dataKey="avg" name="avg" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title="Centres d'intérêt détectés" icon={Target} subtitle="Détection automatique des besoins">
                {interestsData.length === 0 ? <EmptyChart /> : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={interestsData} margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} angle={-35} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
                      <Tooltip formatter={(v) => [`${v} membres`, "Intéressés"]} contentStyle={{ fontSize: 12 }} />
                      <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            {/* Cohort Demand */}
            {cohortDemandData.length > 0 && (
              <ChartCard title="Demande cohortes — Top inscriptions" icon={TrendingUp} subtitle="Cohortes les plus suivies par les membres actifs">
                <div className="space-y-2 mt-2">
                  {cohortDemandData.map((c, i) => (
                    <div key={c.title} className="flex items-center gap-3">
                      <span className="w-6 text-xs text-gray-400 font-bold text-right">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-sm text-gray-700 truncate">{c.title}</span>
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{c.count} inscrit{c.count > 1 ? "s" : ""}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#D4522A] to-amber-500 rounded-full"
                            style={{ width: `${(c.count / (cohortDemandData[0]?.count || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                      {c.domain && <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 flex-shrink-0">{c.domain}</span>}
                    </div>
                  ))}
                </div>
              </ChartCard>
            )}

            {/* Needs detection */}
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2563EB] rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Opportunités détectées automatiquement
              </h3>
              <p className="text-white/60 text-sm mb-4">Basé sur l'analyse des profils, compétences et centres d'intérêt</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {interestsData.slice(0, 3).map((interest, i) => (
                  <div key={interest.name} className="bg-white/10 rounded-xl p-4 border border-white/15">
                    <div className="text-xs text-blue-200 mb-1">Opportunité #{i + 1}</div>
                    <div className="font-medium mb-1">{interest.name}</div>
                    <div className="text-sm text-white/70">{interest.value} membre{interest.value > 1 ? "s" : ""} concerné{interest.value > 1 ? "s" : ""}</div>
                    <div className="mt-2 text-xs text-blue-200">→ Potentiel cohorte à créer</div>
                  </div>
                ))}
                {interestsData.length === 0 && (
                  <div className="col-span-3 text-center text-white/40 py-4">Données insuffisantes pour la détection automatique</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* === CAPITAL HUMAIN TAB === */}
        {activeTab === "capital" && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <strong>Module Capital Humain</strong> — Diagnostic individuel basé sur les compétences auto-évaluées par chaque membre.
              {membersWithDiag.length} profil{membersWithDiag.length > 1 ? "s" : ""} avec diagnostic disponible.
            </div>

            {membersWithDiag.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">Aucun membre n'a encore renseigné ses compétences</p>
              </div>
            ) : (
              <div className="space-y-3">
                {membersWithDiag.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMemberDiag(selectedMemberDiag?.id === m.id ? null : m)}
                    className="bg-white border border-gray-100 rounded-2xl p-4 cursor-pointer hover:border-blue-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {`${m.firstName?.[0] || ""}${m.lastName?.[0] || ""}`.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">{m.firstName} {m.lastName}</span>
                          {m.activity && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{m.activity}</span>}
                          {m.country && <span className="text-xs text-gray-500">{m.country}</span>}
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <ScoreBadge value={m.avgScore} />
                          <span className="text-xs text-gray-400">{m.skills.length} compétence{m.skills.length > 1 ? "s" : ""}</span>
                          {m.strongSkills.length > 0 && <span className="text-xs text-emerald-600">✓ {m.strongSkills.length} fort{m.strongSkills.length > 1 ? "es" : "e"}</span>}
                          {m.weakSkills.length > 0 && <span className="text-xs text-amber-600">↗ {m.weakSkills.length} à développer</span>}
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${selectedMemberDiag?.id === m.id ? "rotate-90" : ""}`} />
                    </div>

                    {selectedMemberDiag?.id === m.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Compétences auto-évaluées</p>
                            <div className="space-y-2">
                              {m.skills.map((s: any) => (
                                <div key={s.name} className="flex items-center gap-3">
                                  <span className="text-xs text-gray-600 w-36 flex-shrink-0">{s.name}</span>
                                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${s.level >= 4 ? "bg-emerald-500" : s.level <= 2 ? "bg-amber-400" : "bg-blue-400"}`}
                                      style={{ width: `${(s.level / 5) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-400 w-8 text-right">{s.level}/5</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-3">
                            {m.strongSkills.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">Points forts</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {m.strongSkills.map((s: any) => (
                                    <span key={s.name} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs border border-emerald-100">{s.name}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {m.weakSkills.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">À renforcer</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {m.weakSkills.map((s: any) => (
                                    <span key={s.name} className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs border border-amber-100">{s.name}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {m.interests?.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Centres d'intérêt</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {m.interests.map((i: string) => (
                                    <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-100">{i}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === ESTIMATION TAB === */}
        {activeTab === "estimation" && (
          <div className="space-y-6">
            <CostEstimationTool />

            {estimationHistory.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                  <History className="w-4 h-4 text-gray-500" />
                  <span className="font-semibold text-gray-900">Historique des estimations</span>
                  <span className="ml-auto text-xs text-gray-400">{estimationHistory.length} enregistrement(s)</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {estimationHistory.map((item) => (
                    <div key={item.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900">{item.project?.title || "Sans titre"}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === "approved" ? "bg-emerald-100 text-emerald-700" : item.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                              {item.status === "approved" ? "✅ Approuvé" : item.status === "pending" ? "⏳ En attente" : "Brouillon"}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div><span className="text-gray-400 block">Modalité</span><span className="font-medium text-gray-700">{item.project?.modality === "online" ? "En ligne" : item.project?.modality === "physical" ? "Présentiel" : "Hybride"}</span></div>
                            <div><span className="text-gray-400 block">Participants</span><span className="font-medium text-gray-700">{item.project?.participants || "-"}</span></div>
                            <div><span className="text-gray-400 block">Coûts totaux</span><span className="font-semibold text-red-600">{formatFCFA(item.calculations?.CTD || 0)}</span></div>
                            <div><span className="text-gray-400 block">Marge TYKA</span><span className={`font-semibold ${(item.calculations?.MT || 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatFCFA(item.calculations?.MT || 0)}</span></div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {new Date(item.submittedAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function ChartCard({ title, icon: Icon, subtitle, children }: { title: string; icon: any; subtitle?: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-gray-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-40 flex items-center justify-center text-gray-300 text-sm">
      Données insuffisantes
    </div>
  );
}

function ScoreBadge({ value }: { value: number }) {
  const color = value >= 4 ? "bg-emerald-100 text-emerald-700" : value >= 3 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${color}`}>
      {value}/5
    </span>
  );
}
