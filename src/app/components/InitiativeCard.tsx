import { Calendar, Clock, MapPin, Monitor, Users, ChevronRight, Tag } from "lucide-react";
import { motion } from "motion/react";
import type { Initiative } from "../services/dataService";

interface InitiativeCardProps {
  initiative: Initiative;
  onClick: (initiative: Initiative) => void;
}

const modalityConfig = {
  "online": { label: "En ligne", icon: Monitor, color: "bg-blue-100 text-blue-700" },
  "in-person": { label: "Présentiel", icon: MapPin, color: "bg-green-100 text-green-700" },
  "hybrid": { label: "Hybride", icon: Users, color: "bg-purple-100 text-purple-700" },
};

const statusConfig = {
  upcoming: { label: "À venir", color: "bg-amber-500 text-white" },
  ongoing: { label: "En cours", color: "bg-emerald-500 text-white" },
  completed: { label: "Terminée", color: "bg-gray-500 text-white" },
};

export function InitiativeCard({ initiative, onClick }: InitiativeCardProps) {
  const modality = modalityConfig[initiative.modality];
  const ModalityIcon = modality.icon;
  const status = initiative.activityStatus ? statusConfig[initiative.activityStatus] : null;
  const defaultCover = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop&auto=format";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <motion.div
      onClick={() => onClick(initiative)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-amber-200 transition-all duration-300 flex flex-col group cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
    >
      {/* Cover Image */}
      <div className="relative h-44 bg-gray-200 overflow-hidden">
        <img
          src={initiative.coverImage || initiative.image || defaultCover}
          alt={initiative.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Status Badge */}
        {status && (
          <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
            {status.label}
          </span>
        )}

        {/* Category badge */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-800 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {initiative.category}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Modality Pill */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${modality.color}`}>
            <ModalityIcon className="w-3 h-3" />
            {modality.label}
          </span>
          {initiative.price === 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
              Gratuit
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors leading-snug">
          {initiative.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1 leading-relaxed">
          {initiative.description}
        </p>

        {/* Info Row */}
        <div className="flex flex-col gap-2 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            <span>{formatDate(initiative.startDate)}</span>
          </div>
          {initiative.time && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{initiative.time}</span>
            </div>
          )}
          {initiative.modality !== "online" && initiative.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span className="truncate">{initiative.location}</span>
            </div>
          )}
        </div>

        {/* Organizer & CTA */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400">Organisé par</p>
            <p className="text-sm text-gray-700 truncate">{initiative.organizer}</p>
          </div>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onClick(initiative);
            }}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-200 transition-all"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Détails
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
