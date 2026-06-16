import { Users, Calendar, DollarSign, Monitor, MapPin, Sparkles, AlertCircle, Share2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { ShareModal } from "./ShareModal";

export interface Cohorte {
  id: string;
  title: string;
  domain: string;
  modality: "online" | "presential" | "hybrid";
  price: number;
  currency: string;
  participants: number;
  maxParticipants?: number;
  location?: string;
  deadline: string;
  description: string;
}

interface CohorteCardProps {
  cohorte: Cohorte;
  onJoin: (cohorte: Cohorte) => void;
}

export function CohorteCard({ cohorte, onJoin }: CohorteCardProps) {
  const [showShareModal, setShowShareModal] = useState(false);

  const modalityConfig = {
    online: {
      label: "En ligne",
      icon: Monitor,
      color: "bg-green-100 text-green-700 border-green-200"
    },
    presential: {
      label: "En salle",
      icon: MapPin,
      color: "bg-blue-100 text-blue-700 border-blue-200"
    },
    hybrid: {
      label: "Hybride",
      icon: Sparkles,
      color: "bg-purple-100 text-purple-700 border-purple-200"
    }
  };

  const config = modalityConfig[cohorte.modality];
  const ModalityIcon = config.icon;
  
  const placesRestantes = cohorte.maxParticipants ? cohorte.maxParticipants - cohorte.participants : null;
  const isPresqueComplet = placesRestantes !== null && placesRestantes <= 5;

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareModal(true);
  };

  return (
    <>
      <motion.div 
        className="bg-white rounded-xl border-2 border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Header with Domain */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 relative">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
            {cohorte.domain}
          </span>
          
          {/* Share Button - Top Right */}
          <motion.button
            onClick={handleShareClick}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Partager cette formation"
          >
            <Share2 className="w-4 h-4 text-white" />
          </motion.button>
        </div>

        <div className="p-6">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
            {cohorte.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {cohorte.description}
          </p>

          {/* Modality Badge & Location */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 ${config.color} font-medium text-sm`}>
              <ModalityIcon className="w-4 h-4" />
              <span>{config.label}</span>
            </div>
            {cohorte.location && (
              <div className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600">
                <MapPin className="w-3 h-3" />
                {cohorte.location}
              </div>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-gray-900">{cohorte.price.toLocaleString()} {cohorte.currency}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 text-blue-600" />
              <span>{cohorte.participants} participants</span>
            </div>
          </div>

          {/* Places restantes */}
          {placesRestantes !== null && (
            <motion.div 
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg mb-3 ${
                isPresqueComplet 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">
                {placesRestantes} place{placesRestantes > 1 ? 's' : ''} restante{placesRestantes > 1 ? 's' : ''}
              </span>
            </motion.div>
          )}

          {/* Deadline */}
          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 rounded-lg px-3 py-2 mb-4">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">Clôture : {cohorte.deadline}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <motion.button
              onClick={() => onJoin(cohorte)}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-shadow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Rejoindre la cohorte
            </motion.button>
            
            <motion.button
              onClick={handleShareClick}
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Partager"
            >
              <Share2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        type="cohort"
        data={{
          id: cohorte.id,
          title: cohorte.title,
          description: cohorte.description,
          price: cohorte.price,
          modality: config.label,
          deadline: cohorte.deadline,
          spotsLeft: placesRestantes || undefined
        }}
      />
    </>
  );
}