import { Users, Plus, Heart } from "lucide-react";

export interface Theme {
  id: string;
  title: string;
  description: string;
  interestedCount: number;
  isJoined?: boolean;
}

interface ThemeCardProps {
  theme: Theme;
}

export function ThemeCard({ theme }: ThemeCardProps) {
  return (
    <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200 group">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors flex-1">
          {theme.title}
        </h3>
        {theme.isJoined && (
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
        )}
      </div>
      
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {theme.description}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{theme.interestedCount} intéressé{theme.interestedCount > 1 ? 's' : ''}</span>
        </div>
        
        <button 
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            theme.isJoined 
              ? "bg-blue-600 text-white hover:bg-blue-700" 
              : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
          }`}
        >
          {theme.isJoined ? "Inscrit" : "Rejoindre"}
        </button>
      </div>
    </div>
  );
}
