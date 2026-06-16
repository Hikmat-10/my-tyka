import { Users, Clock, Monitor, MapPin, Sparkles, Share2, ChevronRight, Building2, Award, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { ShareModal } from "./ShareModal";
import { PartnerModal } from "./PartnerModal";
import type { Cohorte } from "../services/dataService";

interface PremiumCohorteCardProps {
  cohorte: Cohorte;
  onJoin: (cohorte: Cohorte) => void;
}

const modalityConfig = {
  online: { label: "En ligne", icon: Monitor, color: "bg-emerald-100 text-emerald-700" },
  presential: { label: "Présentiel", icon: MapPin, color: "bg-blue-100 text-blue-700" },
  hybrid: { label: "Hybride", icon: Sparkles, color: "bg-purple-100 text-purple-700" },
};

const levelColors = {
  "débutant": "bg-green-100 text-green-700",
  "intermédiaire": "bg-amber-100 text-amber-700",
  "avancé": "bg-red-100 text-red-700",
};

const statusConfig = {
  active: { label: "En cours", color: "bg-emerald-500 text-white" },
  upcoming: { label: "À venir", color: "bg-amber-500 text-white" },
  completed: { label: "Terminée", color: "bg-gray-500 text-white" },
};

const partnershipLabels: Record<string, string> = {
  propulsée: "Propulsée par",
  partenariat: "En partenariat avec",
  soutenue: "Soutenue par",
  parrainée: "Parrainée par",
};

export function PremiumCohorteCard({ cohorte, onJoin }: PremiumCohorteCardProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);

  const modality = modalityConfig[cohorte.modality];
  const ModalityIcon = modality.icon;
  const status = cohorte.status ? statusConfig[cohorte.status] : null;
  const placesRestantes = cohorte.maxParticipants ? cohorte.maxParticipants - cohorte.participants : null;
  const isCompleted = cohorte.status === "completed";

  const defaultCover = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=400&fit=crop&auto=format";

  return (
    <>
      <motion.div
        className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-amber-200 transition-all duration-300 flex flex-col group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
      >
        {/* Cover Image */}
        <div className="relative h-44 bg-gray-200 overflow-hidden">
          <img
            src={cohorte.coverImage || defaultCover}
            alt={cohorte.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Status Badge */}
          {status && (
            <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
              {status.label}
            </span>
          )}

          {/* Share Button */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowShareModal(true); }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-all"
          >
            <Share2 className="w-3.5 h-3.5 text-white" />
          </button>

          {/* Domain badge on image */}
          <div className="absolute bottom-3 left-3">
            <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-800">
              {cohorte.domain}
            </span>
          </div>

          {isCompleted && (
            <div className="absolute inset-0 bg-gray-900/30 flex items-center justify-center">
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2">
                <Award className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">Cohorte terminée</span>
              </div>
            </div>
          )}
        </div>

        {/* Partner Banner */}
        {cohorte.partner && (
          <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 bg-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-amber-700 truncate">
                  <span className="opacity-75">{partnershipLabels[cohorte.partner.partnershipType]} </span>
                  <span className="font-bold">{cohorte.partner.name}</span>
                </p>
              </div>
            </div>
            <button
              onClick={e => { e.stopPropagation(); setShowPartnerModal(true); }}
              className="flex-shrink-0 text-xs text-amber-600 hover:text-amber-800 font-medium flex items-center gap-0.5 transition-colors ml-2"
            >
              Découvrir <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Card Body */}
        <div className="p-5 flex flex-col flex-1">
          {/* Level & Modality Pills */}
          <div className="flex items-center gap-2 mb-3">
            {cohorte.level && (
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${levelColors[cohorte.level]}`}>
                {cohorte.level.charAt(0).toUpperCase() + cohorte.level.slice(1)}
              </span>
            )}
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${modality.color}`}>
              <ModalityIcon className="w-3 h-3" />
              {modality.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors leading-snug">
            {cohorte.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1 leading-relaxed">
            {cohorte.description}
          </p>

          {/* Info Row */}
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-500" />
              <span>{cohorte.participants} apprenants</span>
            </div>
            {cohorte.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{cohorte.duration}</span>
              </div>
            )}
            {cohorte.accessType === "members" && (
              <div className="flex items-center gap-1 text-amber-600">
                <Lock className="w-3.5 h-3.5" />
                <span>Membres TYKA</span>
              </div>
            )}
          </div>

          {/* Places restantes */}
          {placesRestantes !== null && placesRestantes <= 10 && !isCompleted && (
            <div className={`text-xs px-3 py-2 rounded-lg mb-3 flex items-center gap-1.5 font-medium ${
              placesRestantes <= 5 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {placesRestantes} place{placesRestantes > 1 ? "s" : ""} restante{placesRestantes > 1 ? "s" : ""}
            </div>
          )}

          {/* Price & CTA */}
          <div className="flex items-center gap-3 mt-auto">
            <div className="flex-1">
              {cohorte.price === 0 ? (
                <span className="text-emerald-600 font-semibold text-sm">Gratuite</span>
              ) : (
                <div>
                  <span className="text-gray-900 font-bold">{cohorte.price.toLocaleString()}</span>
                  <span className="text-xs text-gray-500 ml-1">{cohorte.currency}</span>
                </div>
              )}
            </div>
            <motion.button
              onClick={e => { e.stopPropagation(); onJoin(cohorte); }}
              disabled={isCompleted}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isCompleted
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-200"
              }`}
              whileHover={isCompleted ? {} : { scale: 1.03 }}
              whileTap={isCompleted ? {} : { scale: 0.97 }}
            >
              {isCompleted ? "Terminée" : "Rejoindre"}
            </motion.button>
          </div>
        </div>
      </motion.div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        type="cohort"
        data={{
          id: cohorte.id,
          title: cohorte.title,
          description: cohorte.description,
          price: cohorte.price,
          modality: modality.label,
          deadline: cohorte.deadline,
          spotsLeft: placesRestantes || undefined
        }}
      />

      <PartnerModal
        partner={cohorte.partner || null}
        cohortTitle={cohorte.title}
        isOpen={showPartnerModal}
        onClose={() => setShowPartnerModal(false)}
      />
    </>
  );
}
