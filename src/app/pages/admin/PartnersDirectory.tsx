import { AdminLayout } from "../../components/admin/AdminLayout";
import { Building2, Plus, Trash2, Edit2, Globe, Linkedin, Facebook, Twitter, X, Save, Search, ExternalLink } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { getCohortes } from "../../services/dataService";

interface Partner {
  id: string;
  name: string;
  sector: string;
  description: string;
  institutionalPresentation?: string;
  website?: string;
  logo?: string;
  email?: string;
  phone?: string;
  contactPrincipal?: string;
  type: "propulsée" | "partenariat" | "soutenue" | "parrainée";
  status: "active" | "archived";
  socialMedia?: { linkedin?: string; facebook?: string; twitter?: string };
  associatedCohorts?: string[];
  createdAt: string;
}

const STORAGE_KEY = "tykaPartners";

function getPartners(): Partner[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) return JSON.parse(data);
  // Default demo partners
  const defaults: Partner[] = [
    {
      id: "partner-1",
      name: "SOL VERT",
      sector: "Énergie renouvelable",
      description: "Pionnier dans les solutions d'énergie verte en Afrique subsaharienne.",
      institutionalPresentation: "SOL VERT est une entreprise africaine leader dans le secteur de l'énergie solaire et des solutions durables. Depuis 2015, nous accompagnons la transition énergétique des ménages et entreprises.",
      website: "https://solvert.example.com",
      type: "propulsée",
      status: "active",
      socialMedia: { linkedin: "https://linkedin.com/company/solvert", facebook: "https://facebook.com/solvert" },
      associatedCohorts: [],
      createdAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
    },
    {
      id: "partner-2",
      name: "INNOV'AFRIQUE",
      sector: "Innovation & Technologie",
      description: "Écosystème d'innovation pour les startups africaines.",
      website: "https://innovafrique.example.com",
      type: "partenariat",
      status: "active",
      socialMedia: { twitter: "https://twitter.com/innovafrique" },
      associatedCohorts: [],
      createdAt: new Date(Date.now() - 60 * 24 * 3600000).toISOString(),
    },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
}

function savePartners(partners: Partner[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(partners));
}

