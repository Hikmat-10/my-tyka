import { X, ThumbsUp, Share2, Bookmark } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { VisuallyHidden } from "./ui/visually-hidden";
import { useMemberAuth } from "../contexts/MemberAuthContext";
import { addWatchedVideo } from "../services/dataService";
import { useEffect, useState } from "react";
import type { Video } from "../services/dataService";
import { ShareModal } from "./ShareModal";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: {
    id: string;
    title: string;
    instructor: string;
    description: string;
    youtubeId: string;
    country: string;
  } | null;
}

export function VideoModal({ isOpen, onClose, video }: VideoModalProps) {
  const { member } = useMemberAuth();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    // Track video watch when video is opened and user is logged in
    if (member && video && isOpen) {
      // Convert video detail to Video type for storage
      const videoForTracking = {
        id: video.id,
        title: video.title,
        instructor: video.instructor,
        duration: "N/A", // Duration not available in videoDetails
        thumbnail: "https://images.unsplash.com/photo-1762329389942-c721052cb5ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
        type: "formation" as const,
        category: ""
      };
      
      addWatchedVideo(member.id, videoForTracking);
    }
  }, [member, video, isOpen]);

  if (!video) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full p-0 bg-white rounded-2xl overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>{video.title}</DialogTitle>
          <DialogDescription>{video.description}</DialogDescription>
        </VisuallyHidden>
        
        <div className="relative">
          {/* Video Player */}
          <div className="aspect-video bg-black">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Video Info */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{video.title}</h2>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="text-gray-700 font-medium">{video.instructor}</span>
            <span className="text-2xl">{video.country}</span>
          </div>

          <p className="text-gray-600 mb-6">{video.description}</p>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
              <ThumbsUp className="w-4 h-4" />
              <span>J'aime</span>
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              onClick={() => setIsShareModalOpen(true)}
            >
              <Share2 className="w-4 h-4" />
              <span>Partager</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
              <Bookmark className="w-4 h-4" />
              <span>Sauvegarder</span>
            </button>
          </div>
        </div>
      </DialogContent>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        type="video"
        data={{
          id: video.id,
          title: video.title,
          description: video.description
        }}
      />
    </Dialog>
  );
}