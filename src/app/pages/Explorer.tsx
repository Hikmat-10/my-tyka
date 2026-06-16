import { Header } from "../components/Header";
import { VideoCard, type Video } from "../components/VideoCard";
import { VideoModal } from "../components/VideoModal";
import { PodcastCard } from "../components/PodcastCard";
import { PodcastModal } from "../components/PodcastModal";
import { Video as VideoIcon, ArrowLeft, Search, X, Headphones } from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useMemo, useEffect } from "react";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { getVideos, subscribeToVideos, getPodcasts, subscribeToPodcasts, type Podcast } from "../services/dataService";

// Extended video data with modal info
const videoDetails = [
  {
    id: "1",
    title: "Introduction à l'entrepreneuriat social et solidaire",
    instructor: "Amina Diallo",
    description: "Découvrez les fondamentaux de l'entrepreneuriat social, comment créer de la valeur tout en ayant un impact positif sur la société. Cette formation couvre les modèles économiques, les stratégies de financement et les meilleures pratiques.",
    youtubeId: "dQw4w9WgXcQ",
    country: "🇸🇳"
  },
  {
    id: "2",
    title: "Leadership participatif : nouvelles approches territoriales",
    instructor: "Marcus Chen",
    description: "Explorez les nouvelles formes de leadership adaptées aux territoires et communautés. Apprenez à faciliter la collaboration, l'intelligence collective et la prise de décision participative.",
    youtubeId: "dQw4w9WgXcQ",
    country: "🇨🇳"
  },
  {
    id: "3",
    title: "Transformation digitale des organisations",
    instructor: "Sophie Laurent",
    description: "Accompagnez votre organisation dans sa transition numérique. Outils, méthodologies et stratégies pour réussir la transformation digitale tout en impliquant les équipes.",
    youtubeId: "dQw4w9WgXcQ",
    country: "🇫🇷"
  },
  {
    id: "4",
    title: "Témoignage : Construire une communauté apprenante",
    instructor: "Karim El-Mansouri",
    description: "Un témoignage inspirant sur la création et l'animation d'une communauté d'apprentissage. Découvrez les défis, les succès et les leçons apprises d'une expérience terrain.",
    youtubeId: "dQw4w9WgXcQ",
    country: "🇦🇪"
  },
  {
    id: "5",
    title: "Stratégies d'innovation collaborative",
    instructor: "Elena Rodriguez",
    description: "Maîtrisez les techniques d'innovation ouverte et collaborative. Comment co-créer avec vos parties prenantes et générer des solutions innovantes ensemble.",
    youtubeId: "dQw4w9WgXcQ",
    country: "🇧🇷"
  },
  {
    id: "6",
    title: "Gestion de projet agile en contexte communautaire",
    instructor: "Jean-Pierre Dubois",
    description: "Adaptez les méthodes agiles aux projets communautaires et territoriaux. Scrum, Kanban et autres frameworks pour plus d'efficacité et d'adaptabilité.",
    youtubeId: "dQw4w9WgXcQ",
    country: "🇧🇪"
  },
  {
    id: "7",
    title: "Design thinking appliqué aux territoires",
    instructor: "Yuki Tanaka",
    description: "Utilisez le design thinking pour résoudre les défis territoriaux. Méthodes de créativité, prototypage et test centré sur les usagers.",
    youtubeId: "dQw4w9WgXcQ",
    country: "🇯🇵"
  },
  {
    id: "8",
    title: "Communication interculturelle",
    instructor: "Fatima Ndiaye",
    description: "Développez vos compétences en communication interculturelle. Comprenez les différences culturelles et apprenez à collaborer efficacement dans des contextes diversifiés.",
    youtubeId: "dQw4w9WgXcQ",
    country: "🇸🇳"
  },
  {
    id: "9",
    title: "Écologie et développement durable",
    instructor: "Pierre Durand",
    description: "Apprenez les principes de l'écologie et du développement durable. Stratégies pour une gestion responsable des ressources et une transition écologique.",
    youtubeId: "dQw4w9WgXcQ",
    country: "🇫🇷"
  },
  {
    id: "10",
    title: "Politique participative et citoyenneté",
    instructor: "Léa Mbaye",
    description: "Explorez les mécanismes de la politique participative et la citoyenneté active. Comment impliquer les citoyens dans la prise de décision et la gestion des territoires.",
    youtubeId: "dQw4w9WgXcQ",
    country: "🇸🇳"
  },
  {
    id: "11",
    title: "Intelligence artificielle et société",
    instructor: "David Kim",
    description: "Découvrez les applications de l'intelligence artificielle dans la société. Outils, éthique et impact sur les différents secteurs.",
    youtubeId: "dQw4w9WgXcQ",
    country: "🇺🇸"
  }
];

