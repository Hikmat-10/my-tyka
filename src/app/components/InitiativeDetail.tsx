import {
  X, Calendar, Clock, MapPin, Monitor, Users, Target, Info,
  Building2, Tag, Share2, ArrowLeft, CheckCircle2, UserPlus, ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Initiative } from "../services/dataService";

interface InitiativeDetailProps {
  initiative: Initiative;
  onClose: () => void;
}

const modalityConfig = {
  "online": { label: "En ligne", icon: Monitor, color: "text-blue-600" },
  "in-person": { label: "Présentiel", icon: MapPin, color: "text-green-600" },
  "hybrid": { label: "Hybride", icon: Users, color: "text-purple-600" },
};

const statusConfig = {
  upcoming: { label: "À venir", color: "bg-amber-100 text-amber-700 border-amber-200" },
  ongoing: { label: "En cours", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  completed: { label: "Terminée", color: "bg-gray-100 text-gray-700 border-gray-200" },
};

const actionButtonConfig = {
  participate: { label: "Participer", icon: UserPlus },
  register: { label: "S'inscrire", icon: CheckCircle2 },
  "learn-more": { label: "En savoir plus", icon: Info },
  access: { label: "Accéder à l'activité", icon: ExternalLink },
};

export function InitiativeDetail({ initiative, onClose }: InitiativeDetailProps) {
  const modality = modalityConfig[initiative.modality];
  const ModalityIcon = modality.icon;
  const status = initiative.activityStatus ? statusConfig[initiative.activityStatus] : null;
  const actionButton = initiative.actionType ? actionButtonConfig[initiative.actionType] : actionButtonConfig["learn-more"];
  const ActionIcon = actionButton.icon;
  const defaultCover = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop&auto=format";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const handleAction = () => {
    // Handle action based on type
    console.log(`Action: ${initiative.actionType}`);
    // TODO: Implement actual action logic
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden"
        >
          {/* Header with Cover Image */}
          <div className="relative h-80 bg-gray-200 overflow-hidden">
            <img
              src={initiative.coverImage || initiative.image || defaultCover}
              alt={initiative.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all group"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Back Button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Retour</span>
            </button>

            {/* Status Badge */}
            {status && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${status.color}`}>
                  {status.label}
                </span>
              </div>
            )}

            {/* Title & Category */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white border border-white/30 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {initiative.category}
                </span>
                {initiative.price === 0 && (
                  <span className="px-3 py-1 bg-emerald-500/20 backdrop-blur-sm rounded-full text-xs font-semibold text-emerald-100 border border-emerald-400/30">
                    Gratuit
                  </span>
                )}
              </div>
              <h1 className="text-white mb-2 leading-tight" style={{ fontSize: "2rem", fontWeight: 700 }}>
                {initiative.title}
              </h1>
              <div className="flex items-center gap-4 text-white/80 text-sm">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Organisé par {initiative.organizer}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 max-h-[60vh] overflow-y-auto">
            <div className="space-y-8">
              {/* Description Section */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Info className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-gray-900" style={{ fontSize: "1.3rem", fontWeight: 700 }}>Descriptif de l'initiative</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {initiative.description}
                  </p>
                </div>
              </section>

              {/* Objectives Section */}
              {initiative.objectives && initiative.objectives.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-gray-900" style={{ fontSize: "1.3rem", fontWeight: 700 }}>Objectifs de l'initiative</h2>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                    <ul className="space-y-3">
                      {initiative.objectives.map((objective, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-gray-700 leading-relaxed">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              {/* Practical Information Section */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-gray-900" style={{ fontSize: "1.3rem", fontWeight: 700 }}>Informations pratiques</h2>
                </div>
                <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-green-700 font-medium mb-1">Date</p>
                        <p className="text-gray-900">{formatDate(initiative.startDate)}</p>
                      </div>
                    </div>

                    {/* Time */}
                    {initiative.time && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-green-700 font-medium mb-1">Heure</p>
                          <p className="text-gray-900">{initiative.time}</p>
                        </div>
                      </div>
                    )}

                    {/* Format/Modality */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                        <ModalityIcon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-green-700 font-medium mb-1">Format</p>
                        <p className="text-gray-900">{modality.label}</p>
                      </div>
                    </div>

                    {/* Location */}
                    {initiative.modality !== "online" && initiative.location && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-green-700 font-medium mb-1">Lieu</p>
                          <p className="text-gray-900">{initiative.location}</p>
                        </div>
                      </div>
                    )}

                    {/* Target Audience */}
                    {initiative.targetAudience && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-green-700 font-medium mb-1">Cible</p>
                          <p className="text-gray-900">{initiative.targetAudience}</p>
                        </div>
                      </div>
                    )}

                    {/* Participation Modalities */}
                    {initiative.participationModalities && (
                      <div className="flex items-start gap-3 md:col-span-2">
                        <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                          <Info className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-green-700 font-medium mb-1">Modalités de participation</p>
                          <p className="text-gray-900">{initiative.participationModalities}</p>
                        </div>
                      </div>
                    )}

                    {/* Partners */}
                    {initiative.partners && initiative.partners.length > 0 && (
                      <div className="flex items-start gap-3 md:col-span-2">
                        <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-green-700 font-medium mb-1">Partenaires</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {initiative.partners.map((partner, index) => (
                              <span key={index} className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-green-200">
                                {partner}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Participants Count */}
                    {initiative.maxParticipants && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-green-700 font-medium mb-1">Places</p>
                          <p className="text-gray-900">
                            {initiative.currentParticipants || 0} / {initiative.maxParticipants} participants
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    {initiative.price !== undefined && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                          <Tag className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-green-700 font-medium mb-1">Tarif</p>
                          <p className="text-gray-900">
                            {initiative.price === 0 ? "Gratuit" : `${initiative.price} ${initiative.currency || "FCFA"}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Footer with Action Button */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la liste
            </button>

            <div className="flex items-center gap-3">
              <button
                className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                title="Partager l'initiative"
              >
                <Share2 className="w-4 h-4 text-gray-600" />
              </button>

              <motion.button
                onClick={handleAction}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:shadow-lg hover:shadow-amber-200 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ActionIcon className="w-5 h-5" />
                {actionButton.label}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
