import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { 
  User, 
  BookOpen, 
  Video, 
  Headphones, 
  Lightbulb, 
  LogOut,
  Mail,
  MapPin,
  GraduationCap,
  Heart,
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";

export default function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = localStorage.getItem("tykaCurrentUser");
    if (!currentUser) {
      toast.error("Veuillez vous connecter pour accéder à cette page");
      navigate("/");
      return;
    }
    
    const userData = JSON.parse(currentUser);
    // Charger les données à jour depuis tykaUsers
    const users = JSON.parse(localStorage.getItem("tykaUsers") || "[]");
    const updatedUser = users.find((u: any) => u.id === userData.id);
    setUser(updatedUser || userData);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("tykaCurrentUser");
    toast.success("Déconnexion réussie");
    navigate("/");
  };

  if (!user) {
    return null;
  }

  // Données de démonstration pour l'historique
  const mockFormations = user.formationsSuivies?.length > 0 ? user.formationsSuivies : [
    {
      id: 1,
      titre: "Cohorte Printemps 2026 - Innovation Territoriale",
      statut: "en_cours",
      progression: 65,
      dateDebut: "15 Mars 2026"
    },
    {
      id: 2,
      titre: "MOOC - Transformation Numérique des Territoires",
      statut: "termine",
      progression: 100,
      dateDebut: "10 Janvier 2026"
    }
  ];

  const mockHistoriqueVideos = user.historiqueVideos?.length > 0 ? user.historiqueVideos : [
    {
      id: 1,
      titre: "Comment créer une coopérative locale ?",
      duree: "45 min",
      dateVue: "28 Mars 2026",
      categorie: "Territoires"
    },
    {
      id: 2,
      titre: "L'innovation sociale au service des communautés",
      duree: "32 min",
      dateVue: "25 Mars 2026",
      categorie: "Humanités"
    },
    {
      id: 3,
      titre: "Gouvernance participative : retours d'expérience",
      duree: "28 min",
      dateVue: "20 Mars 2026",
      categorie: "Organisations"
    }
  ];

  const mockHistoriquePodcasts = user.historiquePodcasts?.length > 0 ? user.historiquePodcasts : [
    {
      id: 1,
      titre: "Les tiers-lieux comme catalyseurs de changement",
      duree: "55 min",
      dateEcoute: "27 Mars 2026",
      episode: "Épisode 12"
    },
    {
      id: 2,
      titre: "Économie circulaire en milieu rural",
      duree: "42 min",
      dateEcoute: "22 Mars 2026",
      episode: "Épisode 8"
    }
  ];

  const mockInitiatives = user.initiativesProposees?.length > 0 ? user.initiativesProposees : [
    {
      id: 1,
      titre: "Plateforme de covoiturage pour zones rurales",
      dateProposition: "18 Mars 2026",
      statut: "approuve",
      observationAdmin: "Excellente initiative ! Nous l'intégrons dans la prochaine cohorte comme projet pilote. Votre approche territoriale est très pertinente."
    },
    {
      id: 2,
      titre: "Formation sur la permaculture urbaine",
      dateProposition: "10 Mars 2026",
      statut: "en_attente",
      observationAdmin: null
    },
    {
      id: 3,
      titre: "Hackathon pour solutions énergétiques locales",
      dateProposition: "5 Mars 2026",
      statut: "rejete",
      observationAdmin: "Merci pour cette proposition. Bien que l'idée soit intéressante, nous avons déjà un projet similaire prévu pour le trimestre prochain. Nous vous encourageons à participer à ce projet existant."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-6 py-8">
        {/* En-tête du profil */}
        <Card className="p-6 mb-8 bg-gradient-to-br from-blue-50 to-purple-50 border-none">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {user.prenom[0]}{user.nom[0]}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.prenom} {user.nom}
                </h1>
                <p className="text-gray-600 flex items-center gap-2 mt-1">
                  <User className="w-4 h-4" />
                  @{user.identifiant}
                </p>
                <div className="flex flex-wrap gap-3 mt-3">
                  {user.email && (
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </span>
                  )}
                  {user.pays && (
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {user.pays}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {user.niveauEtudes && (
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-500">Niveau d'études</p>
                  <p className="font-medium text-gray-900">{user.niveauEtudes}</p>
                </div>
              </div>
            )}
            {user.centreInteret && (
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Centre d'intérêt</p>
                  <p className="font-medium text-gray-900">{user.centreInteret}</p>
                </div>
              </div>
            )}
            {user.dateInscription && (
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-gray-500">Membre depuis</p>
                  <p className="font-medium text-gray-900">
                    {new Date(user.dateInscription).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Contenu avec onglets */}
        <Tabs defaultValue="formations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="formations" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Formations
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Vidéos
            </TabsTrigger>
            <TabsTrigger value="podcasts" className="flex items-center gap-2">
              <Headphones className="w-4 h-4" />
              Podcasts
            </TabsTrigger>
            <TabsTrigger value="initiatives" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Initiatives
            </TabsTrigger>
          </TabsList>

          {/* Formations suivies */}
          <TabsContent value="formations">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Mes Formations
              </h2>
              <div className="space-y-4">
                {mockFormations.map((formation: any) => (
                  <div
                    key={formation.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{formation.titre}</h3>
                      <Badge
                        variant={formation.statut === "termine" ? "default" : "secondary"}
                        className={
                          formation.statut === "termine"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }
                      >
                        {formation.statut === "termine" ? "Terminée" : "En cours"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Début : {formation.dateDebut}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progression</span>
                        <span className="font-medium text-gray-900">{formation.progression}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${formation.progression}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Historique vidéos */}
          <TabsContent value="videos">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-600" />
                Historique des Vidéos
              </h2>
              <div className="space-y-3">
                {mockHistoriqueVideos.map((video: any) => (
                  <div
                    key={video.id}
                    className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                      <Video className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">{video.titre}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                        <span>{video.duree}</span>
                        <span>•</span>
                        <span>{video.dateVue}</span>
                        <Badge variant="outline" className="text-xs">
                          {video.categorie}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Historique podcasts */}
          <TabsContent value="podcasts">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Headphones className="w-5 h-5 text-purple-600" />
                Historique des Podcasts
              </h2>
              <div className="space-y-3">
                {mockHistoriquePodcasts.map((podcast: any) => (
                  <div
                    key={podcast.id}
                    className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
                      <Headphones className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">{podcast.titre}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                        <span>{podcast.episode}</span>
                        <span>•</span>
                        <span>{podcast.duree}</span>
                        <span>•</span>
                        <span>{podcast.dateEcoute}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Initiatives proposées */}
          <TabsContent value="initiatives">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-green-600" />
                Mes Initiatives Proposées
              </h2>
              <div className="space-y-4">
                {mockInitiatives.map((initiative: any) => (
                  <div
                    key={initiative.id}
                    className="p-4 border-2 rounded-lg transition-all"
                    style={{
                      borderColor:
                        initiative.statut === "approuve"
                          ? "rgb(34, 197, 94)"
                          : initiative.statut === "rejete"
                          ? "rgb(239, 68, 68)"
                          : "rgb(234, 179, 8)",
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 flex-1">
                        {initiative.titre}
                      </h3>
                      <Badge
                        className="ml-2"
                        style={{
                          backgroundColor:
                            initiative.statut === "approuve"
                              ? "rgb(220, 252, 231)"
                              : initiative.statut === "rejete"
                              ? "rgb(254, 226, 226)"
                              : "rgb(254, 249, 195)",
                          color:
                            initiative.statut === "approuve"
                              ? "rgb(21, 128, 61)"
                              : initiative.statut === "rejete"
                              ? "rgb(153, 27, 27)"
                              : "rgb(113, 63, 18)",
                        }}
                      >
                        {initiative.statut === "approuve" && (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1 inline" />
                            Approuvée
                          </>
                        )}
                        {initiative.statut === "rejete" && (
                          <>
                            <XCircle className="w-3 h-3 mr-1 inline" />
                            Rejetée
                          </>
                        )}
                        {initiative.statut === "en_attente" && (
                          <>
                            <Clock className="w-3 h-3 mr-1 inline" />
                            En attente
                          </>
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Proposée le {initiative.dateProposition}
                    </p>

                    {initiative.observationAdmin && (
                      <div
                        className="mt-3 p-3 rounded-lg"
                        style={{
                          backgroundColor:
                            initiative.statut === "approuve"
                              ? "rgb(240, 253, 244)"
                              : "rgb(254, 242, 242)",
                        }}
                      >
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Observation de l'administrateur :
                        </p>
                        <p className="text-sm text-gray-600 italic">
                          "{initiative.observationAdmin}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
