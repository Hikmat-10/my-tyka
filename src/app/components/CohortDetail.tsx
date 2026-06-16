import { X, MapPin, Calendar, Clock, Users, DollarSign, Target, Briefcase, Share2, MessageCircle, Facebook, User, Globe, ArrowRight, CheckCircle, Info, Tag } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { type Cohorte } from "../services/dataService";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";

const MODALITY_LABELS: Record<string, string> = {
  online: "En ligne",
  presential: "Présentiel",
  hybrid: "Hybride",
};

const LEVEL_COLORS: Record<string, string> = {
  "débutant": "bg-emerald-100 text-emerald-700",
  "intermédiaire": "bg-blue-100 text-blue-700",
  "avancé": "bg-purple-100 text-purple-700",
};

const ACCESS_LABELS: Record<string, string> = {
  public: "Public",
  members: "Membres TYKA",
  application: "Sur candidature",
  paid: "Payant",
  free: "Gratuit",
};

const PROPOSED_BY_LABELS: Record<string, string> = {
  TYKA: "TYKA",
  partner: "Un partenaire",
  member: "Un membre TYKA",
};

interface Props {
  cohorte: Cohorte;
  onClose: () => void;
  onJoin: (cohorte: Cohorte) => void;
}

function formatFCFA(amount: number, currency: string) {
  if (amount === 0) return "Gratuit";
  return new Intl.NumberFormat("fr-FR").format(amount) + " " + (currency || "FCFA");
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="py-5 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-[#1B2A4A]/8 flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#1B2A4A]" />
        </div>
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function CohortDetail({ cohorte, onClose, onJoin }: Props) {
  const shareUrl = `${window.location.origin}/cocreate`;
  const shareText = `🎓 ${cohorte.title}\n\n${cohorte.description.slice(0, 120)}...\n\n📍 ${cohorte.location || "En ligne"} • 💰 ${formatFCFA(cohorte.price, cohorte.currency)}\n\nRejoignez la formation sur TYKA : ${shareUrl}`;

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(`${cohorte.title} — ${cohorte.description.slice(0, 120)}...`)}`, "_blank");
  };

  const objectives = cohorte.objectives
    ? cohorte.objectives.split("\n").filter(Boolean)
    : [];

  const initiatorLabel = cohorte.proposedBy ? PROPOSED_BY_LABELS[cohorte.proposedBy] : "TYKA";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white z-50 shadow-2xl overflow-y-auto flex flex-col"
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 220 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Cover image */}
        <div className="relative h-52 flex-shrink-0 bg-gradient-to-br from-[#1B2A4A] to-[#2d3f6b]">
          {cohorte.coverImage ? (
            <img src={cohorte.coverImage} alt={cohorte.title} className="w-full h-full object-cover opacity-80" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Briefcase className="w-20 h-20 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Top bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex gap-2">
              {cohorte.status && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${
                  cohorte.status === "active" ? "bg-emerald-500/90 text-white border-emerald-400" :
                  cohorte.status === "upcoming" ? "bg-blue-500/90 text-white border-blue-400" :
                  "bg-gray-500/90 text-white border-gray-400"
                }`}>
                  {cohorte.status === "active" ? "En cours" : cohorte.status === "upcoming" ? "À venir" : "Terminée"}
                </span>
              )}
              {cohorte.domain && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                  {cohorte.domain}
                </span>
              )}
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors backdrop-blur-sm">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title at bottom */}
          <div className="absolute bottom-4 left-5 right-5">
            <h1 className="text-2xl font-bold text-white leading-tight">{cohorte.title}</h1>
            <div className="flex gap-2 mt-2 flex-wrap">
              {cohorte.level && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${LEVEL_COLORS[cohorte.level] || "bg-gray-100 text-gray-600"}`}>
                  {cohorte.level}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white border border-white/30">
                {MODALITY_LABELS[cohorte.modality] || cohorte.modality}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 overflow-y-auto">
          {/* Quick info strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-gray-100">
            {[
              { icon: DollarSign, label: "Coût", value: formatFCFA(cohorte.price, cohorte.currency), color: "text-emerald-600" },
              { icon: Users, label: "Places", value: cohorte.maxParticipants ? `Max ${cohorte.maxParticipants}` : "Ouvert", color: "text-blue-600" },
              { icon: Clock, label: "Durée", value: cohorte.duration || "À définir", color: "text-purple-600" },
              { icon: Globe, label: "Accès", value: ACCESS_LABELS[cohorte.accessType || "members"] || "Membres", color: "text-orange-600" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="text-center">
                <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
                <p className="text-xs text-gray-400">{label}</p>
                <p className="text-sm font-semibold text-gray-800">{value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <Section title="Description" icon={Info}>
            <p className="text-gray-600 leading-relaxed text-sm">{cohorte.description}</p>
          </Section>

          {/* Objectives */}
          {objectives.length > 0 && (
            <Section title="Objectifs" icon={Target}>
              <ul className="space-y-2">
                {objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{obj}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Dates & Inscription */}
          <Section title="Dates & Inscription" icon={Calendar}>
            <div className="grid grid-cols-2 gap-3">
              {cohorte.startDate && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Début</p>
                  <p className="text-sm font-medium text-gray-800">{new Date(cohorte.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
              )}
              {cohorte.endDate && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Fin</p>
                  <p className="text-sm font-medium text-gray-800">{new Date(cohorte.endDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
              )}
              {cohorte.deadline && (
                <div className="col-span-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-xs text-amber-600 font-medium mb-0.5">⏰ Délai d'inscription</p>
                  <p className="text-sm font-semibold text-amber-800">{cohorte.deadline}</p>
                </div>
              )}
            </div>
          </Section>

          {/* Location */}
          {cohorte.location && (
            <Section title="Lieu" icon={MapPin}>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                <MapPin className="w-4 h-4 text-[#1B2A4A]" />
                <span className="text-sm text-gray-700">{cohorte.location}</span>
              </div>
            </Section>
          )}

          {/* Partner */}
          {cohorte.partner && (
            <Section title="Partenaire" icon={Briefcase}>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl">
                {cohorte.partner.logo ? (
                  <img src={cohorte.partner.logo} alt={cohorte.partner.name} className="w-12 h-12 object-contain rounded-lg" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-amber-200 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-amber-700" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{cohorte.partner.name}</p>
                  <p className="text-xs text-gray-500">{cohorte.partner.partnershipType}</p>
                  {cohorte.partner.sector && <p className="text-xs text-gray-400">{cohorte.partner.sector}</p>}
                </div>
              </div>
              {cohorte.partner.description && (
                <p className="text-sm text-gray-600 mt-3">{cohorte.partner.description}</p>
              )}
              {cohorte.partner.website && (
                <a href={cohorte.partner.website} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 text-sm text-[#1B2A4A] hover:underline">
                  <Globe className="w-3.5 h-3.5" />Site web du partenaire
                </a>
              )}
            </Section>
          )}

          {/* Initiator */}
          <Section title="Initiateur" icon={User}>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-[#1B2A4A]/10 text-[#1B2A4A] text-sm font-bold">
                  {cohorte.proposedBy === "member" && cohorte.proposedByMemberName
                    ? cohorte.proposedByMemberName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
                    : "TK"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {cohorte.proposedBy === "member" && cohorte.proposedByMemberName
                    ? cohorte.proposedByMemberName
                    : cohorte.proposedBy === "partner" && cohorte.partner
                    ? cohorte.partner.name
                    : "TYKA"}
                </p>
                <p className="text-xs text-gray-400">Proposé par {initiatorLabel}</p>
              </div>
            </div>
          </Section>

          {/* Additional info */}
          {cohorte.additionalInfo && (
            <Section title="Informations complémentaires" icon={Info}>
              <p className="text-sm text-gray-600 leading-relaxed">{cohorte.additionalInfo}</p>
            </Section>
          )}

          <div className="h-6" />
        </div>

        {/* Sticky bottom actions */}
        <div className="flex-shrink-0 border-t border-gray-100 bg-white px-6 py-4">
          <div className="flex gap-3">
            {/* Participer */}
            <button
              onClick={() => onJoin(cohorte)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1B2A4A] text-white rounded-xl font-semibold hover:bg-[#1B2A4A]/90 transition-colors shadow-lg"
            >
              <ArrowRight className="w-4 h-4" />
              Participer
            </button>

            {/* WhatsApp share */}
            <button
              onClick={handleWhatsApp}
              title="Partager sur WhatsApp"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] text-white rounded-xl font-medium hover:bg-[#20b959] transition-colors shadow"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">WhatsApp</span>
            </button>

            {/* Facebook share */}
            <button
              onClick={handleFacebook}
              title="Partager sur Facebook"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1877F2] text-white rounded-xl font-medium hover:bg-[#1565d8] transition-colors shadow"
            >
              <Facebook className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Facebook</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