const categories = [
  { id: "tous", label: "Tous", icon: "🌍" },
  { id: "art", label: "Art", icon: "🎨" },
  { id: "science", label: "Science", icon: "🔬" },
  { id: "societe", label: "Société", icon: "👥" },
  { id: "entrepreneuriat", label: "Entrepreneuriat", icon: "🚀" },
  { id: "recherche", label: "Recherche", icon: "📚" },
  { id: "politique", label: "Politique", icon: "🏛️" },
  { id: "culture", label: "Culture", icon: "🎭" },
  { id: "environnement", label: "Environnement", icon: "🌱" },
];

export default function Explorer() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<Video[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<typeof videoDetails[0] | null>(null);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("videos");

  // Load videos and podcasts from dataService and subscribe to changes
  useEffect(() => {
    setVideos(getVideos());
    setPodcasts(getPodcasts());

    // Subscribe to real-time updates
    const unsubscribeVideos = subscribeToVideos((updatedVideos) => {
      setVideos(updatedVideos);
    });

    const unsubscribePodcasts = subscribeToPodcasts((updatedPodcasts) => {
      setPodcasts(updatedPodcasts);
    });

    return () => {
      unsubscribeVideos();
      unsubscribePodcasts();
    };
  }, []);

  const handleVideoClick = (videoId: string) => {
    const detail = videoDetails.find(v => v.id === videoId);
    if (detail) {
      setSelectedVideo(detail);
    }
  };

  const handlePodcastClick = (podcast: Podcast) => {
    setSelectedPodcast(podcast);
  };

  // Smart filtering with search and category for videos
  const filteredVideos = useMemo(() => {
    let filtered = videos;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(video => {
        const matchesTitle = video.title.toLowerCase().includes(query);
        const matchesInstructor = video.instructor.toLowerCase().includes(query);
        const matchesCategory = video.category.toLowerCase().includes(query);
        const categoryLabel = categories.find(c => c.id === video.category)?.label.toLowerCase();
        const matchesCategoryLabel = categoryLabel?.includes(query);

        return matchesTitle || matchesInstructor || matchesCategory || matchesCategoryLabel;
      });
    }

    // Filter by selected category
    if (selectedCategory && selectedCategory !== "tous") {
      filtered = filtered.filter(video => video.category === selectedCategory);
    }

    return filtered;
  }, [searchQuery, selectedCategory, videos]);

  // Smart filtering with search and category for podcasts
  const filteredPodcasts = useMemo(() => {
    let filtered = podcasts;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(podcast => {
        const matchesTitle = podcast.title.toLowerCase().includes(query);
        const matchesSpeaker = podcast.speaker.toLowerCase().includes(query);
        const matchesCategory = podcast.category.toLowerCase().includes(query);
        const categoryLabel = categories.find(c => c.id === podcast.category)?.label.toLowerCase();
        const matchesCategoryLabel = categoryLabel?.includes(query);

        return matchesTitle || matchesSpeaker || matchesCategory || matchesCategoryLabel;
      });
    }

    // Filter by selected category
    if (selectedCategory && selectedCategory !== "tous") {
      filtered = filtered.filter(podcast => podcast.category === selectedCategory);
    }

    return filtered;
  }, [searchQuery, selectedCategory, podcasts]);

  // Auto-suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || !showSuggestions) return [];

    const query = searchQuery.toLowerCase();
    const videoSuggestions = videos
      .filter(v => v.title.toLowerCase().includes(query))
      .slice(0, 3)
      .map(v => ({ type: "video" as const, label: v.title, value: v.title, id: v.id }));

    const categorySuggestions = categories
      .filter(c => 
        c.id !== "tous" && 
        (c.label.toLowerCase().includes(query) || c.id.toLowerCase().includes(query))
      )
      .slice(0, 3)
      .map(c => ({ type: "category" as const, label: c.label, value: c.id, icon: c.icon }));

    return [...categorySuggestions, ...videoSuggestions].slice(0, 5);
  }, [searchQuery, showSuggestions]);

  const handleSuggestionClick = (suggestion: typeof suggestions[0]) => {
    if (suggestion.type === "category") {
      setSelectedCategory(suggestion.value);
      setSearchQuery("");
      setShowSuggestions(false);
    } else if (suggestion.type === "video") {
      handleVideoClick(suggestion.id);
      setSearchQuery("");
      setShowSuggestions(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedCategory("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour à l'accueil
        </button>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-white/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <VideoIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Univers TYKA</h1>
          </div>
          <p className="text-gray-600 mb-8">Apprendre, comprendre, s'inspirer</p>

          {/* Smart Search Bar */}
          <div className="mb-6 relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Rechercher une vidéo ou un domaine…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="pl-12 pr-12 h-14 text-base rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
              {(searchQuery || selectedCategory) && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Auto-suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowSuggestions(false)}
                />
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-20 animate-in fade-in-0 slide-in-from-top-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                    >
                      {suggestion.type === "category" ? (
                        <>
                          <span className="text-2xl">{suggestion.icon}</span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{suggestion.label}</p>
                            <p className="text-xs text-gray-500">Catégorie</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                            <VideoIcon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{suggestion.label}</p>
                            <p className="text-xs text-gray-500">Vidéo</p>
                          </div>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Active Filters / Category Chips */}
          <div className="mb-6 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105 ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-md"
                    : "bg-white hover:bg-gray-50 border-gray-200"
                }`}
                onClick={() => {
                  if (selectedCategory === category.id) {
                    setSelectedCategory("");
                  } else {
                    setSelectedCategory(category.id);
                  }
                }}
              >
                <span className="mr-2">{category.icon}</span>
                {category.label}
              </Badge>
            ))}
          </div>

          {/* Tabs: Vidéos / Podcasts */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger
                value="videos"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg transition-all"
              >
                <VideoIcon className="w-4 h-4 mr-2" />
                Vidéos ({filteredVideos.length})
              </TabsTrigger>
              <TabsTrigger
                value="podcasts"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white rounded-lg transition-all"
              >
                <Headphones className="w-4 h-4 mr-2" />
                Podcasts ({filteredPodcasts.length})
              </TabsTrigger>
            </TabsList>

            {/* Videos Tab */}
            <TabsContent value="videos" className="mt-0">
              {filteredVideos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <VideoIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-2">Aucune vidéo trouvée</p>
                  <p className="text-sm text-gray-400">
                    Essayez une autre recherche ou sélectionnez une catégorie différente
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredVideos.map((video) => (
                    <div key={video.id} onClick={() => handleVideoClick(video.id)}>
                      <VideoCard video={video} />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Podcasts Tab */}
            <TabsContent value="podcasts" className="mt-0">
              {filteredPodcasts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Headphones className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-2">Aucun podcast trouvé</p>
                  <p className="text-sm text-gray-400">
                    Essayez une autre recherche ou sélectionnez une catégorie différente
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredPodcasts.map((podcast) => (
                    <div key={podcast.id} onClick={() => handlePodcastClick(podcast)}>
                      <PodcastCard podcast={podcast} />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <VideoModal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        video={selectedVideo}
      />

      <PodcastModal
        isOpen={!!selectedPodcast}
        onClose={() => setSelectedPodcast(null)}
        podcast={selectedPodcast}
      />
    </div>
  );
}