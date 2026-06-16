import { AdminLayout } from "../../components/admin/AdminLayout";
import {
  Compass, Users, TrendingUp, Eye, Search, Filter, Download,
  ChevronDown, ChevronRight, Star, AlertCircle, MessageSquare,
  User, X, Save, BarChart3
} from "lucide-react";
import { useState, useMemo } from "react";
import { getAllMembers } from "../../services/dataService";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import type { MainBlock, SubType, CompassDiagnostic } from "../TykaCompass";

const STORAGE_KEY_PREFIX = "tykaCompass_";

const BLOCK_LABELS: Record<MainBlock, string> = {
  personal: "Développement Personnel",
  professional: "Développement Professionnel",
  entrepreneurial: "Développement Entrepreneurial",
  academic: "Orientation Académique",
};

const SUBTYPE_LABELS: Record<SubType, string> = {
  startup: "Création d'entreprise",
  business: "Développement business",
  "post-bac": "Orientation Post-Bac",
  "licence-master": "Licence → Master",
};

const BLOCK_COLORS: Record<MainBlock, string> = {
  personal: "bg-rose-100 text-rose-700",
  professional: "bg-blue-100 text-blue-700",
  entrepreneurial: "bg-purple-100 text-purple-700",
  academic: "bg-indigo-100 text-indigo-700",
};

interface DiagWithMember extends CompassDiagnostic {
  memberName: string;
  memberEmail: string;
  coachAssigned?: string;
  mentorAssigned?: string;
  adminNote?: string;
}

