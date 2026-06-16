import { useState, useMemo, useEffect } from "react";
import {
  Search, Plus, Briefcase, HelpCircle, HandHelping, Megaphone,
  Eye, MessageSquare, Send, X, MapPin, Calendar, Star,
  User as UserIcon, Clock, ChevronRight, Hash, Users,
  Sparkles, TrendingUp, Zap, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useMemberAuth } from "../contexts/MemberAuthContext";
import {
  getAnnouncements, addAnnouncement, addReplyToAnnouncement, incrementAnnouncementViews,
  getAllMembers,
  type Announcement, type AnnouncementReply
} from "../services/dataService";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";

// ─── Config ──────────────────────────────────────────────────────────────────

const CATEGORIES = {
  opportunity: { label: "Opportunité", icon: Briefcase, gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", pill: "bg-emerald-100 text-emerald-700" },
  question:    { label: "Question",    icon: HelpCircle, gradient: "from-violet-500 to-purple-600", bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", pill: "bg-violet-100 text-violet-700" },
  assistance:  { label: "Assistance",  icon: HandHelping, gradient: "from-blue-500 to-indigo-600", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", pill: "bg-blue-100 text-blue-700" },
  information: { label: "Information", icon: Megaphone, gradient: "from-orange-500 to-amber-500", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", pill: "bg-orange-100 text-orange-700" },
} as const;

type CatKey = keyof typeof CATEGORIES;

const POPULAR_TAGS = ["#Emploi", "#Entrepreneuriat", "#Formation", "#Digital", "#Réseau", "#Financement", "#Stage", "#Partenariat", "#Innovation", "#Leadership"];

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}
function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 60) return `il y a ${m} min`;
  if (m < 1440) return `il y a ${Math.floor(m / 60)}h`;
  return `il y a ${Math.floor(m / 1440)}j`;
}

// ─── Publish Modal ────────────────────────────────────────────────────────────
function PublishModal({ onClose, onSubmit, defaultCategory }: {
  onClose: () => void;
  onSubmit: (d: any) => void;
  defaultCategory?: CatKey;
}) {
  const [form, setForm] = useState({
    category: defaultCategory || "opportunity" as CatKey,
    title: "", description: "", location: "", deadline: "", contact: "",
  });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const cfg = CATEGORIES[form.category];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className={`bg-gradient-to-r ${cfg.gradient} p-5 text-white`}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Publier une annonce</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-white/80 mt-1">Votre annonce sera soumise à validation avant publication</p>
        </div>
        <form onSubmit={e => { e.preventDefault(); if (!form.title.trim() || !form.description.trim()) return; onSubmit(form); }} className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Type d'annonce</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(CATEGORIES) as [CatKey, typeof CATEGORIES.question][]).map(([key, c]) => {
                const Icon = c.icon;
                return (
                  <button key={key} type="button" onClick={() => set("category", key)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${form.category === key ? `border-current ${c.text} ${c.bg}` : "border-gray-100 text-gray-500 hover:border-gray-200 bg-gray-50"}`}>
                    <Icon className="w-4 h-4 flex-shrink-0" />{c.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Titre *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)} required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A]"
              placeholder="Titre de votre annonce" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description *</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} required rows={4}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20 focus:border-[#1B2A4A] resize-none"
              placeholder="Décrivez votre annonce en détail..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Lieu</label>
              <input value={form.location} onChange={e => set("location", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
                placeholder="Dakar, Remote..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Date limite</label>
              <input type="date" value={form.deadline} onChange={e => set("deadline", e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Contact</label>
            <input value={form.contact} onChange={e => set("contact", e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
              placeholder="email ou téléphone" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium">Annuler</button>
            <button type="submit"
              className={`flex-1 px-4 py-2.5 bg-gradient-to-r ${cfg.gradient} text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-md`}>
              Soumettre
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function AnnModal({ ann, onClose, member }: { ann: Announcement; onClose: () => void; member: any }) {
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState<AnnouncementReply[]>(ann.replies || []);
  const cfg = CATEGORIES[ann.category as CatKey] || CATEGORIES.question;
  const Icon = cfg.icon;

  const submit = () => {
    if (!replyText.trim() || !member) return;
    addReplyToAnnouncement(ann.id, { announcementId: ann.id, authorId: member.id, authorName: `${member.firstName} ${member.lastName}`, authorAvatar: member.profilePhoto, content: replyText.trim() });
    const updated = getAnnouncements().find(a => a.id === ann.id);
    setReplies(updated?.replies || []);
    setReplyText("");
    toast.success("Commentaire publié");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className={`bg-gradient-to-r ${cfg.gradient} px-6 py-4 text-white flex items-center justify-between flex-shrink-0`}>
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            <span className="font-semibold">{cfg.label}</span>
            {ann.status === "featured" && <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-xs"><Star className="w-3 h-3" />Vedette</span>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={ann.authorAvatar} />
              <AvatarFallback className="bg-[#1B2A4A]/10 text-[#1B2A4A] text-sm font-bold">{initials(ann.authorName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-gray-900">{ann.authorName}</p>
              <p className="text-xs text-gray-400">{timeAgo(ann.createdAt)}</p>
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">{ann.title}</h2>
          <p className="text-gray-600 leading-relaxed mb-4">{ann.description}</p>
          <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-4">
            {ann.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{ann.location}</span>}
            {ann.deadline && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Avant le {new Date(ann.deadline).toLocaleDateString("fr-FR")}</span>}
            {ann.contact && <span className="flex items-center gap-1.5"><Send className="w-3.5 h-3.5" />{ann.contact}</span>}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400 border-t border-gray-100 pt-3 mb-5">
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{ann.views} vues</span>
            <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{replies.length} commentaires</span>
          </div>
          {replies.length > 0 && (
            <div className="space-y-3 mb-5">
              <h3 className="text-sm font-semibold text-gray-700">Commentaires ({replies.length})</h3>
              {replies.map(r => (
                <div key={r.id} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage src={r.authorAvatar} />
                    <AvatarFallback className="bg-[#1B2A4A]/10 text-[#1B2A4A] text-xs font-bold">{initials(r.authorName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{r.authorName} <span className="font-normal text-gray-400">{timeAgo(r.createdAt)}</span></p>
                    <p className="text-sm text-gray-600 mt-0.5">{r.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {member ? (
            <div className="flex gap-2">
              <input value={replyText} onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/20"
                placeholder="Écrire un commentaire..." />
              <button onClick={submit} className={`px-4 py-2.5 bg-gradient-to-r ${cfg.gradient} text-white rounded-xl text-sm hover:opacity-90 transition-opacity`}>
                <Send className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-2 bg-gray-50 rounded-xl">Connectez-vous pour commenter</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Announcement Card ────────────────────────────────────────────────────────
function AnnCard({ ann, onClick }: { ann: Announcement; onClick: () => void }) {
  const cfg = CATEGORIES[ann.category as CatKey] || CATEGORIES.question;
  const Icon = cfg.icon;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md transition-all group">
      {/* Category stripe */}
      <div className={`h-1 rounded-t-2xl bg-gradient-to-r ${cfg.gradient}`} />
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.pill} ${cfg.border}`}>
            <Icon className="w-3.5 h-3.5" />{cfg.label}
          </span>
          {ann.status === "featured" && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <Star className="w-3 h-3" />Vedette
            </span>
          )}
        </div>
        {/* Title */}
        <h3 className="text-sm font-bold text-gray-900 mb-1.5 line-clamp-2 group-hover:text-[#1B2A4A] transition-colors">{ann.title}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{ann.description}</p>
        {/* Author */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="w-6 h-6">
            <AvatarImage src={ann.authorAvatar} />
            <AvatarFallback className="bg-[#1B2A4A]/10 text-[#1B2A4A] text-xs font-bold">{initials(ann.authorName)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-gray-500">{ann.authorName}</span>
          <span className="text-gray-200">•</span>
          <span className="text-xs text-gray-400">{timeAgo(ann.createdAt)}</span>
        </div>
        {/* Meta */}
        {(ann.location || ann.deadline) && (
          <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
            {ann.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ann.location}</span>}
            {ann.deadline && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(ann.deadline).toLocaleDateString("fr-FR")}</span>}
          </div>
        )}
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{ann.views}</span>
            <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{(ann.replies || []).length}</span>
          </div>
          <div className="flex gap-2">
            {ann.contact && (
              <a href={ann.contact.includes("@") ? `mailto:${ann.contact}` : `tel:${ann.contact.replace(/\s/g, "")}`}
                onClick={e => e.stopPropagation()}
                className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors font-medium">
                Contacter
              </a>
            )}
            <button onClick={onClick}
              className={`text-xs px-3 py-1.5 bg-gradient-to-r ${cfg.gradient} text-white rounded-lg font-medium hover:opacity-90 transition-opacity`}>
              Voir
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ announcements }: { announcements: Announcement[] }) {
  const activeMembers = useMemo(() => {
    const all = getAllMembers().filter((m: any) => (m.validationStatus || "active") === "active");
    return all.slice(0, 5);
  }, []);

  const topAuthors = useMemo(() => {
    const map = new Map<string, { name: string; avatar?: string; count: number }>();
    announcements.forEach(a => {
      const entry = map.get(a.authorId) || { name: a.authorName, avatar: a.authorAvatar, count: 0 };
      entry.count++;
      map.set(a.authorId, entry);
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 3);
  }, [announcements]);

  return (
    <div className="space-y-4">
      {/* Suggestions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-500" />Suggestions pour vous
        </h3>
        {topAuthors.length > 0 ? (
          <div className="space-y-3">
            {topAuthors.map((a, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={a.avatar} />
                  <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-bold">{initials(a.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{a.name}</p>
                  <p className="text-xs text-gray-400">{a.count} publication{a.count > 1 ? "s" : ""}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">Aucune suggestion pour le moment</p>
        )}
      </div>

      {/* Membres actifs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-500" />Membres actifs
        </h3>
        <div className="space-y-2.5">
          {activeMembers.map((m: any, i: number) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="relative">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={m.profilePhoto || m.profileImage} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-bold">{`${m.firstName?.[0] || ""}${m.lastName?.[0] || ""}`}</AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{m.firstName} {m.lastName}</p>
                <p className="text-xs text-gray-400 truncate">{m.activity || m.city || "Membre"}</p>
              </div>
            </div>
          ))}
        </div>
        {activeMembers.length === 0 && <p className="text-xs text-gray-400">Aucun membre actif</p>}
      </div>

      {/* Tags populaires */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Hash className="w-4 h-4 text-orange-500" />Tags populaires
        </h3>
        <div className="flex flex-wrap gap-2">
          {POPULAR_TAGS.map(tag => (
            <span key={tag} className="text-xs px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-full text-gray-600 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 cursor-pointer transition-colors font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function TykaConnect() {
  const { member, isAuthenticated } = useMemberAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CatKey | "all">("all");
  const [showPublish, setShowPublish] = useState(false);
  const [publishCategory, setPublishCategory] = useState<CatKey>("opportunity");
  const [selectedAnn, setSelectedAnn] = useState<Announcement | null>(null);

  const load = () => setAnnouncements(getAnnouncements().filter(a => a.status === "active" || a.status === "featured"));

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return announcements.filter(a => {
      const matchCat = activeCategory === "all" || a.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q || a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q) || a.authorName.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [announcements, activeCategory, searchQuery]);

  const featured = filtered.filter(a => a.status === "featured");
  const regular = filtered.filter(a => a.status !== "featured");

  const stats = {
    opportunity: announcements.filter(a => a.category === "opportunity").length,
    assistance: announcements.filter(a => a.category === "assistance").length,
    question: announcements.filter(a => a.category === "question").length,
    information: announcements.filter(a => a.category === "information").length,
  };

  const handlePublish = (form: any) => {
    if (!member) return;
    addAnnouncement({ authorId: member.id, authorName: `${member.firstName} ${member.lastName}`, authorAvatar: (member as any).profilePhoto, ...form });
    setShowPublish(false);
    load();
    toast.success("Annonce soumise pour validation", { description: "Elle sera publiée après approbation par l'Admin Ambassadeur." });
  };

  const handleOpen = (ann: Announcement) => {
    incrementAnnouncementViews(ann.id);
    setSelectedAnn({ ...ann, views: ann.views + 1 });
  };

  const openPublish = (cat: CatKey) => {
    if (!isAuthenticated) { toast.error("Connexion requise", { description: "Connectez-vous pour publier une annonce." }); return; }
    setPublishCategory(cat);
    setShowPublish(true);
  };

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-2xl mb-6" style={{ background: "linear-gradient(135deg, #1B2A4A 0%, #2d1f5e 45%, #c2410c 100%)" }}>
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #f97316, transparent)" }} />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-5">
          <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
            <circle cx="90" cy="90" r="80" stroke="white" strokeWidth="1" strokeDasharray="8 4"/>
            <circle cx="90" cy="90" r="55" stroke="white" strokeWidth="1" strokeDasharray="6 3"/>
            <circle cx="90" cy="90" r="30" stroke="white" strokeWidth="1"/>
            {[[90,10],[160,70],[130,155],[50,155],[20,70]].map(([x,y],i)=>(
              <circle key={i} cx={x} cy={y} r="6" fill="white"/>
            ))}
            {[[90,10],[160,70],[130,155],[50,155],[20,70]].map(([x,y],i,arr)=>{
              const [nx,ny]=arr[(i+1)%arr.length];
              return <line key={i} x1={x} y1={y} x2={nx} y2={ny} stroke="white" strokeWidth="0.5"/>;
            })}
          </svg>
        </div>

        <div className="relative px-6 py-8 md:py-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-orange-400" />
              <span className="text-xs font-semibold text-orange-400 uppercase tracking-widest">TYKA Connect</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
              Le centre d'opportunités, d'entraide<br className="hidden sm:block" /> et de collaboration de la communauté
            </h1>
            <p className="text-white/60 text-sm mb-6">Partagez, trouvez, collaborez avec tous les membres TYKA</p>

            {/* Search */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/40" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all"
                placeholder="Rechercher une opportunité, une question ou une compétence…" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {(Object.entries(CATEGORIES) as [CatKey, typeof CATEGORIES.question][]).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const labels: Record<CatKey, string> = { opportunity: "Publier une opportunité", question: "Poser une question", assistance: "Demander de l'aide", information: "Partager une information" };
          return (
            <motion.button key={key} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
              onClick={() => openPublish(key)}
              className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-left group">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <Icon className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 leading-tight">{labels[key]}</p>
              </div>
              <Plus className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
            </motion.button>
          );
        })}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {(Object.entries(stats) as [CatKey, number][]).map(([key, count]) => {
          const cfg = CATEGORIES[key];
          const Icon = cfg.icon;
          return (
            <div key={key} onClick={() => setActiveCategory(activeCategory === key ? "all" : key)}
              className={`bg-white rounded-2xl border p-4 text-center cursor-pointer transition-all shadow-sm hover:shadow-md ${activeCategory === key ? `border-current ${cfg.text} shadow-md` : "border-gray-100"}`}>
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center mx-auto mb-2`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-xs text-gray-500 mt-0.5">{cfg.label}{count > 1 ? "s" : ""}</div>
              <div className={`text-xs font-medium mt-1 ${cfg.text}`}>Voir tout →</div>
            </div>
          );
        })}
      </div>

      {/* ── Category Filters ── */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-hide">
        <button onClick={() => setActiveCategory("all")}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${activeCategory === "all" ? "bg-[#1B2A4A] text-white border-[#1B2A4A] shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
          Tout ({announcements.length})
        </button>
        {(Object.entries(CATEGORIES) as [CatKey, typeof CATEGORIES.question][]).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <button key={key} onClick={() => setActiveCategory(activeCategory === key ? "all" : key)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${activeCategory === key ? `bg-gradient-to-r ${cfg.gradient} text-white border-transparent shadow-sm` : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
              <Icon className="w-3.5 h-3.5" />{cfg.label}s ({stats[key]})
            </button>
          );
        })}
      </div>

      {/* ── Content: Feed + Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        {/* Feed */}
        <div>
          {/* Featured */}
          {featured.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-bold text-gray-700">Annonces en vedette</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {featured.map(ann => <AnnCard key={ann.id} ann={ann} onClick={() => handleOpen(ann)} />)}
              </div>
            </div>
          )}

          {/* Regular */}
          {regular.length > 0 ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-[#1B2A4A]" />
                <span className="text-sm font-bold text-gray-700">
                  {activeCategory === "all" ? "Toutes les publications" : CATEGORIES[activeCategory].label + "s"}
                  <span className="ml-2 text-gray-400 font-normal">({regular.length})</span>
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {regular.map(ann => <AnnCard key={ann.id} ann={ann} onClick={() => handleOpen(ann)} />)}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1B2A4A] to-violet-600 flex items-center justify-center mx-auto mb-4">
                <Megaphone className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-1">Aucune publication pour le moment</h3>
              <p className="text-sm text-gray-400 mb-5">Soyez le premier à partager avec la communauté !</p>
              {isAuthenticated && (
                <button onClick={() => setShowPublish(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1B2A4A] to-violet-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-md">
                  <Plus className="w-4 h-4" />Publier la première annonce
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <Sidebar announcements={announcements} />
        </div>
      </div>

      {/* ── Modals ── */}
      {showPublish && <PublishModal defaultCategory={publishCategory} onClose={() => setShowPublish(false)} onSubmit={handlePublish} />}
      {selectedAnn && <AnnModal ann={selectedAnn} onClose={() => { setSelectedAnn(null); load(); }} member={member} />}
    </div>
  );
}
