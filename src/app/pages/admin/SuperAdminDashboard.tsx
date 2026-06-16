import { AdminLayout } from "../../components/admin/AdminLayout";
import {
  Users, TrendingUp, GraduationCap, Activity, CheckCircle, XCircle,
  Clock, FileText, Eye, Shield, UserCheck, Building2, Lightbulb,
  Video, ArrowRight, ArrowUpRight, Calendar, Plus, Trash2, CheckSquare,
  Link, Upload, Search as SearchIcon, X as XIcon, Edit2, ExternalLink, CreditCard
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useState, useEffect, useMemo } from "react";
import { getAllMembers, getInitiatives, getCohortes, getVideos, addCohorte, deleteCohorte, updateCohorte, getAllPendingPayments, validatePayment, updateInitiativeStatus } from "../../services/dataService";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";

const RECENT_ACTIVITIES = [
  { user: "business@tyka.com", action: "Nouvelle estimation de coût créée", time: "Il y a 2h", role: "Business Developer" },
  { user: "learning@tyka.com", action: "Ajout de 3 nouvelles vidéos", time: "Il y a 5h", role: "Learning Developer" },
  { user: "ambassador@tyka.com", action: "Validation de 4 membres — Zone Dakar", time: "Il y a 1 jour", role: "Ambassador Admin" },
  { user: "super@tyka.com", action: "Validation d'initiative : Atelier UX", time: "Il y a 2 jours", role: "Super Admin" },
];

