import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Share2, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface ShareStats {
  total: number;
  byPlatform: {
    WhatsApp: number;
    Facebook: number;
    "Copier le lien": number;
  };
  byType: {
    video: number;
    cohort: number;
  };
  recentShares: Array<{
    id: string;
    type: string;
    contentTitle: string;
    platform: string;
    timestamp: string;
  }>;
}

export function ShareAnalytics() {
  const [stats, setStats] = useState<ShareStats>({
    total: 0,
    byPlatform: {
      WhatsApp: 0,
      Facebook: 0,
      "Copier le lien": 0
    },
    byType: {
      video: 0,
      cohort: 0
    },
    recentShares: []
  });

  useEffect(() => {
    const loadStats = () => {
      const shares = JSON.parse(localStorage.getItem("tykaShares") || "[]");
      
      const newStats: ShareStats = {
        total: shares.length,
        byPlatform: {
          WhatsApp: 0,
          Facebook: 0,
          "Copier le lien": 0
        },
        byType: {
          video: 0,
          cohort: 0
        },
        recentShares: shares.slice(-10).reverse()
      };

      shares.forEach((share: any) => {
        if (share.platform in newStats.byPlatform) {
          newStats.byPlatform[share.platform as keyof typeof newStats.byPlatform]++;
        }
        if (share.type in newStats.byType) {
          newStats.byType[share.type as keyof typeof newStats.byType]++;
        }
      });

      setStats(newStats);
    };

    loadStats();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadStats();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom event when share happens in same tab
    const handleShareEvent = () => {
      loadStats();
    };
    window.addEventListener('tykaShareAdded', handleShareEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tykaShareAdded', handleShareEvent);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-blue-600" />
          Statistiques de Partage
        </CardTitle>
        <CardDescription>
          Impact viral de la communauté TYKA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Shares */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total des partages</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.total}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-400" />
          </div>
        </div>

        {/* By Platform */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Par plateforme</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-[#25D366]/10 rounded-lg">
              <span className="text-sm font-medium text-gray-700">WhatsApp</span>
              <span className="text-lg font-bold text-[#25D366]">{stats.byPlatform.WhatsApp}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#1877F2]/10 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Facebook</span>
              <span className="text-lg font-bold text-[#1877F2]">{stats.byPlatform.Facebook}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Lien copié</span>
              <span className="text-lg font-bold text-gray-700">{stats.byPlatform["Copier le lien"]}</span>
            </div>
          </div>
        </div>

        {/* By Type */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Par type de contenu</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-xs text-gray-600">Vidéos</p>
              <p className="text-2xl font-bold text-orange-600">{stats.byType.video}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-gray-600">Cohortes</p>
              <p className="text-2xl font-bold text-purple-600">{stats.byType.cohort}</p>
            </div>
          </div>
        </div>

        {/* Recent Shares */}
        {stats.recentShares.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Partages récents</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {stats.recentShares.map((share) => (
                <div key={share.id} className="p-2 bg-gray-50 rounded text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 truncate flex-1">
                      {share.contentTitle}
                    </span>
                    <span className="text-gray-500 ml-2 flex-shrink-0">
                      {share.platform}
                    </span>
                  </div>
                  <p className="text-gray-500 mt-1">
                    {new Date(share.timestamp).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.total === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Share2 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">Aucun partage pour le moment</p>
            <p className="text-xs mt-1">Les partages apparaîtront ici</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
