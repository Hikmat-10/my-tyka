import { AdminLayout } from "../../components/admin/AdminLayout";
import { MemberProfilePanel } from "../../components/admin/MemberProfilePanel";
import {
  Users, Search, Download, ChevronLeft, ChevronRight,
  CheckCircle2, Clock, XCircle, SlidersHorizontal, X,
  ArrowUpDown, FileText, RefreshCw
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { useState, useEffect, useMemo } from "react";
import { getAllMembers, validateMember } from "../../services/dataService";
import { toast } from "sonner";
import { useAdminAuth } from "../../contexts/AdminAuthContext";

const PAGE_SIZE = 20;

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  active: { label: "Validé", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  pending_validation: { label: "En attente", color: "bg-amber-100 text-amber-700", icon: Clock },
  rejected: { label: "Rejeté", color: "bg-red-100 text-red-700", icon: XCircle },
};

type SortKey = "name" | "date" | "country" | "status";

export default function MembersDirectory() {
  const { user } = useAdminAuth();
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterDomain, setFilterDomain] = useState("all");
  const [filterAmbassador, setFilterAmbassador] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const canValidate = user?.role === "super_admin" || user?.role === "ambassador";

  const loadMembers = () => {
    const members = getAllMembers();
    setAllMembers(members);
  };

  useEffect(() => {
    loadMembers();
    window.addEventListener("tykaMemberValidated", loadMembers);
    return () => window.removeEventListener("tykaMemberValidated", loadMembers);
  }, []);

  const countries = useMemo(() => Array.from(new Set(allMembers.map(m => m.country).filter(Boolean))).sort(), [allMembers]);
  const domains = useMemo(() => Array.from(new Set(allMembers.flatMap(m => m.interests || []).filter(Boolean))).sort(), [allMembers]);
  const ambassadorCodes = useMemo(() => Array.from(new Set(allMembers.map(m => m.ambassadorReferralCode).filter(Boolean))).sort(), [allMembers]);

  const filtered = useMemo(() => {
    let list = [...allMembers];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.phone?.toLowerCase().includes(q) ||
        m.activity?.toLowerCase().includes(q) ||
        m.country?.toLowerCase().includes(q) ||
        m.city?.toLowerCase().includes(q)
      );
    }

    if (filterStatus !== "all") {
      list = list.filter(m => (m.validationStatus || "active") === filterStatus);
    }

    if (filterCountry !== "all") {
      list = list.filter(m => m.country === filterCountry);
    }

    if (filterDomain !== "all") {
      list = list.filter(m => m.interests?.includes(filterDomain));
    }

    if (filterAmbassador !== "all") {
      list = list.filter(m => m.ambassadorReferralCode === filterAmbassador);
    }

    list.sort((a, b) => {
      let va: any, vb: any;
      switch (sortKey) {
        case "name":
          va = `${a.firstName} ${a.lastName}`.toLowerCase();
          vb = `${b.firstName} ${b.lastName}`.toLowerCase();
          break;
        case "date":
          va = new Date(a.joinedAt || 0).getTime();
          vb = new Date(b.joinedAt || 0).getTime();
          break;
        case "country":
          va = a.country || "";
          vb = b.country || "";
          break;
        case "status":
          va = a.validationStatus || "active";
          vb = b.validationStatus || "active";
          break;
        default:
          va = vb = "";
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [allMembers, search, filterStatus, filterCountry, filterDomain, filterAmbassador, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

  const handleValidate = (memberId: string, status: "active" | "rejected", e: React.MouseEvent) => {
    e.stopPropagation();
    validateMember(memberId, status);
    loadMembers();
    toast.success(status === "active" ? "✅ Membre validé" : "Membre rejeté");
  };

  const handleExportCSV = () => {
    const headers = ["Prénom", "Nom", "Email", "Téléphone", "WhatsApp", "Pays", "Ville", "Activité", "Date d'inscription", "Code ambassadeur", "Statut"];
    const rows = filtered.map(m => [
      m.firstName || "",
      m.lastName || "",
      m.email || "",
      m.phone || "",
      m.whatsapp || "",
      m.country || "",
      m.city || "",
      m.activity || "",
      m.joinedAt ? new Date(m.joinedAt).toLocaleDateString("fr-FR") : "",
      m.ambassadorReferralCode || "",
      (m.validationStatus || "active") === "active" ? "Validé" :
        (m.validationStatus || "active") === "pending_validation" ? "En attente" : "Rejeté"
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
      .join("\n");

    const blob = new Blob(["﻿" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `tyka_membres_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success(`Export CSV réussi — ${filtered.length} membres`);
  };

  const handleExportJSON = () => {
    const data = JSON.stringify(filtered.map(m => ({
      prenom: m.firstName,
      nom: m.lastName,
      email: m.email,
      telephone: m.phone,
      pays: m.country,
      ville: m.city,
      activite: m.activity,
      inscription: m.joinedAt,
      codeAmbassadeur: m.ambassadorReferralCode,
      statut: m.validationStatus || "active",
    })), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `tyka_membres_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    toast.success(`Export JSON réussi — ${filtered.length} membres`);
  };

  const statsRow = useMemo(() => ({
    total: allMembers.length,
    validated: allMembers.filter(m => (m.validationStatus || "active") === "active").length,
    pending: allMembers.filter(m => m.validationStatus === "pending_validation").length,
    rejected: allMembers.filter(m => m.validationStatus === "rejected").length,
    viaAmbassadors: allMembers.filter(m => m.ambassadorReferralCode).length,
  }), [allMembers]);

  const hasActiveFilters = filterStatus !== "all" || filterCountry !== "all" || filterDomain !== "all" || filterAmbassador !== "all";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="flex items-center gap-3" style={{ fontSize: "1.75rem", fontWeight: 700 }}>
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              Répertoire des Membres
            </h1>
            <p className="text-gray-500 mt-1 ml-[52px]">Base communautaire TYKA — {allMembers.length} membre{allMembers.length > 1 ? "s" : ""} inscrit{allMembers.length > 1 ? "s" : ""}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handleExportCSV} className="flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={handleExportJSON} className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4" />
              Export JSON
            </Button>
            <Button variant="outline" onClick={loadMembers} className="flex items-center gap-2 text-sm">
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Stats mini-bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total", value: statsRow.total, color: "border-gray-200", text: "text-gray-800" },
            { label: "Validés", value: statsRow.validated, color: "border-emerald-200", text: "text-emerald-700" },
            { label: "En attente", value: statsRow.pending, color: "border-amber-200", text: "text-amber-700" },
            { label: "Rejetés", value: statsRow.rejected, color: "border-red-200", text: "text-red-600" },
            { label: "Via ambassadeurs", value: statsRow.viaAmbassadors, color: "border-purple-200", text: "text-purple-700" },
          ].map(s => (
            <div key={s.label} className={`bg-white rounded-xl border-2 ${s.color} p-4 text-center`}>
              <div className={`text-2xl font-bold ${s.text}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Rechercher par nom, email, pays, activité..."
                  className="pl-9"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              {/* Status filter */}
              <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Tous statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="active">Validés</SelectItem>
                  <SelectItem value="pending_validation">En attente</SelectItem>
                  <SelectItem value="rejected">Rejetés</SelectItem>
                </SelectContent>
              </Select>

              {/* Country filter */}
              <Select value={filterCountry} onValueChange={(v) => { setFilterCountry(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Tous pays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous pays</SelectItem>
                  {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>

              {/* More filters toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 ${showFilters ? "bg-amber-50 border-amber-300 text-amber-700" : ""}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtres avancés
                {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-amber-500" />}
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-3">
                <Select value={filterDomain} onValueChange={(v) => { setFilterDomain(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Domaine d'intérêt" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous domaines</SelectItem>
                    {domains.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={filterAmbassador} onValueChange={(v) => { setFilterAmbassador(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-52">
                    <SelectValue placeholder="Code ambassadeur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous ambassadeurs</SelectItem>
                    {ambassadorCodes.map(code => (
                      <SelectItem key={code} value={code}>Code: {code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button variant="ghost" onClick={() => {
                    setFilterStatus("all"); setFilterCountry("all");
                    setFilterDomain("all"); setFilterAmbassador("all");
                    setCurrentPage(1);
                  }} className="text-gray-500 text-sm flex items-center gap-1">
                    <X className="w-3.5 h-3.5" />
                    Effacer les filtres
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results info */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {filtered.length} membre{filtered.length > 1 ? "s" : ""} trouvé{filtered.length > 1 ? "s" : ""}
            {search && <span className="text-amber-600 ml-1">pour "{search}"</span>}
          </span>
          <span>Page {currentPage} / {Math.max(totalPages, 1)}</span>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Membre</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">
                    <SortButton label="Email" onClick={() => toggleSort("name")} active={sortKey === "name"} dir={sortDir} />
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Téléphone</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden xl:table-cell">Organisation / Activité</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">
                    <SortButton label="Pays" onClick={() => toggleSort("country")} active={sortKey === "country"} dir={sortDir} />
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden xl:table-cell">
                    <SortButton label="Inscription" onClick={() => toggleSort("date")} active={sortKey === "date"} dir={sortDir} />
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Code Amb.</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    <SortButton label="Statut" onClick={() => toggleSort("status")} active={sortKey === "status"} dir={sortDir} />
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                      <p>Aucun membre ne correspond à vos critères</p>
                    </td>
                  </tr>
                ) : (
                  paginated.map((member) => {
                    const status = member.validationStatus || "active";
                    const sc = statusConfig[status] || statusConfig.active;
                    const StatusIcon = sc.icon;
                    const initials = `${member.firstName?.[0] || ""}${member.lastName?.[0] || ""}`.toUpperCase();
                    const joinedDate = member.joinedAt
                      ? new Date(member.joinedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "2-digit" })
                      : "—";

                    return (
                      <tr
                        key={member.id}
                        className="hover:bg-amber-50/30 cursor-pointer transition-colors"
                        onClick={() => { setSelectedMember(member); setShowPanel(true); }}
                      >
                        {/* Member Name + Avatar */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9 flex-shrink-0">
                              {member.profileImage && <AvatarImage src={member.profileImage} alt={member.firstName} />}
                              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-bold">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                              <p className="text-xs text-gray-400 lg:hidden">{member.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                          <span className="truncate max-w-xs block">{member.email}</span>
                        </td>

                        {/* Phone */}
                        <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                          {member.phone || member.whatsapp || <span className="text-gray-300">—</span>}
                        </td>

                        {/* Activity */}
                        <td className="px-4 py-3 text-gray-600 hidden xl:table-cell">
                          <span className="truncate max-w-[160px] block">{member.activity || <span className="text-gray-300">—</span>}</span>
                        </td>

                        {/* Country */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {member.country ? (
                            <span className="text-gray-700">
                              {member.city ? `${member.city}, ` : ""}{member.country}
                            </span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-gray-500 text-xs hidden xl:table-cell whitespace-nowrap">
                          {joinedDate}
                        </td>

                        {/* Ambassador Code */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          {member.ambassadorReferralCode ? (
                            <span className="text-xs font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                              {member.ambassadorReferralCode}
                            </span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {sc.label}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedMember(member); setShowPanel(true); }}
                              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-800 transition-colors"
                              title="Voir la fiche"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            {canValidate && status === "pending_validation" && (
                              <>
                                <button
                                  onClick={(e) => handleValidate(member.id, "active", e)}
                                  className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 hover:text-emerald-800 transition-colors"
                                  title="Valider"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => handleValidate(member.id, "rejected", e)}
                                  className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 transition-colors"
                                  title="Rejeter"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
              <span className="text-xs text-gray-500">
                {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} sur {filtered.length}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  let page = i + 1;
                  if (totalPages > 7) {
                    if (currentPage <= 4) page = i + 1;
                    else if (currentPage >= totalPages - 3) page = totalPages - 6 + i;
                    else page = currentPage - 3 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all ${
                        currentPage === page
                          ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm"
                          : "hover:bg-white border border-transparent hover:border-gray-200 text-gray-600"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Member Profile Panel */}
      <MemberProfilePanel
        member={selectedMember}
        isOpen={showPanel}
        onClose={() => { setShowPanel(false); setSelectedMember(null); }}
        onMemberUpdated={loadMembers}
        canValidate={canValidate}
      />
    </AdminLayout>
  );
}

function SortButton({ label, onClick, active, dir }: { label: string; onClick: () => void; active: boolean; dir: "asc" | "desc" }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 hover:text-gray-900 transition-colors">
      {label}
      <ArrowUpDown className={`w-3.5 h-3.5 ${active ? "text-amber-500" : "text-gray-300"}`} />
    </button>
  );
}