const roleColors: Record<string, string> = {
  "Super Admin": "bg-red-100 text-red-700",
  "Business Developer": "bg-blue-100 text-blue-700",
  "Learning Developer": "bg-green-100 text-green-700",
  "Ambassador Admin": "bg-purple-100 text-purple-700",
};

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [initiatives, setInitiatives] = useState<any[]>([]);
  const [estimations, setEstimations] = useState<any[]>([]);
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [cohortes, setCohortes] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [selectedEstimation, setSelectedEstimation] = useState<any>(null);
  const [showEstimationDetail, setShowEstimationDetail] = useState(false);
  const [showAddCohorte, setShowAddCohorte] = useState(false);
  const [showCohortes, setShowCohortes] = useState(false);
  const [showPendingPayments, setShowPendingPayments] = useState(false);
  const [hasPartner, setHasPartner] = useState(false);
  const [showPartnerPicker, setShowPartnerPicker] = useState(false);
  const [partnerPickerSearch, setPartnerPickerSearch] = useState("");
  const [partnerLogoMode, setPartnerLogoMode] = useState<"url" | "file">("url");
  const [coverImageMode, setCoverImageMode] = useState<"url" | "file">("url");
  const [editingCohorte, setEditingCohorte] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showPaymentValidation, setShowPaymentValidation] = useState(false);
  const [lmsAccessLink, setLmsAccessLink] = useState("");
  const [newCohorte, setNewCohorte] = useState({
    title: "", domain: "", description: "", objectives: "", level: "" as "débutant" | "intermédiaire" | "avancé" | "",
    modality: "" as "online" | "presential" | "hybrid" | "", duration: "", startDate: "", endDate: "",
    deadline: "", price: 0, currency: "FCFA", maxParticipants: 30, location: "", coverImage: "",
    status: "draft" as "draft" | "published" | "active" | "upcoming" | "completed" | "closed", accessType: "members" as "public" | "members" | "application" | "paid" | "free",
    partnerName: "", partnerType: "propulsée" as "propulsée" | "partenariat" | "soutenue" | "parrainée",
    partnerSector: "", partnerDescription: "", partnerRole: "", partnerWebsite: "",
    partnerLogo: "", partnerEmail: "", partnerPhone: "", partnerContact: "",
    proposedBy: "TYKA" as "TYKA" | "partner" | "member",
    proposedByMemberName: "",
    additionalInfo: "",
  });

  const allPartners: any[] = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("tykaPartners") || "[]").filter((p: any) => p.status !== "archived"); }
    catch { return []; }
  }, [showPartnerPicker]);

  useEffect(() => {
    const members = getAllMembers();
    setAllMembers(members);
    setInitiatives(getInitiatives().filter(i => i.status === "pending"));
    setEstimations(JSON.parse(localStorage.getItem("tykaEstimations") || "[]").filter((e: any) => e.status === "pending"));
    setCohortes(getCohortes());
    setVideos(getVideos());
    setPendingPayments(getAllPendingPayments());
  }, []);

  const stats = useMemo(() => {
    const validated = allMembers.filter(m => (m.validationStatus || "active") === "active").length;
    const pending = allMembers.filter(m => m.validationStatus === "pending_validation").length;
    const viaAmbassadors = allMembers.filter(m => m.ambassadorReferralCode).length;
    const partners = cohortes.filter(c => c.partner).reduce((set: Set<string>, c: any) => set.add(c.partner.name), new Set<string>()).size;
    const activeCohortes = cohortes.filter(c => c.status === "active").length;
    const allInitiatives = getInitiatives();

    const engagementRate = allMembers.length > 0
      ? Math.round((validated / allMembers.length) * 100)
      : 0;

    return {
      totalMembers: allMembers.length,
      membresValides: validated,
      membresEnAttente: pending,
      viaAmbassadors,
      initiatives: allInitiatives.length,
      cohortes: cohortes.length,
      activeCohortes,
      partenaires: partners,
      formations: videos.length,
      engagementRate,
    };
  }, [allMembers, cohortes, videos]);

  const recentMembers = useMemo(() => {
    return [...allMembers]
      .sort((a, b) => new Date(b.joinedAt || 0).getTime() - new Date(a.joinedAt || 0).getTime())
      .slice(0, 6);
  }, [allMembers]);

  const handleValidateInitiative = (id: string) => {
    updateInitiativeStatus(id, "approved", "Admin Principal", "Super Admin", "Initiative approuvée par l'équipe TYKA");
    setInitiatives(prev => prev.filter(i => i.id !== id));
    toast.success("✅ Initiative validée ! Le membre a été notifié.");
  };

  const handleRejectInitiative = (id: string) => {
    updateInitiativeStatus(id, "rejected", "Admin Principal", "Super Admin", "Initiative rejetée après examen");
    setInitiatives(prev => prev.filter(i => i.id !== id));
    toast.error("Initiative rejetée");
  };

  const handleValidateEstimation = (id: string) => {
    const updated = estimations.map(e => e.id === id ? { ...e, status: "approved" } : e);
    localStorage.setItem("tykaEstimations", JSON.stringify(updated));
    setEstimations(prev => prev.filter(e => e.id !== id));
    toast.success("Estimation validée !");
    setShowEstimationDetail(false);
  };

  const handleAddCohorte = () => {
    if (!newCohorte.title || !newCohorte.domain || !newCohorte.description || !newCohorte.modality || !newCohorte.level) {
      toast.error("Remplir tous les champs obligatoires (titre, domaine, description, modalité, niveau)");
      return;
    }
    const data: any = {
      title: newCohorte.title, domain: newCohorte.domain, description: newCohorte.description,
      objectives: newCohorte.objectives || undefined, modality: newCohorte.modality as any,
      level: newCohorte.level as any, duration: newCohorte.duration || undefined,
      price: newCohorte.price, currency: newCohorte.currency, maxParticipants: newCohorte.maxParticipants,
      location: newCohorte.location || undefined, coverImage: newCohorte.coverImage || undefined,
      deadline: newCohorte.deadline || "À définir", status: newCohorte.status, accessType: newCohorte.accessType,
      startDate: newCohorte.startDate || undefined, endDate: newCohorte.endDate || undefined,
      proposedBy: newCohorte.proposedBy,
      proposedByMemberName: newCohorte.proposedBy === "member" ? newCohorte.proposedByMemberName || undefined : undefined,
      additionalInfo: newCohorte.additionalInfo || undefined,
    };
    if (hasPartner && newCohorte.partnerName) {
      data.partner = { name: newCohorte.partnerName, partnershipType: newCohorte.partnerType, sector: newCohorte.partnerSector || undefined, description: newCohorte.partnerDescription || undefined, role: newCohorte.partnerRole || undefined, website: newCohorte.partnerWebsite || undefined, logo: newCohorte.partnerLogo || undefined, email: newCohorte.partnerEmail || undefined, phone: newCohorte.partnerPhone || undefined, contactPrincipal: newCohorte.partnerContact || undefined };
    }

    if (editingCohorte) {
      // Mode édition : mettre à jour la cohorte existante
      updateCohorte(editingCohorte.id, data);
      setCohortes(getCohortes());
      setShowAddCohorte(false);
      setEditingCohorte(null);
      setHasPartner(false);
      setNewCohorte({ title: "", domain: "", description: "", objectives: "", level: "", modality: "", duration: "", startDate: "", endDate: "", deadline: "", price: 0, currency: "FCFA", maxParticipants: 30, location: "", coverImage: "", status: "draft", accessType: "members", partnerName: "", partnerType: "propulsée", partnerSector: "", partnerDescription: "", partnerRole: "", partnerWebsite: "", partnerLogo: "", partnerEmail: "", partnerPhone: "", partnerContact: "", proposedBy: "TYKA", proposedByMemberName: "", additionalInfo: "" });
      toast.success("✅ Cohorte mise à jour avec succès !");
    } else {
      // Mode création : ajouter une nouvelle cohorte
      addCohorte(data);
      setCohortes(getCohortes());
      setShowAddCohorte(false);
      setHasPartner(false);
      setNewCohorte({ title: "", domain: "", description: "", objectives: "", level: "", modality: "", duration: "", startDate: "", endDate: "", deadline: "", price: 0, currency: "FCFA", maxParticipants: 30, location: "", coverImage: "", status: "draft", accessType: "members", partnerName: "", partnerType: "propulsée", partnerSector: "", partnerDescription: "", partnerRole: "", partnerWebsite: "", partnerLogo: "", partnerEmail: "", partnerPhone: "", partnerContact: "", proposedBy: "TYKA", proposedByMemberName: "", additionalInfo: "" });
      toast.success("✅ Cohorte créée avec succès !");
    }
  };

  const handleEditCohorte = (cohorte: any) => {
    setEditingCohorte(cohorte);
    setNewCohorte({
      title: cohorte.title || "",
      domain: cohorte.domain || "",
      description: cohorte.description || "",
      objectives: cohorte.objectives || "",
      level: cohorte.level || "",
      modality: cohorte.modality || "",
      duration: cohorte.duration || "",
      startDate: cohorte.startDate || "",
      endDate: cohorte.endDate || "",
      deadline: cohorte.deadline || "",
      price: cohorte.price || 0,
      currency: cohorte.currency || "FCFA",
      maxParticipants: cohorte.maxParticipants || 30,
      location: cohorte.location || "",
      coverImage: cohorte.coverImage || "",
      status: cohorte.status || "draft",
      accessType: cohorte.accessType || "members",
      partnerName: cohorte.partner?.name || "",
      partnerType: cohorte.partner?.partnershipType || "propulsée",
      partnerSector: cohorte.partner?.sector || "",
      partnerDescription: cohorte.partner?.description || "",
      partnerRole: cohorte.partner?.role || "",
      partnerWebsite: cohorte.partner?.website || "",
      partnerLogo: cohorte.partner?.logo || "",
      partnerEmail: cohorte.partner?.email || "",
      partnerPhone: cohorte.partner?.phone || "",
      partnerContact: cohorte.partner?.contactPrincipal || "",
      proposedBy: cohorte.proposedBy || "TYKA",
      proposedByMemberName: cohorte.proposedByMemberName || "",
      additionalInfo: cohorte.additionalInfo || "",
    });
    setHasPartner(!!cohorte.partner);
    setShowAddCohorte(true);
  };

  const handleDeleteCohorte = (id: string) => {
    if (window.confirm("Supprimer cette cohorte ?")) {
      deleteCohorte(id);
      setCohortes(getCohortes());
      toast.success("Cohorte supprimée");
    }
  };

  const handleUpdateCohorteStatus = (id: string, status: "active" | "upcoming" | "completed") => {
    updateCohorte(id, { status });
    setCohortes(getCohortes());
    toast.success("Statut mis à jour");
  };

  const handleRejectEstimation = (id: string) => {
    const updated = estimations.map(e => e.id === id ? { ...e, status: "rejected" } : e);
    localStorage.setItem("tykaEstimations", JSON.stringify(updated));
    setEstimations(prev => prev.filter(e => e.id !== id));
    toast.error("Estimation rejetée");
    setShowEstimationDetail(false);
  };

  const handleValidatePayment = () => {
    if (!selectedPayment || !lmsAccessLink.trim()) {
      toast.error("Veuillez saisir le lien d'accès au LMS TYKA Klasio");
      return;
    }

    const success = validatePayment(
      selectedPayment.memberId,
      selectedPayment.cohortId,
      lmsAccessLink
    );

    if (success) {
      setPendingPayments(getAllPendingPayments());
      setShowPaymentValidation(false);
      setSelectedPayment(null);
      setLmsAccessLink("");
      toast.success("✅ Paiement validé ! Le membre a maintenant accès à la formation.");
    } else {
      toast.error("Erreur lors de la validation du paiement");
    }
  };

  const formatFCFA = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " FCFA";

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D4522A] to-[#8B2500] rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>Super Admin — Tableau de bord</h1>
            </div>
            <p className="text-gray-500 ml-[52px]">Centre de pilotage global de la plateforme TYKA</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => setShowAddCohorte(true)} className="bg-gradient-to-r from-[#D4522A] to-[#8B2500] text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Créer une Cohorte
            </Button>
            <Button onClick={() => navigate("/admin-tyka-secure/membres")} className="bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center gap-2">
              <Users className="w-4 h-4" />
              Répertoire Membres
            </Button>
          </div>
        </div>

        {/* STATS GRID — 4 main + 4 secondary */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Membres</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Membres"
              value={stats.totalMembers}
              icon={Users}
              color="from-blue-500 to-blue-600"
              trend="+12% ce mois"
              trendPositive
              onClick={() => navigate("/admin-tyka-secure/membres")}
            />
            <StatCard
              title="Membres Validés"
              value={stats.membresValides}
              icon={CheckCircle}
              color="from-emerald-500 to-emerald-600"
              trend={`${stats.engagementRate}% du total`}
              trendPositive
              onClick={() => navigate("/admin-tyka-secure/membres")}
            />
            <StatCard
              title="En Attente"
              value={stats.membresEnAttente}
              icon={Clock}
              color="from-amber-500 to-orange-500"
              trend={stats.membresEnAttente > 0 ? "À valider" : "Aucun en attente"}
              trendPositive={stats.membresEnAttente === 0}
              onClick={() => navigate("/admin-tyka-secure/membres")}
            />
            <StatCard
              title="Via Ambassadeurs"
              value={stats.viaAmbassadors}
              icon={UserCheck}
              color="from-purple-500 to-purple-600"
              trend={stats.totalMembers > 0 ? `${Math.round((stats.viaAmbassadors / stats.totalMembers) * 100)}% du total` : "—"}
              trendPositive
            />
          </div>

          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Écosystème</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Initiatives"
              value={stats.initiatives}
              icon={Lightbulb}
              color="from-yellow-500 to-amber-500"
              trend={`${initiatives.length} en attente`}
              trendPositive={initiatives.length === 0}
            />
            <StatCard
              title="Cohortes"
              value={stats.cohortes}
              icon={GraduationCap}
              color="from-[#D4522A] to-[#8B2500]"
              trend={`${stats.activeCohortes} en cours`}
              trendPositive
            />
            <StatCard
              title="Partenaires"
              value={stats.partenaires}
              icon={Building2}
              color="from-teal-500 to-cyan-500"
              trend="Associés aux cohortes"
              trendPositive
            />
            <StatCard
              title="Formations"
              value={stats.formations}
              icon={Video}
              color="from-indigo-500 to-blue-600"
              trend="Vidéos publiées"
              trendPositive
            />
          </div>
        </div>

        {/* Cohortes Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="w-5 h-5 text-[#D4522A]" />
                Gestion des Cohortes
              </CardTitle>
              <CardDescription>{cohortes.length} cohorte(s) • {cohortes.filter(c => c.status === "active").length} en cours</CardDescription>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowCohortes(!showCohortes)} className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                {showCohortes ? "Réduire" : "Voir tout"}
              </button>
              <button onClick={() => setShowAddCohorte(true)} className="flex items-center gap-1.5 text-xs bg-[#D4522A] text-white px-3 py-1.5 rounded-lg hover:bg-[#8B2500] transition-colors">
                <Plus className="w-3 h-3" />
                Créer
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "En cours", count: cohortes.filter(c => c.status === "active").length, color: "bg-emerald-100 text-emerald-700" },
                { label: "À venir", count: cohortes.filter(c => c.status === "upcoming").length, color: "bg-amber-100 text-amber-700" },
                { label: "Terminées", count: cohortes.filter(c => c.status === "completed").length, color: "bg-gray-100 text-gray-600" },
              ].map(s => (
                <div key={s.label} className={`rounded-xl p-3 text-center ${s.color}`}>
                  <div className="text-2xl font-bold">{s.count}</div>
                  <div className="text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
            {/* List (collapsible) */}
            <AnimatePresence>
              {showCohortes && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <div className="space-y-2 mt-2">
                    {cohortes.map(c => {
                      const sc = { active: "bg-emerald-100 text-emerald-700", upcoming: "bg-amber-100 text-amber-700", completed: "bg-gray-100 text-gray-600" };
                      const sl = { active: "En cours", upcoming: "À venir", completed: "Terminée" };
                      const s = c.status || "upcoming";
                      return (
                        <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                          {c.coverImage && <img src={c.coverImage} alt={c.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm text-gray-900 truncate">{c.title}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc[s as keyof typeof sc] || sc.upcoming}`}>
                                {sl[s as keyof typeof sl]}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">{c.domain} • {c.level} • {c.modality}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <select
                              value={c.status || "upcoming"}
                              onChange={e => handleUpdateCohorteStatus(c.id, e.target.value as any)}
                              className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 focus:outline-none focus:border-amber-400"
                              onClick={e => e.stopPropagation()}
                            >
                              <option value="draft">Brouillon</option>
                              <option value="published">Publiée</option>
                              <option value="upcoming">À venir</option>
                              <option value="active">En cours</option>
                              <option value="completed">Terminée</option>
                              <option value="closed">Clôturée</option>
                            </select>
                            <button onClick={() => handleEditCohorte(c)} className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Modifier la cohorte">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteCohorte(c.id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {cohortes.length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        <GraduationCap className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                        Aucune cohorte. Créez la première !
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Engagement Rate */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 bg-gradient-to-br from-[#1a0e05] to-[#2d1810] rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-white/70">Taux d'engagement</span>
            </div>
            <div className="text-5xl font-bold text-amber-400 mb-1">{stats.engagementRate}%</div>
            <p className="text-sm text-white/50">membres validés / total inscrits</p>
            <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all"
                style={{ width: `${stats.engagementRate}%` }}
              />
            </div>
          </div>

          {/* Recent registrations */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#D4522A]" />
                <span className="font-semibold text-gray-900 text-sm">Dernières inscriptions</span>
              </div>
              <button
                onClick={() => navigate("/admin-tyka-secure/membres")}
                className="text-xs text-amber-600 hover:text-amber-800 flex items-center gap-1 font-medium"
              >
                Voir tout <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {recentMembers.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm">Aucun membre inscrit</div>
              ) : (
                recentMembers.map((m) => {
                  const initials = `${m.firstName?.[0] || ""}${m.lastName?.[0] || ""}`.toUpperCase();
                  const status = m.validationStatus || "active";
                  const joinedDate = m.joinedAt
                    ? new Date(m.joinedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
                    : "—";
                  return (
                    <div key={m.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        {m.profileImage && <AvatarImage src={m.profileImage} />}
                        <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-bold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{m.firstName} {m.lastName}</p>
                        <p className="text-xs text-gray-400 truncate">{m.email}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-400">{joinedDate}</span>
                        {status === "pending_validation" && (
                          <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">En attente</span>
                        )}
                        {status === "active" && (
                          <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">Validé</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Pending Payment Validations */}
        {pendingPayments.length > 0 && (
          <Card className="border-2 border-emerald-200">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Paiements en Attente de Validation
              </CardTitle>
              <CardDescription>{pendingPayments.length} paiement(s) soumis par les membres</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {pendingPayments.map((payment) => (
                  <div key={`${payment.memberId}-${payment.cohortId}`} className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{payment.cohortTitle}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {payment.memberName}
                        </span>
                        {payment.memberEmail && <span>{payment.memberEmail}</span>}
                        {payment.paymentSubmittedAt && (
                          <span>{new Date(payment.paymentSubmittedAt).toLocaleDateString("fr-FR")}</span>
                        )}
                        <Badge className="bg-emerald-600 text-white">{formatFCFA(payment.price)}</Badge>
                      </div>
                      {payment.contactWhatsApp && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                          <span>WhatsApp: {payment.contactWhatsApp}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4 flex-shrink-0">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowPaymentValidation(true);
                        }}
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        Paiement bien reçu
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Estimations */}
        {estimations.length > 0 && (
          <Card className="border-2 border-orange-200">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-5 h-5 text-orange-600" />
                Estimations de Coûts en Attente
              </CardTitle>
              <CardDescription>{estimations.length} estimation(s) soumise(s) par les Business Developers</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {estimations.map((est) => (
                  <div key={est.id} className="flex items-center justify-between p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{est.project.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                        <span>{est.submittedBy}</span>
                        <span>{new Date(est.submittedAt).toLocaleDateString("fr-FR")}</span>
                        <Badge className="bg-blue-600 text-white">{formatFCFA(est.costs.pricePerParticipant)} / participant</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4 flex-shrink-0">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedEstimation(est); setShowEstimationDetail(true); }}>
                        <Eye className="w-3.5 h-3.5 mr-1" />Voir
                      </Button>
                      <Button size="sm" variant="outline" className="border-emerald-400 text-emerald-600 hover:bg-emerald-50" onClick={() => handleValidateEstimation(est.id)}>
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />Valider
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-400 text-red-600 hover:bg-red-50" onClick={() => handleRejectEstimation(est.id)}>
                        <XCircle className="w-3.5 h-3.5 mr-1" />Rejeter
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Initiatives */}
        {initiatives.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="w-5 h-5 text-amber-500" />
                Initiatives en Attente de Validation
              </CardTitle>
              <CardDescription>{initiatives.length} initiative(s) à valider</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {initiatives.map((initiative) => (
                  <div key={initiative.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{initiative.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                        <span>Par {initiative.organizer}</span>
                        <span>{new Date(initiative.startDate).toLocaleDateString("fr-FR")}</span>
                        <Badge variant="outline">{initiative.category}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4 flex-shrink-0">
                      <Button size="sm" variant="outline" className="border-emerald-400 text-emerald-600 hover:bg-emerald-50" onClick={() => handleValidateInitiative(initiative.id)}>
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />Valider
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-400 text-red-600 hover:bg-red-50" onClick={() => handleRejectInitiative(initiative.id)}>
                        <XCircle className="w-3.5 h-3.5 mr-1" />Rejeter
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="w-5 h-5 text-gray-500" />
              Journal d'Activité
            </CardTitle>
            <CardDescription>Actions récentes des administrateurs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {RECENT_ACTIVITIES.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 pb-3 border-b border-gray-50 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-medium text-gray-800">{activity.user}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[activity.role] || "bg-gray-100 text-gray-600"}`}>
                        {activity.role}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cohort Creation Dialog */}
        <Dialog open={showAddCohorte} onOpenChange={setShowAddCohorte}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCohorte ? "Modifier la Cohorte" : "Créer une Nouvelle Cohorte"}</DialogTitle>
              <DialogDescription>{editingCohorte ? "Modifiez les informations de cette cohorte" : "Cette cohorte apparaîtra dans l'espace Initiatives & Cohortes"}</DialogDescription>
            </DialogHeader>
            <div className="space-y-5 mt-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b">Informations générales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><Label>Titre *</Label><Input value={newCohorte.title} onChange={e => setNewCohorte({...newCohorte, title: e.target.value})} placeholder="Titre de la cohorte" className="mt-1" /></div>
                  <div>
                    <Label>Domaine *</Label>
                    <Select value={newCohorte.domain} onValueChange={v => setNewCohorte({...newCohorte, domain: v})}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent>{["Leadership","Entrepreneuriat","Innovation","Technologie","Communication","Management","Environnement","Culture","Autre"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Niveau *</Label>
                    <Select value={newCohorte.level} onValueChange={v => setNewCohorte({...newCohorte, level: v as any})}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent><SelectItem value="débutant">Débutant</SelectItem><SelectItem value="intermédiaire">Intermédiaire</SelectItem><SelectItem value="avancé">Avancé</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2"><Label>Description *</Label><Textarea value={newCohorte.description} onChange={e => setNewCohorte({...newCohorte, description: e.target.value})} rows={3} className="mt-1" /></div>
                  <div className="col-span-2"><Label>Objectifs pédagogiques</Label><Textarea value={newCohorte.objectives} onChange={e => setNewCohorte({...newCohorte, objectives: e.target.value})} rows={2} className="mt-1" /></div>
                  <div>
                    <Label>Modalité *</Label>
                    <Select value={newCohorte.modality} onValueChange={v => setNewCohorte({...newCohorte, modality: v as any})}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent><SelectItem value="online">En ligne</SelectItem><SelectItem value="presential">Présentiel</SelectItem><SelectItem value="hybrid">Hybride</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label>Durée</Label><Input value={newCohorte.duration} onChange={e => setNewCohorte({...newCohorte, duration: e.target.value})} placeholder="Ex: 8 semaines" className="mt-1" /></div>
                  <div><Label>Date de début</Label><Input type="date" value={newCohorte.startDate} onChange={e => setNewCohorte({...newCohorte, startDate: e.target.value})} className="mt-1" /></div>
                  <div><Label>Date de fin</Label><Input type="date" value={newCohorte.endDate} onChange={e => setNewCohorte({...newCohorte, endDate: e.target.value})} className="mt-1" /></div>
                  <div><Label>Deadline inscription</Label><Input value={newCohorte.deadline} onChange={e => setNewCohorte({...newCohorte, deadline: e.target.value})} placeholder="Ex: 15 Août 2026" className="mt-1" /></div>
                  <div><Label>Lieu</Label><Input value={newCohorte.location} onChange={e => setNewCohorte({...newCohorte, location: e.target.value})} placeholder="Ex: Dakar" className="mt-1" /></div>
                  <div className="col-span-2">
                    <Label>Proposé par *</Label>
                    <div className="flex gap-2 mt-2">
                      {([["TYKA", "TYKA"], ["partner", "Un partenaire"], ["member", "Un membre TYKA"]] as [string, string][]).map(([val, label]) => (
                        <button key={val} type="button"
                          onClick={() => setNewCohorte({...newCohorte, proposedBy: val as any})}
                          className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${newCohorte.proposedBy === val ? "border-amber-500 bg-amber-50 text-amber-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                    {newCohorte.proposedBy === "member" && (
                      <Input className="mt-2" value={newCohorte.proposedByMemberName} onChange={e => setNewCohorte({...newCohorte, proposedByMemberName: e.target.value})} placeholder="Nom du membre initiateur" />
                    )}
                  </div>
                  <div className="col-span-2"><Label>Informations complémentaires</Label><Textarea value={newCohorte.additionalInfo} onChange={e => setNewCohorte({...newCohorte, additionalInfo: e.target.value})} rows={2} className="mt-1" placeholder="Prérequis, modalités particulières, contact..." /></div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b">Visuels & Paramètres</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Image de couverture</Label>
                    <div className="flex gap-2 mt-2 mb-2">
                      <button type="button" onClick={() => setCoverImageMode("url")} className={`px-3 py-1 text-xs rounded ${coverImageMode === "url" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600"}`}>URL</button>
                      <button type="button" onClick={() => setCoverImageMode("file")} className={`px-3 py-1 text-xs rounded ${coverImageMode === "file" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600"}`}>Importer fichier</button>
                    </div>
                    {coverImageMode === "url" ? (
                      <Input value={newCohorte.coverImage} onChange={e => setNewCohorte({...newCohorte, coverImage: e.target.value})} placeholder="https://images.unsplash.com/..." className="mt-1" />
                    ) : (
                      <input type="file" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = ev => setNewCohorte(prev => ({...prev, coverImage: ev.target?.result as string ?? ""}));
                          reader.readAsDataURL(file);
                        }}
                      />
                    )}
                    {newCohorte.coverImage && <img src={newCohorte.coverImage} alt="Aperçu" className="mt-2 h-32 w-full object-cover rounded-lg border" />}
                  </div>
                  <div>
                    <Label>Statut</Label>
                    <Select value={newCohorte.status} onValueChange={v => setNewCohorte({...newCohorte, status: v as any})}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="upcoming">À venir</SelectItem><SelectItem value="active">En cours</SelectItem><SelectItem value="completed">Terminée</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Accès</Label>
                    <Select value={newCohorte.accessType} onValueChange={v => setNewCohorte({...newCohorte, accessType: v as any})}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="public">Public</SelectItem><SelectItem value="members">Membres TYKA</SelectItem><SelectItem value="application">Sur candidature</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div><Label>Prix (FCFA)</Label><Input type="number" value={newCohorte.price} onChange={e => setNewCohorte({...newCohorte, price: Number(e.target.value)})} className="mt-1" /></div>
                  <div><Label>Nb max participants</Label><Input type="number" value={newCohorte.maxParticipants} onChange={e => setNewCohorte({...newCohorte, maxParticipants: Number(e.target.value)})} className="mt-1" /></div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 pb-2 border-b">Partenaire</h3>
                <div className="flex items-center gap-3 mb-4 p-3 bg-amber-50 rounded-lg border border-amber-100 cursor-pointer" onClick={() => setHasPartner(!hasPartner)}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${hasPartner ? "bg-amber-500 border-amber-500" : "border-gray-300"}`}>
                    {hasPartner && <CheckSquare className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm font-medium text-gray-700">Cette cohorte est soutenue par un partenaire</span>
                </div>
                {hasPartner && (
                  <div className="space-y-4">
                    {/* Pick from existing partners */}
                    <button
                      type="button"
                      onClick={() => setShowPartnerPicker(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-amber-300 text-amber-700 rounded-xl hover:bg-amber-50 transition-colors text-sm font-medium"
                    >
                      <SearchIcon className="w-4 h-4" />
                      Associer un partenaire existant
                    </button>

                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border">
                      {/* Selected partner indicator */}
                      {newCohorte.partnerName && (
                        <div className="col-span-2 flex items-center gap-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
                          {newCohorte.partnerLogo && <img src={newCohorte.partnerLogo} alt="" className="w-8 h-8 rounded object-contain bg-white border p-0.5" />}
                          <span className="text-sm font-semibold text-amber-800">{newCohorte.partnerName}</span>
                          <button type="button" className="ml-auto text-gray-400 hover:text-gray-600" onClick={() => setNewCohorte({...newCohorte, partnerName: "", partnerSector: "", partnerWebsite: "", partnerDescription: "", partnerLogo: "", partnerEmail: "", partnerPhone: "", partnerContact: ""})}>
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      <div><Label>Nom du partenaire *</Label><Input value={newCohorte.partnerName} onChange={e => setNewCohorte({...newCohorte, partnerName: e.target.value})} placeholder="Ex: SOL VERT" className="mt-1" /></div>
                      <div>
                        <Label>Type de mention</Label>
                        <Select value={newCohorte.partnerType} onValueChange={v => setNewCohorte({...newCohorte, partnerType: v as any})}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="propulsée">Formation propulsée par [Nom]</SelectItem>
                            <SelectItem value="partenariat">En partenariat avec [Nom]</SelectItem>
                            <SelectItem value="soutenue">Avec le soutien de [Nom]</SelectItem>
                            <SelectItem value="parrainée">Parrainée par [Nom]</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Logo */}
                      <div className="col-span-2">
                        <Label>Logo du partenaire</Label>
                        <div className="flex gap-2 mt-1 mb-2">
                          <button type="button" onClick={() => setPartnerLogoMode("url")} className={`text-xs px-3 py-1 rounded-full border transition-colors ${partnerLogoMode === "url" ? "bg-amber-500 text-white border-amber-500" : "text-gray-600 border-gray-300 hover:border-amber-400"}`}>
                            <Link className="w-3 h-3 inline mr-1" />URL
                          </button>
                          <button type="button" onClick={() => setPartnerLogoMode("file")} className={`text-xs px-3 py-1 rounded-full border transition-colors ${partnerLogoMode === "file" ? "bg-amber-500 text-white border-amber-500" : "text-gray-600 border-gray-300 hover:border-amber-400"}`}>
                            <Upload className="w-3 h-3 inline mr-1" />Fichier
                          </button>
                        </div>
                        {partnerLogoMode === "url" ? (
                          <Input value={newCohorte.partnerLogo} onChange={e => setNewCohorte({...newCohorte, partnerLogo: e.target.value})} placeholder="https://..." />
                        ) : (
                          <input type="file" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = ev => setNewCohorte(prev => ({...prev, partnerLogo: ev.target?.result as string ?? ""}));
                              reader.readAsDataURL(file);
                            }}
                          />
                        )}
                        {newCohorte.partnerLogo && <img src={newCohorte.partnerLogo} alt="" className="mt-2 h-12 object-contain rounded-lg border bg-white p-1" />}
                      </div>

                      <div><Label>Secteur</Label><Input value={newCohorte.partnerSector} onChange={e => setNewCohorte({...newCohorte, partnerSector: e.target.value})} className="mt-1" /></div>
                      <div><Label>Site web</Label><Input value={newCohorte.partnerWebsite} onChange={e => setNewCohorte({...newCohorte, partnerWebsite: e.target.value})} placeholder="https://..." className="mt-1" /></div>
                      <div><Label>Email</Label><Input type="email" value={newCohorte.partnerEmail} onChange={e => setNewCohorte({...newCohorte, partnerEmail: e.target.value})} placeholder="contact@..." className="mt-1" /></div>
                      <div><Label>Téléphone</Label><Input value={newCohorte.partnerPhone} onChange={e => setNewCohorte({...newCohorte, partnerPhone: e.target.value})} placeholder="+221..." className="mt-1" /></div>
                      <div><Label>Contact principal</Label><Input value={newCohorte.partnerContact} onChange={e => setNewCohorte({...newCohorte, partnerContact: e.target.value})} placeholder="Nom du contact" className="mt-1" /></div>
                      <div className="col-span-2"><Label>Description courte</Label><Textarea value={newCohorte.partnerDescription} onChange={e => setNewCohorte({...newCohorte, partnerDescription: e.target.value})} rows={2} className="mt-1" /></div>
                      <div className="col-span-2"><Label>Rôle dans la cohorte</Label><Textarea value={newCohorte.partnerRole} onChange={e => setNewCohorte({...newCohorte, partnerRole: e.target.value})} rows={2} className="mt-1" /></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => { setShowAddCohorte(false); setEditingCohorte(null); }}>Annuler</Button>
                <Button className="flex-1 bg-gradient-to-r from-[#D4522A] to-[#8B2500]" onClick={handleAddCohorte}>
                  {editingCohorte ? "Enregistrer les modifications" : "Créer la cohorte"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Partner Picker Dialog */}
        <Dialog open={showPartnerPicker} onOpenChange={setShowPartnerPicker}>
          <DialogContent className="max-w-lg max-h-[70vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Associer un partenaire existant</DialogTitle>
              <DialogDescription>Sélectionnez un partenaire depuis le répertoire TYKA</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="Rechercher un partenaire..."
                  value={partnerPickerSearch}
                  onChange={e => setPartnerPickerSearch(e.target.value)}
                />
              </div>
              {allPartners.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-6">Aucun partenaire enregistré dans le répertoire.</p>
              )}
              {allPartners
                .filter((p: any) => !partnerPickerSearch || p.name.toLowerCase().includes(partnerPickerSearch.toLowerCase()) || (p.sector || "").toLowerCase().includes(partnerPickerSearch.toLowerCase()))
                .map((p: any) => (
                  <button
                    key={p.id}
                    type="button"
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-amber-400 hover:bg-amber-50 transition-all text-left"
                    onClick={() => {
                      setNewCohorte(prev => ({
                        ...prev,
                        partnerName: p.name,
                        partnerSector: p.sector || "",
                        partnerDescription: p.description || "",
                        partnerWebsite: p.website || "",
                        partnerLogo: p.logo || "",
                        partnerEmail: p.email || "",
                        partnerPhone: p.phone || "",
                        partnerContact: p.contactPrincipal || "",
                      }));
                      setShowPartnerPicker(false);
                      setPartnerPickerSearch("");
                    }}
                  >
                    {p.logo ? (
                      <img src={p.logo} alt="" className="w-10 h-10 rounded-lg object-contain bg-white border p-0.5 flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.sector}</p>
                      {p.description && <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{p.description}</p>}
                    </div>
                    <span className="text-xs text-amber-600 font-medium flex-shrink-0">Sélectionner →</span>
                  </button>
                ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Validation Dialog */}
        <Dialog open={showPaymentValidation} onOpenChange={setShowPaymentValidation}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                Valider le Paiement et Donner Accès au LMS
              </DialogTitle>
              <DialogDescription>
                Confirmez la réception du paiement et fournissez le lien d'accès à TYKA Klasio
              </DialogDescription>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-5 mt-4">
                {/* Member Info */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Membre</p>
                      <p className="font-semibold text-gray-900">{selectedPayment.memberName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Email</p>
                      <p className="font-medium text-gray-700 truncate">{selectedPayment.memberEmail}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Cohorte</p>
                      <p className="font-medium text-gray-700">{selectedPayment.cohortTitle}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Montant payé</p>
                      <p className="font-bold text-emerald-700">{formatFCFA(selectedPayment.price)}</p>
                    </div>
                    {selectedPayment.contactWhatsApp && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500 mb-0.5">WhatsApp de contact</p>
                        <p className="font-medium text-gray-700">{selectedPayment.contactWhatsApp}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* LMS Link Input */}
                <div>
                  <Label htmlFor="lms-link" className="text-sm font-semibold text-gray-900 mb-2 block">
                    Lien d'accès à TYKA Klasio *
                  </Label>
                  <div className="relative">
                    <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="lms-link"
                      type="url"
                      value={lmsAccessLink}
                      onChange={(e) => setLmsAccessLink(e.target.value)}
                      placeholder="https://klasio.tyka.org/courses/..."
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Ce lien sera affiché dans l'espace personnel du membre pour accéder à sa formation.
                  </p>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-xs text-blue-800 leading-relaxed">
                    <p className="font-semibold mb-1">Après validation :</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Le statut du membre passera à "Paiement validé – Accès LMS disponible"</li>
                      <li>Le membre verra le bouton "Accéder à la formation" dans son espace</li>
                      <li>Le lien redirigera directement vers TYKA Klasio</li>
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowPaymentValidation(false);
                      setSelectedPayment(null);
                      setLmsAccessLink("");
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90"
                    onClick={handleValidatePayment}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Valider le paiement et envoyer l'accès
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Estimation Detail Dialog */}
        <Dialog open={showEstimationDetail} onOpenChange={setShowEstimationDetail}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détails de l'Estimation</DialogTitle>
              <DialogDescription>Projet soumis par le Business Developer</DialogDescription>
            </DialogHeader>
            {selectedEstimation && (
              <div className="space-y-5">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{selectedEstimation.project.title}</h3>
                  <div className="flex gap-4 text-sm">
                    <Badge>{selectedEstimation.project.modality === "online" ? "En ligne" : selectedEstimation.project.modality === "physical" ? "En salle" : "Hybride"}</Badge>
                    <span className="text-gray-600">{selectedEstimation.costs.participants} participants</span>
                  </div>
                </div>
                <div className="bg-white border rounded-xl p-4 space-y-2 text-sm">
                  {[
                    ["Coût salle", selectedEstimation.costs.roomCost],
                    ["Coût formateur", selectedEstimation.costs.trainerCost],
                    ["Restauration", selectedEstimation.costs.cateringCost],
                    ["Logistique", selectedEstimation.costs.logisticsCost],
                    ["Communication", selectedEstimation.costs.communicationCost],
                    ["Frais divers", selectedEstimation.costs.miscCost],
                  ].filter(([, v]) => v > 0).map(([label, value]) => (
                    <div key={label as string} className="flex justify-between">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-medium">{formatFCFA(value as number)}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-4 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Prix par participant</span>
                  <span className="font-bold text-2xl text-[#D4522A]">{formatFCFA(selectedEstimation.costs.pricePerParticipant)}</span>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowEstimationDetail(false)}>Annuler</Button>
                  <Button variant="outline" className="flex-1 border-red-400 text-red-600 hover:bg-red-50" onClick={() => handleRejectEstimation(selectedEstimation.id)}>
                    <XCircle className="w-4 h-4 mr-2" />Rejeter
                  </Button>
                  <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleValidateEstimation(selectedEstimation.id)}>
                    <CheckCircle className="w-4 h-4 mr-2" />Valider
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

function StatCard({
  title, value, icon: Icon, color, trend, trendPositive, onClick
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
  trend: string;
  trendPositive?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-all ${onClick ? "cursor-pointer hover:border-amber-200" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {onClick && <ArrowUpRight className="w-4 h-4 text-gray-300 hover:text-amber-500 transition-colors" />}
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
      <p className={`text-xs font-medium ${trendPositive ? "text-emerald-600" : "text-amber-600"}`}>
        {trend}
      </p>
    </div>
  );
}
