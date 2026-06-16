import { Play, Clock, Share2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { ShareModal } from "./ShareModal";

export interface Video {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  thumbnail: string;
  type: "formation" | "masterclass" | "témoignage" | "expertise";
  category?: string;
}

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const [showShareModal, setShowShareModal] = useState(false);

  const typeColors = {
    formation: "bg-blue-100 text-blue-700",
    masterclass: "bg-purple-100 text-purple-700",
    témoignage: "bg-green-100 text-green-700",
    expertise: "bg-orange-100 text-orange-700",
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareModal(true);
  };

  return (
    <>
      <motion.div 
        className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 cursor-pointer border border-gray-100"
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
            <motion.div 
              className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Play className="w-8 h-8 text-blue-600 ml-1" fill="currentColor" />
            </motion.div>
          </div>
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[video.type]}`}>
              {video.type.charAt(0).toUpperCase() + video.type.slice(1)}
            </span>
          </div>
          
          {/* Share Button - Top Right */}
          <motion.button
            onClick={handleShareClick}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Partager cette vidéo"
          >
            <Share2 className="w-4 h-4 text-gray-700" />
          </motion.button>

          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/70 px-2 py-1 rounded text-white text-xs">
            <Clock className="w-3 h-3" />
            <span>{video.duration}</span>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {video.title}
          </h3>
          <p className="text-sm text-gray-600">
            Par {video.instructor}
          </p>
        </div>
      </motion.div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        type="video"
        data={{
          id: video.id,
          title: video.title,
          description: `Une ${video.type} par ${video.instructor} • ${video.duration}`,
          thumbnail: video.thumbnail
        }}
      />
    </>
  );
}