const TYPE_CONFIG = {
  propulsée: { label: "Propulsée par", color: "bg-amber-100 text-amber-700 border-amber-200" },
  partenariat: { label: "Partenariat", color: "bg-blue-100 text-blue-700 border-blue-200" },
  soutenue: { label: "Soutenue par", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  parrainée: { label: "Parrainée par", color: "bg-purple-100 text-purple-700 border-purple-200" },
};

const EMPTY_PARTNER: Omit<Partner, "id" | "createdAt"> = {
  name: "", sector: "", description: "", institutionalPresentation: "", website: "", logo: "",
  email: "", phone: "", contactPrincipal: "",
  type: "partenariat", status: "active",
  socialMedia: { linkedin: "", facebook: "", twitter: "" },
  associatedCohorts: [],
};

export default function PartnersDirectory() {
  const [partners, setPartners] = useState<Partner[]>(getPartners);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newPartner, setNewPartner] = useState<typeof EMPTY_PARTNER>({ ...EMPTY_PARTNER });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const cohortes = useMemo(() => getCohortes(), []);

  const filtered = useMemo(() => {
    return partners.filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.sector.toLowerCase().includes(q);
      const matchStatus = filterStatus === "all" || p.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [partners, search, filterStatus]);

  const handleCreate = () => {
    if (!newPartner.name || !newPartner.sector || !newPartner.description) {
      toast.error("Nom, secteur et description sont requis");
      return;
    }
    const partner: Partner = { ...newPartner, id: `partner-${Date.now()}`, createdAt: new Date().toISOString() };
    const updated = [partner, ...partners];
    savePartners(updated);
    setPartners(updated);
    setNewPartner({ ...EMPTY_PARTNER });
    setShowNewForm(false);
    toast.success("Partenaire créé !");
  };

  const handleSaveEdit = () => {
    if (!editingPartner) return;
    const updated = partners.map(p => p.id === editingPartner.id ? editingPartner : p);
    savePartners(updated);
    setPartners(updated);
    setEditingPartner(null);
    toast.success("Partenaire mis à jour !");
  };

  const handleArchive = (id: string) => {
    const updated = partners.map(p => p.id === id ? { ...p, status: p.status === "active" ? "archived" : "active" } as Partner : p);
    savePartners(updated);
    setPartners(updated);
    toast.success("Statut mis à jour");
  };

  const handleDelete = (id: string) => {
    const updated = partners.filter(p => p.id !== id);
    savePartners(updated);
    setPartners(updated);
    setDeleteConfirm(null);
    toast.success("Partenaire supprimé");
  };

  const active = partners.filter(p => p.status === "active").length;
  const archived = partners.filter(p => p.status === "archived").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Répertoire Partenaires</h1>
            <p className="text-gray-500 mt-1">Gérez les partenaires associés aux cohortes et initiatives</p>
          </div>
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#D4522A] to-[#8B2500] text-white rounded-xl text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Nouveau partenaire
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-[#D4522A] to-[#8B2500] rounded-xl p-4 text-white">
            <div className="text-3xl font-bold">{partners.length}</div>
            <div className="text-xs opacity-75 mt-0.5">Total partenaires</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="text-3xl font-bold text-emerald-700">{active}</div>
            <div className="text-xs text-emerald-600 mt-0.5">Actifs</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="text-3xl font-bold text-gray-500">{archived}</div>
            <div className="text-xs text-gray-500 mt-0.5">Archivés</div>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou secteur..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 h-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#D4522A]/50 transition-colors"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="h-10 px-3 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-[#D4522A]/50"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="archived">Archivés</option>
          </select>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(partner => {
            const tc = TYPE_CONFIG[partner.type] || TYPE_CONFIG.partenariat;
            return (
              <div key={partner.id} className={`bg-white border rounded-2xl p-5 hover:shadow-sm transition-all ${partner.status === "archived" ? "opacity-60" : ""}`}>
                <div className="flex items-start gap-4">
                  {/* Logo or initial */}
                  {partner.logo ? (
                    <img src={partner.logo} alt={partner.name} className="w-14 h-14 rounded-xl object-contain border border-gray-100 flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4522A]/20 to-amber-100 flex items-center justify-center flex-shrink-0 border border-amber-100">
                      <span className="text-[#D4522A] font-bold text-xl">{partner.name[0]}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{partner.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{partner.sector}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${tc.color}`}>{tc.label}</span>
                        {partner.status === "archived" && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Archivé</span>}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{partner.description}</p>
                    {/* Contact info */}
                    {(partner.email || partner.phone || partner.contactPrincipal) && (
                      <div className="mt-2 space-y-0.5">
                        {partner.contactPrincipal && <p className="text-xs text-gray-500">👤 {partner.contactPrincipal}</p>}
                        {partner.email && <p className="text-xs text-gray-500">✉️ {partner.email}</p>}
                        {partner.phone && <p className="text-xs text-gray-500">📞 {partner.phone}</p>}
                      </div>
                    )}
                    {/* Social links */}
                    <div className="flex items-center gap-2 mt-3">
                      {partner.website && (
                        <a href={partner.website} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                          <Globe className="w-3.5 h-3.5 text-gray-600" />
                        </a>
                      )}
                      {partner.socialMedia?.linkedin && (
                        <a href={partner.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors">
                          <Linkedin className="w-3.5 h-3.5 text-blue-700" />
                        </a>
                      )}
                      {partner.socialMedia?.facebook && (
                        <a href={partner.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors">
                          <Facebook className="w-3.5 h-3.5 text-blue-700" />
                        </a>
                      )}
                      {partner.socialMedia?.twitter && (
                        <a href={partner.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-gray-900 hover:bg-black flex items-center justify-center transition-colors">
                          <Twitter className="w-3.5 h-3.5 text-white" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                  <span className="text-xs text-gray-400">
                    Ajouté le {new Date(partner.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                  <div className="flex gap-1.5">
                    <button onClick={() => setEditingPartner({ ...partner })} className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                      <Edit2 className="w-3 h-3" />
                      Modifier
                    </button>
                    <button onClick={() => handleArchive(partner.id)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                      {partner.status === "active" ? "Archiver" : "Réactiver"}
                    </button>
                    <button onClick={() => setDeleteConfirm(partner.id)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-red-100 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Delete confirm */}
                {deleteConfirm === partner.id && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-3">
                    <span className="text-sm text-red-800">Confirmer la suppression de {partner.name} ?</span>
                    <div className="flex gap-2">
                      <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1 text-xs border border-gray-300 rounded-lg text-gray-600">Annuler</button>
                      <button onClick={() => handleDelete(partner.id)} className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg">Supprimer</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-16">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-400">Aucun partenaire trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* New Partner Slide-over */}
      <AnimatePresence>
        {showNewForm && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNewForm(false)} />
            <motion.div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-50 shadow-2xl overflow-y-auto" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}>
              <PartnerForm
                title="Nouveau partenaire"
                partner={newPartner as any}
                setPartner={setNewPartner as any}
                onSave={handleCreate}
                onClose={() => setShowNewForm(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Partner Slide-over */}
      <AnimatePresence>
        {editingPartner && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingPartner(null)} />
            <motion.div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-50 shadow-2xl overflow-y-auto" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}>
              <PartnerForm
                title="Modifier le partenaire"
                partner={editingPartner}
                setPartner={setEditingPartner as any}
                onSave={handleSaveEdit}
                onClose={() => setEditingPartner(null)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

function PartnerForm({ title, partner, setPartner, onSave, onClose }: { title: string; partner: any; setPartner: (v: any) => void; onSave: () => void; onClose: () => void }) {
  const set = (key: string, value: any) => setPartner((p: any) => ({ ...p, [key]: value }));
  const setSocial = (key: string, value: string) => setPartner((p: any) => ({ ...p, socialMedia: { ...p.socialMedia, [key]: value } }));

  return (
    <>
      <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#D4522A]" />
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      <div className="p-6 space-y-4">
        <PField label="Nom *" value={partner.name || ""} onChange={v => set("name", v)} />
        <PField label="Secteur d'activité *" value={partner.sector || ""} onChange={v => set("sector", v)} />
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Description *</label>
          <textarea value={partner.description || ""} onChange={e => set("description", e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D4522A]/50 resize-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Présentation institutionnelle</label>
          <textarea value={partner.institutionalPresentation || ""} onChange={e => set("institutionalPresentation", e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D4522A]/50 resize-none" placeholder="Historique, missions, valeurs..." />
        </div>
        <PField label="URL Logo" value={partner.logo || ""} onChange={v => set("logo", v)} placeholder="https://..." />
        {partner.logo && <img src={partner.logo} alt="Logo" className="h-14 object-contain rounded-lg border border-gray-100 p-1" />}
        <PField label="Site web" value={partner.website || ""} onChange={v => set("website", v)} placeholder="https://..." />
        <PField label="Email" value={partner.email || ""} onChange={v => set("email", v)} placeholder="contact@..." />
        <PField label="Téléphone" value={partner.phone || ""} onChange={v => set("phone", v)} placeholder="+221..." />
        <PField label="Contact principal" value={partner.contactPrincipal || ""} onChange={v => set("contactPrincipal", v)} placeholder="Nom du contact" />
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Type de partenariat</label>
          <select value={partner.type || "partenariat"} onChange={e => set("type", e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D4522A]/50">
            <option value="propulsée">Propulsée par</option>
            <option value="partenariat">En partenariat avec</option>
            <option value="soutenue">Soutenue par</option>
            <option value="parrainée">Parrainée par</option>
          </select>
        </div>
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Réseaux sociaux</p>
          <div className="space-y-2">
            <PField label="LinkedIn" value={partner.socialMedia?.linkedin || ""} onChange={v => setSocial("linkedin", v)} placeholder="https://linkedin.com/company/..." />
            <PField label="Facebook" value={partner.socialMedia?.facebook || ""} onChange={v => setSocial("facebook", v)} placeholder="https://facebook.com/..." />
            <PField label="X / Twitter" value={partner.socialMedia?.twitter || ""} onChange={v => setSocial("twitter", v)} placeholder="https://x.com/..." />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Annuler</button>
          <button onClick={onSave} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#D4522A] to-[#8B2500] text-white rounded-xl text-sm hover:opacity-90 transition-opacity">
            <Save className="w-4 h-4" />
            Enregistrer
          </button>
        </div>
      </div>
    </>
  );
}

function PField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#D4522A]/50 transition-colors" />
    </div>
  );
}
