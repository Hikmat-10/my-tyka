import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { X, Download, Share2, Headphones, User } from "lucide-react";
import { type Podcast } from "../services/dataService";
import { Badge } from "./ui/badge";
import { useState } from "react";
import { ShareModal } from "./ShareModal";

interface PodcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  podcast: Podcast | null;
}

const categoryLabels: Record<string, string> = {
  entrepreneuriat: "Entrepreneuriat",
  societe: "Société",
  culture: "Culture",
  art: "Art",
  science: "Science",
  environnement: "Environnement",
  politique: "Politique",
  recherche: "Recherche"
};

export function PodcastModal({ isOpen, onClose, podcast }: PodcastModalProps) {
  const [showShareModal, setShowShareModal] = useState(false);

  if (!podcast) return null;

  const handleDownloadPDF = () => {
    if (podcast.pdfUrl) {
      window.open(podcast.pdfUrl, '_blank');
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <Badge className="bg-white/20 text-white border-white/30 mb-2">
                  🎧 Podcast
                </Badge>
                <h2 className="text-2xl font-bold">{podcast.title}</h2>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium">{podcast.speaker}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/50" />
              <span>{podcast.duration}</span>
              <div className="w-1 h-1 rounded-full bg-white/50" />
              <Badge variant="outline" className="bg-white/10 text-white border-white/30">
                {categoryLabels[podcast.category] || podcast.category}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Audio Player */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-6 border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                  <Headphones className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Lecture audio</p>
                  <p className="font-bold text-gray-900">{podcast.title}</p>
                </div>
              </div>

              <audio
                controls
                className="w-full"
                controlsList="nodownload"
              >
                <source src={podcast.audioUrl} type="audio/mpeg" />
                Votre navigateur ne supporte pas l'élément audio.
              </audio>
            </div>

            {/* Description */}
            {podcast.description && (
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-2">À propos de ce podcast</h3>
                <p className="text-gray-700 leading-relaxed">{podcast.description}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {podcast.pdfUrl && (
                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  className="flex-1 h-12 border-2 border-purple-200 hover:bg-purple-50"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Télécharger le transcript (PDF)
                </Button>
              )}

              <Button
                onClick={handleShare}
                className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Partager ce podcast
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      {showShareModal && podcast && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          type="podcast"
          data={{
            id: podcast.id,
            title: podcast.title,
            description: podcast.description,
            thumbnail: podcast.thumbnail
          }}
        />
      )}
    </>
  );
}