function getAllDiagnostics(members: any[]): DiagWithMember[] {
  const result: DiagWithMember[] = [];
  members.forEach(m => {
    try {
      const diags: CompassDiagnostic[] = JSON.parse(localStorage.getItem(`${STORAGE_KEY_PREFIX}${m.id}`) || "[]");
      diags.forEach(d => {
        const meta = JSON.parse(localStorage.getItem(`tykaCompassMeta_${d.id}`) || "{}");
        result.push({
          ...d,
          memberName: `${m.firstName} ${m.lastName}`,
          memberEmail: m.email,
          coachAssigned: meta.coachAssigned,
          mentorAssigned: meta.mentorAssigned,
          adminNote: meta.adminNote,
        });
      });
    } catch {}
  });
  return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

function saveDiagMeta(diagId: string, meta: { coachAssigned?: string; mentorAssigned?: string; adminNote?: string }) {
  const existing = JSON.parse(localStorage.getItem(`tykaCompassMeta_${diagId}`) || "{}");
  localStorage.setItem(`tykaCompassMeta_${diagId}`, JSON.stringify({ ...existing, ...meta }));
}

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 70 ? "#16a34a" : score >= 40 ? "#D4522A" : "#dc2626";
  return (
    <div className="relative w-10 h-10 flex-shrink-0">
      <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
        <circle cx="20" cy="20" r="16" fill="none" stroke="#f0f0f0" strokeWidth="4" />
        <circle cx="20" cy="20" r="16" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 16}`}
          strokeDashoffset={`${2 * Math.PI * 16 * (1 - score / 100)}`} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

export default function CompassAdminDashboard() {
  const allMembers = getAllMembers();
  const [diagnostics, setDiagnostics] = useState<DiagWithMember[]>(() => getAllDiagnostics(allMembers));
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<MainBlock | "all">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "in_progress">("all");
  const [filterPriority, setFilterPriority] = useState(false);
  const [selectedDiag, setSelectedDiag] = useState<DiagWithMember | null>(null);
  const [editMeta, setEditMeta] = useState({ coachAssigned: "", mentorAssigned: "", adminNote: "" });

  function refresh() {
    setDiagnostics(getAllDiagnostics(allMembers));
  }

  function openPanel(diag: DiagWithMember) {
    setSelectedDiag(diag);
    setEditMeta({ coachAssigned: diag.coachAssigned ?? "", mentorAssigned: diag.mentorAssigned ?? "", adminNote: diag.adminNote ?? "" });
  }

  function saveMeta() {
    if (!selectedDiag) return;
    saveDiagMeta(selectedDiag.id, editMeta);
    refresh();
    toast.success("Informations sauvegardées");
    setSelectedDiag(prev => prev ? { ...prev, ...editMeta } : prev);
  }

  function handleExport() {
    const rows = filtered.map(d => [
      d.memberName, d.memberEmail, BLOCK_LABELS[d.mainBlock], d.status, d.globalScore,
      new Date(d.createdAt).toLocaleDateString("fr-FR"), d.coachAssigned ?? "", d.mentorAssigned ?? "", d.adminNote ?? ""
    ]);
    const header = ["Membre", "Email", "Type", "Statut", "Score", "Date", "Coach", "Mentor", "Note admin"];
    const csv = [header, ...rows].map(r => r.join(";")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `tyka-compass-export-${Date.now()}.csv`;
    a.click();
    toast.success("Export CSV téléchargé");
  }

  const filtered = useMemo(() => {
    return diagnostics.filter(d => {
      if (filterType !== "all" && d.mainBlock !== filterType) return false;
      if (filterStatus !== "all" && d.status !== filterStatus) return false;
      if (filterPriority && d.globalScore >= 40) return false;
      if (search && !d.memberName.toLowerCase().includes(search.toLowerCase()) && !d.memberEmail.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [diagnostics, filterType, filterStatus, filterPriority, search]);

  // Stats
  const stats = useMemo(() => {
    const completed = diagnostics.filter(d => d.status === "completed");
    const avgScore = completed.length > 0 ? Math.round(completed.reduce((a, d) => a + d.globalScore, 0) / completed.length) : 0;
    const priority = completed.filter(d => d.globalScore < 40).length;
    const typeCount = Object.keys(BLOCK_LABELS).reduce((acc, t) => {
      acc[t] = diagnostics.filter(d => d.mainBlock === t).length;
      return acc;
    }, {} as Record<string, number>);
    return { total: diagnostics.length, completed: completed.length, avgScore, priority, typeCount };
  }, [diagnostics]);

  const topType = Object.entries(stats.typeCount).sort(([, a], [, b]) => b - a)[0]?.[0] as MainBlock | undefined;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-[#D4522A] rounded-xl flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>TYKA Compass — Administration</h1>
              <p className="text-gray-500 text-sm">Suivi des diagnostics et plans de développement des membres</p>
            </div>
          </div>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />Exporter CSV
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total diagnostics", value: stats.total, icon: BarChart3, color: "from-blue-500 to-blue-600" },
            { label: "Complétés", value: stats.completed, icon: Star, color: "from-emerald-500 to-emerald-600" },
            { label: "Score moyen", value: `${stats.avgScore}%`, icon: TrendingUp, color: "from-amber-500 to-orange-500" },
            { label: "Profils prioritaires", value: stats.priority, icon: AlertCircle, color: "from-rose-500 to-red-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className={`w-9 h-9 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Type distribution */}
        {stats.total > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Répartition par type de diagnostic</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.typeCount).filter(([, c]) => c > 0).sort(([, a], [, b]) => b - a).map(([type, count]) => (
                <div key={type} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${BLOCK_COLORS[type as MainBlock]}`}>
                  <span>{BLOCK_LABELS[type as MainBlock]}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Rechercher un membre..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" value={filterType} onChange={e => setFilterType(e.target.value as any)}>
              <option value="all">Tous les types</option>
              {Object.entries(BLOCK_LABELS).map(([t, label]) => <option key={t} value={t}>{label}</option>)}
            </select>
            <select className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)}>
              <option value="all">Tous statuts</option>
              <option value="completed">Complétés</option>
              <option value="in_progress">En cours</option>
            </select>
            <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm cursor-pointer select-none hover:bg-gray-50 transition-colors">
              <input type="checkbox" checked={filterPriority} onChange={e => setFilterPriority(e.target.checked)} className="accent-rose-500" />
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              Prioritaires uniquement
            </label>
          </div>
        </div>

        {/* Diagnostics table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Compass className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-400 text-sm">Aucun diagnostic trouvé</p>
              {diagnostics.length === 0 && <p className="text-xs text-gray-400 mt-1">Les diagnostics apparaîtront ici dès qu'un membre en complètera un.</p>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Membre", "Type", "Score", "Statut", "Date", "Coach/Mentor", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(diag => (
                    <tr key={diag.id} className={`hover:bg-gray-50/50 transition-colors ${diag.globalScore < 40 && diag.status === "completed" ? "bg-rose-50/30" : ""}`}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{diag.memberName}</p>
                          <p className="text-xs text-gray-400">{diag.memberEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${BLOCK_COLORS[diag.mainBlock]}`}>{BLOCK_LABELS[diag.mainBlock]}</span>
                      </td>
                      <td className="px-4 py-3">
                        {diag.status === "completed" ? <ScoreCircle score={diag.globalScore} /> : <span className="text-xs text-gray-400 italic">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {diag.status === "completed"
                          ? <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">Complété</span>
                          : <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">En cours</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{new Date(diag.updatedAt).toLocaleDateString("fr-FR")}</td>
                      <td className="px-4 py-3">
                        {diag.coachAssigned || diag.mentorAssigned ? (
                          <div className="text-xs text-gray-600 space-y-0.5">
                            {diag.coachAssigned && <p>🎯 {diag.coachAssigned}</p>}
                            {diag.mentorAssigned && <p>👤 {diag.mentorAssigned}</p>}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300 italic">Non assigné</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => openPanel(diag)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors font-medium">
                          <Eye className="w-3 h-3" />Voir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail slide-over */}
      <AnimatePresence>
        {selectedDiag && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDiag(null)} />
            <motion.div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-50 shadow-2xl overflow-y-auto" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}>
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#D4522A]" />
                  <span className="font-semibold text-gray-900">Diagnostic — {selectedDiag.memberName}</span>
                </div>
                <button onClick={() => setSelectedDiag(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Info summary */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium">{BLOCK_LABELS[selectedDiag.mainBlock]}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Statut</span><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selectedDiag.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{selectedDiag.status === "completed" ? "Complété" : "En cours"}</span></div>
                  {selectedDiag.status === "completed" && <div className="flex justify-between"><span className="text-gray-500">Score global</span><span className="font-bold text-[#D4522A]">{selectedDiag.globalScore}%</span></div>}
                  <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{new Date(selectedDiag.updatedAt).toLocaleDateString("fr-FR")}</span></div>
                </div>

                {/* Scores breakdown */}
                {selectedDiag.status === "completed" && Object.entries(selectedDiag.scores).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Scores par dimension</h4>
                    <div className="space-y-2.5">
                      {Object.entries(selectedDiag.scores).map(([dim, score]) => (
                        <div key={dim}>
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span className="capitalize">{dim.replace(/_/g, " ")}</span>
                            <span className="font-semibold">{score}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: score >= 70 ? "#16a34a" : score >= 40 ? "#D4522A" : "#dc2626" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {selectedDiag.recommendations?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Recommandations générées</h4>
                    <div className="space-y-3">
                      {selectedDiag.recommendations.map((rec, i) => (
                        <div key={i} className="border-l-4 border-amber-300 pl-3">
                          <p className="text-xs font-semibold text-gray-700 mb-1">{rec.category}</p>
                          <ul className="space-y-0.5">
                            {rec.items.map((item, j) => <li key={j} className="text-xs text-gray-500 flex items-start gap-1"><ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-amber-400" />{item}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin assignment */}
                <div className="border-t border-gray-100 pt-5 space-y-4">
                  <h4 className="text-sm font-semibold text-gray-800">Assignation & suivi admin</h4>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Coach assigné</label>
                    <input value={editMeta.coachAssigned} onChange={e => setEditMeta(p => ({ ...p, coachAssigned: e.target.value }))} placeholder="Nom du coach" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Mentor assigné</label>
                    <input value={editMeta.mentorAssigned} onChange={e => setEditMeta(p => ({ ...p, mentorAssigned: e.target.value }))} placeholder="Nom du mentor" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Note personnalisée</label>
                    <textarea value={editMeta.adminNote} onChange={e => setEditMeta(p => ({ ...p, adminNote: e.target.value }))} rows={3} placeholder="Commentaire, observation, plan d'accompagnement..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 transition-colors resize-none" />
                  </div>
                  <button onClick={saveMeta} className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#D4522A] to-[#8B2500] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity">
                    <Save className="w-4 h-4" />Enregistrer
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}