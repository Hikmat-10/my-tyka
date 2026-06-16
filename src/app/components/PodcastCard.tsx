import { Headphones, Clock, Download, User } from "lucide-react";
import { type Podcast } from "../services/dataService";
import { Badge } from "./ui/badge";

interface PodcastCardProps {
  podcast: Podcast;
  onClick?: () => void;
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

export function PodcastCard({ podcast, onClick }: PodcastCardProps) {
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100 hover:scale-[1.02] active:scale-100"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden">
        <img
          src={podcast.thumbnail}
          alt={podcast.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
            <Headphones className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-purple-600 text-white border-0">
            🎧 Podcast
          </Badge>
        </div>

        {/* Duration */}
        <div className="absolute bottom-3 right-3">
          <Badge variant="outline" className="bg-black/60 text-white border-white/30 backdrop-blur-sm">
            <Clock className="w-3 h-3 mr-1" />
            {podcast.duration}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
          {podcast.title}
        </h3>

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <User className="w-4 h-4" />
          <span className="font-medium">{podcast.speaker}</span>
        </div>

        {podcast.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {podcast.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Badge variant="outline" className="text-xs">
            {categoryLabels[podcast.category] || podcast.category}
          </Badge>

          {podcast.pdfUrl && (
            <div className="flex items-center gap-1 text-xs text-purple-600">
              <Download className="w-3 h-3" />
              <span>Transcript PDF</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
