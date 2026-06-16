import { AdminLayout } from "../../components/admin/AdminLayout";
import { Video as VideoIcon, Youtube, Plus, Trash2, Edit, Eye, Headphones, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { getVideos, addVideo, deleteVideo, getPodcasts, addPodcast, deletePodcast, type Video, type Podcast } from "../../services/dataService";
import { toast } from "sonner";

const CATEGORIES = [
  { value: "art", label: "Art" },
  { value: "science", label: "Science" },
  { value: "culture", label: "Culture" },
  { value: "entrepreneuriat", label: "Entrepreneuriat" },
  { value: "societe", label: "Société" },
  { value: "environnement", label: "Environnement" },
  { value: "politique", label: "Politique" },
  { value: "recherche", label: "Recherche" }
];

const VIDEO_TYPES = [
  { value: "formation", label: "Formation" },
  { value: "masterclass", label: "Masterclass" },
  { value: "expertise", label: "Expertise" },
  { value: "témoignage", label: "Témoignage" }
];

export default function LearningDevDashboard() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [showAddPodcast, setShowAddPodcast] = useState(false);
  const [newVideo, setNewVideo] = useState({ title: "", instructor: "", duration: "", thumbnail: "", type: "", category: "" });
  const [newPodcast, setNewPodcast] = useState({ title: "", speaker: "", duration: "", thumbnail: "", audioUrl: "", pdfUrl: "", category: "", description: "" });

  useEffect(() => {
    setVideos(getVideos());
    setPodcasts(getPodcasts());
  }, []);

  const handleAddVideo = () => {
    if (!newVideo.title || !newVideo.instructor || !newVideo.duration || !newVideo.type || !newVideo.category) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    let thumbnail = newVideo.thumbnail;
    if (!thumbnail) thumbnail = `https://images.unsplash.com/photo-1762329389942-c721052cb5ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080`;
    addVideo({ title: newVideo.title, instructor: newVideo.instructor, duration: newVideo.duration, thumbnail, type: newVideo.type as any, category: newVideo.category });
    setVideos(getVideos());
    setNewVideo({ title: "", instructor: "", duration: "", thumbnail: "", type: "", category: "" });
    setShowAddVideo(false);
    toast.success("✅ Vidéo ajoutée avec succès !");
  };

  const handleDeleteVideo = (id: string) => {
    if (window.confirm("Supprimer cette vidéo ?")) {
      deleteVideo(id);
      setVideos(getVideos());
      toast.success("Vidéo supprimée");
    }
  };

  const handleAddPodcast = () => {
    if (!newPodcast.title || !newPodcast.speaker || !newPodcast.duration || !newPodcast.audioUrl || !newPodcast.category) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    let thumbnail = newPodcast.thumbnail;
    if (!thumbnail) thumbnail = `https://images.unsplash.com/photo-1478737270239-2f02b77fc618?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080`;
    addPodcast({ title: newPodcast.title, speaker: newPodcast.speaker, duration: newPodcast.duration, thumbnail, audioUrl: newPodcast.audioUrl, pdfUrl: newPodcast.pdfUrl || undefined, category: newPodcast.category, description: newPodcast.description || undefined });
    setPodcasts(getPodcasts());
    setNewPodcast({ title: "", speaker: "", duration: "", thumbnail: "", audioUrl: "", pdfUrl: "", category: "", description: "" });
    setShowAddPodcast(false);
    toast.success("✅ Podcast ajouté avec succès !");
  };

  const handleDeletePodcast = (id: string) => {
    if (window.confirm("Supprimer ce podcast ?")) {
      deletePodcast(id);
      setPodcasts(getPodcasts());
      toast.success("Podcast supprimé");
    }
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&\?\/]+)/);
    return match ? match[1] : null;
  };

  const handleThumbnailChange = (url: string) => {
    setNewVideo(prev => ({ ...prev, thumbnail: url }));
    const youtubeId = extractYouTubeId(url);
    if (youtubeId) setNewVideo(prev => ({ ...prev, thumbnail: `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` }));
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Learning Developer</h1>
            <p className="text-gray-600 mt-2">Gestion des contenus SAVOIRS — Vidéos & Podcasts</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Dialog open={showAddVideo} onOpenChange={setShowAddVideo}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une Vidéo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Ajouter une Nouvelle Vidéo</DialogTitle>
                  <DialogDescription>Cette vidéo apparaîtra dans SAVOIRS → Explorer</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Titre *</Label>
                    <Input value={newVideo.title} onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })} placeholder="Titre de la vidéo" className="mt-1" />
                  </div>
                  <div>
                    <Label>Instructeur / Intervenant *</Label>
                    <Input value={newVideo.instructor} onChange={(e) => setNewVideo({ ...newVideo, instructor: e.target.value })} placeholder="Nom de l'intervenant" className="mt-1" />
                  </div>
                  <div>
                    <Label>Durée *</Label>
                    <Input value={newVideo.duration} onChange={(e) => setNewVideo({ ...newVideo, duration: e.target.value })} placeholder="Ex: 45 min, 1h 30min" className="mt-1" />
                  </div>
                  <div>
                    <Label>URL vidéo / miniature (optionnel)</Label>
                    <div className="flex gap-2 mt-1">
                      <Youtube className="w-5 h-5 text-red-500 mt-2" />
                      <Input value={newVideo.thumbnail} onChange={(e) => handleThumbnailChange(e.target.value)} placeholder="https://www.youtube.com/watch?v=... ou URL d'image" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">URL YouTube ou lien direct vers une image.</p>
                  </div>
                  <div>
                    <Label>Type de contenu *</Label>
                    <Select value={newVideo.type} onValueChange={(v) => setNewVideo({ ...newVideo, type: v })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner un type" /></SelectTrigger>
                      <SelectContent>{VIDEO_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Catégorie *</Label>
                    <Select value={newVideo.category} onValueChange={(v) => setNewVideo({ ...newVideo, category: v })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner une catégorie" /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setShowAddVideo(false)}>Annuler</Button>
                    <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600" onClick={handleAddVideo}>Ajouter</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showAddPodcast} onOpenChange={setShowAddPodcast}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un Podcast
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Ajouter un Nouveau Podcast</DialogTitle>
                  <DialogDescription>Ce podcast apparaîtra dans Explorer → Podcasts</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Titre *</Label>
                    <Input value={newPodcast.title} onChange={(e) => setNewPodcast({ ...newPodcast, title: e.target.value })} placeholder="Titre du podcast" className="mt-1" />
                  </div>
                  <div>
                    <Label>Intervenant / Animateur *</Label>
                    <Input value={newPodcast.speaker} onChange={(e) => setNewPodcast({ ...newPodcast, speaker: e.target.value })} placeholder="Nom de l'intervenant" className="mt-1" />
                  </div>
                  <div>
                    <Label>Durée *</Label>
                    <Input value={newPodcast.duration} onChange={(e) => setNewPodcast({ ...newPodcast, duration: e.target.value })} placeholder="Ex: 32 min, 1h 15min" className="mt-1" />
                  </div>
                  <div>
                    <Label>URL Audio (MP3) *</Label>
                    <div className="flex gap-2 mt-1">
                      <Headphones className="w-5 h-5 text-purple-500 mt-2" />
                      <Input value={newPodcast.audioUrl} onChange={(e) => setNewPodcast({ ...newPodcast, audioUrl: e.target.value })} placeholder="https://example.com/podcast.mp3" />
                    </div>
                  </div>
                  <div>
                    <Label>URL PDF Transcript (optionnel)</Label>
                    <div className="flex gap-2 mt-1">
                      <FileText className="w-5 h-5 text-blue-500 mt-2" />
                      <Input value={newPodcast.pdfUrl} onChange={(e) => setNewPodcast({ ...newPodcast, pdfUrl: e.target.value })} placeholder="https://example.com/transcript.pdf" />
                    </div>
                  </div>
                  <div>
                    <Label>URL Miniature (optionnel)</Label>
                    <Input value={newPodcast.thumbnail} onChange={(e) => setNewPodcast({ ...newPodcast, thumbnail: e.target.value })} placeholder="https://images.unsplash.com/..." className="mt-1" />
                  </div>
                  <div>
                    <Label>Catégorie *</Label>
                    <Select value={newPodcast.category} onValueChange={(v) => setNewPodcast({ ...newPodcast, category: v })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner une catégorie" /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Description (optionnelle)</Label>
                    <Textarea value={newPodcast.description} onChange={(e) => setNewPodcast({ ...newPodcast, description: e.target.value })} placeholder="Brève description du podcast..." rows={3} className="mt-1" />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1" onClick={() => setShowAddPodcast(false)}>Annuler</Button>
                    <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600" onClick={handleAddPodcast}>Ajouter</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="border-l-4 border-l-emerald-500 bg-emerald-50">
          <CardContent className="py-4">
            <p className="text-sm text-emerald-900">
              ℹ️ <span className="font-semibold">Synchronisation automatique :</span> Les contenus ajoutés ici apparaissent immédiatement dans SAVOIRS → Explorer. La création et gestion des cohortes est réservée au Super Admin.
            </p>
          </CardContent>
        </Card>

        {/* Content tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Contenus Publiés</CardTitle>
            <CardDescription>{videos.length} vidéo(s) • {podcasts.length} podcast(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="videos" className="w-full">
              <TabsList className="grid w-full max-w-xs grid-cols-2 mb-6">
                <TabsTrigger value="videos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                  <VideoIcon className="w-4 h-4 mr-2" />
                  Vidéos ({videos.length})
                </TabsTrigger>
                <TabsTrigger value="podcasts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                  <Headphones className="w-4 h-4 mr-2" />
                  Podcasts ({podcasts.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="videos">
                {videos.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <VideoIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Aucune vidéo publiée pour le moment</p>
                    <p className="text-sm mt-2">Ajoutez votre première vidéo ci-dessus</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => (
                      <div key={video.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative aspect-video bg-gray-200">
                          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2"><Badge className="bg-purple-600">{video.type}</Badge></div>
                          <div className="absolute bottom-2 left-2"><Badge variant="outline" className="bg-white/90">{video.category}</Badge></div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{video.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{video.instructor}</p>
                          <p className="text-xs text-gray-500 mb-3">{video.duration}</p>
                          <div className="flex gap-1 justify-end">
                            <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost"><Edit className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteVideo(video.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="podcasts">
                {podcasts.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Headphones className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Aucun podcast publié pour le moment</p>
                    <p className="text-sm mt-2">Ajoutez votre premier podcast ci-dessus</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {podcasts.map((podcast) => (
                      <div key={podcast.id} className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative aspect-video bg-gray-200">
                          <img src={podcast.thumbnail} alt={podcast.title} className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2"><Badge className="bg-pink-600">🎧 Podcast</Badge></div>
                          <div className="absolute bottom-2 left-2"><Badge variant="outline" className="bg-white/90">{podcast.category}</Badge></div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{podcast.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{podcast.speaker}</p>
                          <p className="text-xs text-gray-500 mb-1">{podcast.duration}</p>
                          {podcast.pdfUrl && (
                            <p className="text-xs text-purple-600 mb-3 flex items-center gap-1"><FileText className="w-3 h-3" />Transcript disponible</p>
                          )}
                          <div className="flex gap-1 justify-end">
                            <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost"><Edit className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={() => handleDeletePodcast(podcast.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
