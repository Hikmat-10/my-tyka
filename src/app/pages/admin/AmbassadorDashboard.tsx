import { AdminLayout } from "../../components/admin/AdminLayout";
import { Users, UserCheck, Mail, MapPin, CheckCircle, XCircle, Clock, AlertCircle, Edit2, Trash2, MessageSquare, MessageCircle, Star, X, Save, AlertTriangle, Lightbulb, Megaphone, Eye, ThumbsUp, ThumbsDown, Ban, BarChart2, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { useState, useEffect } from "react";
import { getAllMembers, validateMember, updateMember, deleteMember, getInitiatives, updateInitiative, getAnnouncements, updateAnnouncement, deleteAnnouncement, type Announcement } from "../../services/dataService";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending_validation: { label: "En attente", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-300" },
  active: { label: "Validé", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-300" },
  rejected: { label: "Rejeté", color: "text-red-700", bg: "bg-red-50", border: "border-red-300" },
  incomplete: { label: "Incomplet", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-300" },
  deleted: { label: "Supprimé", color: "text-gray-600", bg: "bg-gray-100", border: "border-gray-300" },
};

export default function AmbassadorDashboard() {
  const { user } = useAdminAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [initiatives, setInitiatives] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [complementRequest, setComplementRequest] = useState<{ id: string; name: string } | null>(null);
  const [complementNote, setComplementNote] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [annTab, setAnnTab] = useState<"pending" | "active" | "all">("pending");

  const loadMembers = () => {
    const all = getAllMembers();
    // Ambassador sees only members recruited via their ambassador code (or all if no code)
    const filtered = user?.ambassadorCode
      ? all.filter((m: any) => m.ambassadorReferralCode === user.ambassadorCode)
      : all;
    setMembers(filtered);
  };

  const loadInitiatives = () => {
    // Load all initiatives with pending status
    const allInitiatives = getInitiatives();
    setInitiatives(allInitiatives.filter(i => i.status === "pending"));
  };

  const loadAnnouncements = () => setAnnouncements(getAnnouncements());

  useEffect(() => {
    loadMembers();
    loadInitiatives();
    loadAnnouncements();
    const handler = () => loadMembers();
    window.addEventListener("tykaMemberValidated", handler);
    return () => window.removeEventListener("tykaMemberValidated", handler);
  }, []);

  const pending = members.filter(m => (m.validationStatus || "active") === "pending_validation");
  const active = members.filter(m => (m.validationStatus || "active") === "active");
  const rejected = members.filter(m => (m.validationStatus || "active") === "rejected");
  const incomplete = members.filter(m => m.validationStatus === "incomplete");

  const filtered = members.filter(m => {
    const q = searchQuery.toLowerCase();
    const name = `${m.firstName || ""} ${m.lastName || ""}`.toLowerCase();
    const matchSearch = !q || name.includes(q) || (m.email || "").toLowerCase().includes(q);
    const vs = m.validationStatus || "active";
    const matchStatus = filterStatus === "all" || vs === filterStatus;
    return matchSearch && matchStatus;
  });

  const WHATSAPP_WELCOME = `Bienvenue dans la communauté TYKA.

Votre inscription a été validée.

Connectez-vous à votre espace membre avec vos identifiants reçus par email.

Découvrez les opportunités, formations, événements et ressources de la communauté.

www.mytyka.org`;

  const handleValidate = (id: string) => {
    validateMember(id, "active");
    toast.success("Membre validé avec succès !");
  };

  const handleSendWelcomeWhatsApp = (member: any) => {
    const phone = (member.whatsapp || member.phone || "").replace(/\s+/g, "").replace(/^\+/, "");
    if (!phone) {
      toast.error("Aucun numéro WhatsApp renseigné pour ce membre");
      return;
    }
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(WHATSAPP_WELCOME)}`;
    window.open(url, "_blank");
  };

  const handleReject = (id: string) => {
    validateMember(id, "rejected");
    toast.error("Membre rejeté");
  };

  const handleMarkIncomplete = (id: string) => {
    updateMember(id, { validationStatus: "incomplete" });
    toast.info("Membre marqué comme Incomplet");
  };

  const handleDelete = (id: string) => {
    deleteMember(id);
    setDeleteConfirm(null);
    toast.success("Membre supprimé");
  };

  const handleSaveEdit = () => {
    if (!editingMember) return;
    updateMember(editingMember.id, {
      firstName: editingMember.firstName,
      lastName: editingMember.lastName,
      activity: editingMember.activity,
      city: editingMember.city,
      country: editingMember.country,
      bio: editingMember.bio,
      phone: editingMember.phone,
      whatsapp: editingMember.whatsapp,
      profileImage: editingMember.profileImage,
    });
    setEditingMember(null);
    toast.success("Fiche membre mise à jour !");
  };

  const handleSendComplement = () => {
    if (!complementRequest) return;
    updateMember(complementRequest.id, { validationStatus: "incomplete", complementNote });
    setComplementRequest(null);
    setComplementNote("");
    toast.info(`Demande de complément envoyée à ${complementRequest.name}`);
  };

  const handleValidateInitiative = (id: string) => {
    updateInitiative(id, { status: "approved" });
    loadInitiatives();
    toast.success("Initiative validée !");
  };

  const handleRejectInitiative = (id: string) => {
    updateInitiative(id, { status: "rejected" });
    loadInitiatives();
    toast.error("Initiative rejetée");
  };

  const initials = (m: any) => `${m.firstName?.[0] || ""}${m.lastName?.[0] || ""}`.toUpperCase();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ambassador Admin</h1>
          <p className="text-gray-500 mt-1">Gestion et suivi des membres recrutés</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "En attente", value: pending.length, color: "border-l-amber-500 bg-amber-50", num: "text-amber-600", icon: Clock },
            { label: "Validés", value: active.length, color: "border-l-emerald-500 bg-emerald-50", num: "text-emerald-600", icon: CheckCircle },
            { label: "Rejetés", value: rejected.length, color: "border-l-red-500 bg-red-50", num: "text-red-600", icon: XCircle },
            { label: "Incomplets", value: incomplete.length, color: "border-l-orange-500 bg-orange-50", num: "text-orange-600", icon: AlertCircle },
          ].map(({ label, value, color, num, icon: Icon }) => (
            <div key={label} className={`rounded-xl border-l-4 p-4 ${color}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 mb-1">{label}</div>
                  <div className={`text-3xl font-bold ${num}`}>{value}</div>
                </div>
                <Icon className={`w-7 h-7 ${num} opacity-60`} />
              </div>
            </div>
          ))}
        </div>

        {/* Alert */}
        {pending.length > 0 && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              <strong>{pending.length} membre{pending.length > 1 ? "s" : ""}</strong> en attente de validation
            </p>
          </div>
        )}

        {/* Pending Initiatives */}
        {initiatives.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                Initiatives en Attente de Validation
              </CardTitle>
              <CardDescription>{initiatives.length} initiative(s) à valider</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {initiatives.map((initiative) => (
                <div key={initiative.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{initiative.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>Par {initiative.organizer}</span>
                      <span>{new Date(initiative.startDate).toLocaleDateString("fr-FR")}</span>
                      <Badge variant="outline">{initiative.category}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="outline" className="border-emerald-400 text-emerald-600 hover:bg-emerald-50" onClick={() => handleValidateInitiative(initiative.id)}>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Valider
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-400 text-red-600 hover:bg-red-50" onClick={() => handleRejectInitiative(initiative.id)}>
                      <XCircle className="w-4 h-4 mr-1" />
                      Rejeter
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Search + Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Rechercher par nom, email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-4 h-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400 transition-colors"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="h-10 px-3 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-purple-400"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending_validation">En attente</option>
            <option value="active">Validés</option>
            <option value="rejected">Rejetés</option>
            <option value="incomplete">Incomplets</option>
          </select>
        </div>

        {/* Members List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Users className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-400">Aucun membre trouvé</p>
            </div>
          ) : (
            filtered.map(member => {
              const vs = member.validationStatus || "active";
              const sc = STATUS_CONFIG[vs] || STATUS_CONFIG.active;
              return (
                <div key={member.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-all">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12 flex-shrink-0">
                      {member.profileImage && <AvatarImage src={member.profileImage} />}
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-violet-600 text-white font-semibold">
                        {initials(member)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">{member.firstName} {member.lastName}</span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${sc.bg} ${sc.color} ${sc.border}`}>
                              {vs === "pending_validation" && <Clock className="w-3 h-3" />}
                              {vs === "active" && <CheckCircle className="w-3 h-3" />}
                              {vs === "rejected" && <XCircle className="w-3 h-3" />}
                              {vs === "incomplete" && <AlertCircle className="w-3 h-3" />}
                              {sc.label}
                            </span>
                            {member.status === "ambassador_active" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 border border-amber-200">
                                <Star className="w-3 h-3" />
                                Ambassadeur
                              </span>
                            )}
                          </div>
                          {member.activity && <p className="text-xs text-gray-500 mt-0.5">{member.activity}</p>}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {vs === "pending_validation" && (
                            <>
                              <button
                                onClick={() => handleValidate(member.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs hover:bg-emerald-700 transition-colors"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Valider
                              </button>
                              <button
                                onClick={() => handleReject(member.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-300 text-red-600 text-xs hover:bg-red-50 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Rejeter
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setEditingMember({ ...member })}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-xs hover:bg-gray-50 transition-colors"
                            title="Modifier la fiche"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Modifier
                          </button>
                          <button
                            onClick={() => setComplementRequest({ id: member.id, name: `${member.firstName} ${member.lastName}` })}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-200 text-orange-600 text-xs hover:bg-orange-50 transition-colors"
                            title="Demander des compléments"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Compléments
                          </button>
                          {vs === "active" && (
                            <>
                              <button
                                onClick={() => handleSendWelcomeWhatsApp(member)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs hover:bg-green-700 transition-colors"
                                title="Envoyer message de bienvenue WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                Bienvenue WA
                              </button>
                              <button
                                onClick={() => handleMarkIncomplete(member.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-300 text-orange-600 text-xs hover:bg-orange-50 transition-colors"
                                title="Marquer comme incomplet"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Incomplet
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setDeleteConfirm(member.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs hover:bg-red-50 transition-colors"
                            title="Supprimer le membre"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                        {member.email && (
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{member.email}</span>
                        )}
                        {(member.city || member.country) && (
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{[member.city, member.country].filter(Boolean).join(", ")}</span>
                        )}
                        {member.joinedAt && (
                          <span>Inscrit le {new Date(member.joinedAt).toLocaleDateString("fr-FR")}</span>
                        )}
                        {member.complementNote && (
                          <span className="text-orange-600 flex items-center gap-1"><MessageSquare className="w-3 h-3" />{member.complementNote}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delete confirm */}
                  {deleteConfirm === member.id && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-3">
                      <span className="text-sm text-red-800">Confirmer la suppression de {member.firstName} {member.lastName} ?</span>
                      <div className="flex gap-2">
                        <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Annuler</button>
                        <button onClick={() => handleDelete(member.id)} className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700">Supprimer</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Edit Slide-over */}
      <AnimatePresence>
        {editingMember && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingMember(null)} />
            <motion.div
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-50 shadow-2xl overflow-y-auto"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-[#44267A]" />
                  <span className="font-semibold text-gray-900">Modifier la fiche membre</span>
                </div>
                <button onClick={() => setEditingMember(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Prénom" value={editingMember.firstName} onChange={v => setEditingMember((p: any) => ({ ...p, firstName: v }))} />
                  <Field label="Nom" value={editingMember.lastName} onChange={v => setEditingMember((p: any) => ({ ...p, lastName: v }))} />
                </div>
                <Field label="Activité / Fonction" value={editingMember.activity || ""} onChange={v => setEditingMember((p: any) => ({ ...p, activity: v }))} />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Ville" value={editingMember.city || ""} onChange={v => setEditingMember((p: any) => ({ ...p, city: v }))} />
                  <Field label="Pays" value={editingMember.country || ""} onChange={v => setEditingMember((p: any) => ({ ...p, country: v }))} />
                </div>
                <Field label="Téléphone" value={editingMember.phone || ""} onChange={v => setEditingMember((p: any) => ({ ...p, phone: v }))} />
                <Field label="WhatsApp" value={editingMember.whatsapp || ""} onChange={v => setEditingMember((p: any) => ({ ...p, whatsapp: v }))} />
                <Field label="URL photo de profil" value={editingMember.profileImage || ""} onChange={v => setEditingMember((p: any) => ({ ...p, profileImage: v }))} />
                {editingMember.profileImage && (
                  <img src={editingMember.profileImage} alt="Aperçu" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Biographie</label>
                  <textarea
                    value={editingMember.bio || ""}
                    onChange={e => setEditingMember((p: any) => ({ ...p, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 resize-none"
                    placeholder="Présentation du membre..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setEditingMember(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    Annuler
                  </button>
                  <button onClick={handleSaveEdit} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#44267A] text-white rounded-xl text-sm hover:bg-[#361f5f] transition-colors">
                    <Save className="w-4 h-4" />
                    Enregistrer
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Announcements Management */}
      <div className="space-y-4 mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Megaphone className="w-5 h-5 text-[#1B2A4A]" />Gestion des Annonces</h2>
          <div className="flex gap-2 text-xs">
            {(["pending", "active", "all"] as const).map(t => (
              <button key={t} onClick={() => setAnnTab(t)}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${annTab === t ? "bg-[#1B2A4A] text-white border-[#1B2A4A]" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                {t === "pending" ? `En attente (${announcements.filter(a => a.status === "pending").length})` : t === "active" ? "Actives" : "Toutes"}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total", value: announcements.length, color: "text-gray-700" },
            { label: "Vues totales", value: announcements.reduce((s, a) => s + (a.views || 0), 0), color: "text-blue-600" },
            { label: "Réponses", value: announcements.reduce((s, a) => s + (a.replies?.length || 0), 0), color: "text-emerald-600" },
            { label: "Actives", value: announcements.filter(a => a.status === "active" || a.status === "featured").length, color: "text-green-600" },
            { label: "En attente", value: announcements.filter(a => a.status === "pending").length, color: "text-amber-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 p-3 text-center shadow-sm">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Announcement list */}
        <div className="space-y-3">
          {announcements
            .filter(a => annTab === "all" ? true : annTab === "pending" ? a.status === "pending" : a.status === "active" || a.status === "featured")
            .map(ann => (
              <div key={ann.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-medium text-gray-500">{ann.authorName}</span>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs text-gray-400">{new Date(ann.createdAt).toLocaleDateString("fr-FR")}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ann.status === "active" ? "bg-emerald-100 text-emerald-700" : ann.status === "featured" ? "bg-amber-100 text-amber-700" : ann.status === "pending" ? "bg-amber-50 text-amber-600 border border-amber-200" : ann.status === "rejected" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}>{ann.status}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{ann.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{ann.description}</p>
                    <div className="flex gap-4 text-xs text-gray-400 mt-2">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{ann.views}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{ann.replies?.length || 0}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    {ann.status === "pending" && (
                      <>
                        <button onClick={() => { updateAnnouncement(ann.id, { status: "active" }); loadAnnouncements(); toast.success("Annonce validée"); }}
                          className="flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700">
                          <ThumbsUp className="w-3 h-3" />Valider
                        </button>
                        <button onClick={() => { updateAnnouncement(ann.id, { status: "rejected" }); loadAnnouncements(); toast.error("Annonce refusée"); }}
                          className="flex items-center gap-1 px-2 py-1 border border-red-300 text-red-600 text-xs rounded-lg hover:bg-red-50">
                          <ThumbsDown className="w-3 h-3" />Refuser
                        </button>
                      </>
                    )}
                    {(ann.status === "active") && (
                      <button onClick={() => { updateAnnouncement(ann.id, { status: "featured" }); loadAnnouncements(); toast.success("Annonce mise en vedette"); }}
                        className="flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-xs rounded-lg hover:bg-amber-600">
                        <Star className="w-3 h-3" />Vedette
                      </button>
                    )}
                    {(ann.status === "active" || ann.status === "featured") && (
                      <button onClick={() => { updateAnnouncement(ann.id, { status: "suspended" }); loadAnnouncements(); toast.info("Annonce suspendue"); }}
                        className="flex items-center gap-1 px-2 py-1 border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-50">
                        <Ban className="w-3 h-3" />Suspendre
                      </button>
                    )}
                    <button onClick={() => { deleteAnnouncement(ann.id); loadAnnouncements(); toast.success("Annonce supprimée"); }}
                      className="flex items-center gap-1 px-2 py-1 border border-red-200 text-red-500 text-xs rounded-lg hover:bg-red-50">
                      <X className="w-3 h-3" />Suppr.
                    </button>
                  </div>
                </div>
              </div>
            ))}
          {announcements.filter(a => annTab === "all" ? true : annTab === "pending" ? a.status === "pending" : a.status === "active" || a.status === "featured").length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">Aucune annonce dans cette catégorie</div>
          )}
        </div>
      </div>

      {/* Complement Request Modal */}
      <AnimatePresence>
        {complementRequest && (
          <motion.div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            >
              <h3 className="font-semibold text-gray-900 mb-1">Demande de compléments</h3>
              <p className="text-sm text-gray-500 mb-4">Pour : <strong>{complementRequest.name}</strong></p>
              <textarea
                value={complementNote}
                onChange={e => setComplementNote(e.target.value)}
                rows={4}
                placeholder="Indiquez les informations manquantes ou à compléter..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 resize-none mb-4"
              />
              <div className="flex gap-3">
                <button onClick={() => setComplementRequest(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button onClick={handleSendComplement} className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm hover:bg-orange-600 transition-colors">
                  Envoyer la demande
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 transition-colors"
      />
    </div>
  );
}
