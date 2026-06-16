import { Header } from "../components/Header";
import { useMemberAuth } from "../contexts/MemberAuthContext";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
  User,
  Users,
  Mail,
  MapPin,
  Phone,
  MessageCircle,
  Calendar,
  Award,
  BookOpen,
  Settings,
  LogOut,
  Edit,
  GraduationCap,
  Briefcase,
  Globe,
  Clock,
  AlertCircle,
  Play,
  TrendingUp,
  Activity,
  Eye,
  Compass,
  ChevronRight,
  CheckCircle2,
  ExternalLink,
  Loader,
  Plus,
  Megaphone,
  HelpCircle,
  HandHelping,
  X
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import { getWatchedVideos, getMemberStats, addAnnouncement } from "../services/dataService";
import type { WatchedVideo, Announcement } from "../services/dataService";
import { toast } from "sonner";

export default function MemberDashboard() {
  const { member, logout } = useMemberAuth();
  const navigate = useNavigate();
  const [enrolledCohorts, setEnrolledCohorts] = useState<any[]>([]);
  const [watchedVideos, setWatchedVideos] = useState<WatchedVideo[]>([]);
  const [memberStats, setMemberStats] = useState<any>({});
  const [showPublishAnn, setShowPublishAnn] = useState(false);
  const [annForm, setAnnForm] = useState({ category: "question" as Announcement["category"], title: "", description: "", location: "", deadline: "", contact: "" });

  useEffect(() => {
    if (!member) {
      // Rediriger vers l'accueil et afficher un message
      toast.error("Connexion requise", {
        description: "Veuillez vous connecter pour accéder à votre espace membre",
      });
      navigate("/");
      return;
    }

    // Load enrolled cohorts from localStorage with new key format
    const storageKey = `tykaCohortEnrollments_${member.id}`;
    const enrollments = JSON.parse(localStorage.getItem(storageKey) || "[]");

    // Keep all enrollment data for display
    setEnrolledCohorts(enrollments);

    // Load watched videos
    setWatchedVideos(getWatchedVideos(member.id));

    // Load member stats
    setMemberStats(getMemberStats(member.id));
  }, [member, navigate]);

  if (!member) {
    return null;
  }

  const getInitials = () => {
    return `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();
  };

  const getStatusBadgeColor = () => {
    switch (member.status) {
      case "member":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "ambassador_potential":
        return "bg-amber-100 text-amber-700 border-amber-300";
      case "ambassador_active":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusLabel = () => {
    switch (member.status) {
      case "member":
        return "Membre";
      case "ambassador_potential":
        return "Ambassadeur Potentiel";
      case "ambassador_active":
        return "Ambassadeur Actif";
      default:
        return "Membre";
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/30">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mon Espace</h1>
              <p className="text-gray-600">Bienvenue, {member.firstName} !</p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Validation Status Alert */}
        {(member.validationStatus || "active") === "pending_validation" && (
          <div className="mb-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600 animate-pulse" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-amber-900">Compte en attente de validation</h3>
                  <Badge className="bg-amber-500 text-white hover:bg-amber-600">
                    En attente
                  </Badge>
                </div>
                <p className="text-amber-800 mb-3">
                  Votre compte est actuellement en cours de validation par notre équipe d'ambassadeurs. 
                  Vous aurez accès à toutes les fonctionnalités dès validation.
                </p>
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <AlertCircle className="w-4 h-4" />
                  <span>
                    Vous recevrez une notification par <strong>email</strong> et <strong>WhatsApp</strong> une fois validé.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Summary Card */}
        <Card className="mb-8 border-2 border-orange-200 bg-gradient-to-br from-white to-orange-50/30">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="w-32 h-32 border-4 border-orange-200">
                  {member.profileImage ? (
                    <AvatarImage src={member.profileImage} alt={`${member.firstName} ${member.lastName}`} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-400 text-white text-3xl">
                      {getInitials()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {member.firstName} {member.lastName}
                    </h2>
                    <Badge className={`${getStatusBadgeColor()} border`}>
                      {getStatusLabel()}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/profil/modifier")}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {member.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4 text-orange-500" />
                      <span>{member.email}</span>
                    </div>
                  )}
                  
                  {member.country && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      <span>{member.city && `${member.city}, `}{member.country}</span>
                    </div>
                  )}

                  {member.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4 text-orange-500" />
                      <span>{member.phone}</span>
                    </div>
                  )}

                  {member.whatsapp && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MessageCircle className="w-4 h-4 text-orange-500" />
                      <span>{member.whatsapp}</span>
                    </div>
                  )}

                  {member.activity && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Briefcase className="w-4 h-4 text-orange-500" />
                      <span>{member.activity}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span>Membre depuis {new Date(member.joinedAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                {member.bio && (
                  <div className="mt-4 p-4 bg-white/70 rounded-lg border border-orange-100">
                    <p className="text-sm text-gray-700">{member.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Tableau de bord
            </TabsTrigger>
            <TabsTrigger value="cohorts" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Mes Cohortes
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Mes Vidéos
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="border-2 border-orange-200">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-orange-500" />
                    Vidéos regardées
                  </CardDescription>
                  <CardTitle className="text-4xl font-bold text-orange-600">
                    {memberStats.totalVideosWatched || 0}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate("/explorer")}
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Explorer les vidéos
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-amber-200">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-amber-500" />
                    Cohortes rejointes
                  </CardDescription>
                  <CardTitle className="text-4xl font-bold text-amber-600">
                    {memberStats.totalCohortsJoined || 0}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate("/co-creer")}
                    className="w-full"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Voir les cohortes
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-500" />
                    Activités totales
                  </CardDescription>
                  <CardTitle className="text-4xl font-bold text-green-600">
                    {memberStats.totalActivities || 0}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-500">
                    {memberStats.lastActivity 
                      ? `Dernière activité : ${new Date(memberStats.lastActivity).toLocaleDateString('fr-FR')}`
                      : "Aucune activité récente"
                    }
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* TYKA Compass Widget */}
            {(() => {
              const compDiags = JSON.parse(localStorage.getItem(`tykaCompass_${member.id}`) || "[]");
              const completed = compDiags.filter((d: any) => d.status === "completed");
              const latest = completed[0];
              return (
                <div className="mb-6 relative overflow-hidden bg-gradient-to-br from-[#0f0904] via-[#2d1810] to-[#1a0e05] rounded-2xl p-5 text-white cursor-pointer group" onClick={() => navigate("/compass")}>
                  <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #F59E0B 0%, transparent 60%)" }} />
                  <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <Compass className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white">TYKA Compass</p>
                      <p className="text-xs text-white/60">Mon diagnostic et mon plan de développement</p>
                      {latest && <p className="text-xs text-amber-300 mt-0.5">Dernier score : <span className="font-bold">{Math.round(latest.globalScore || 0)}%</span> — {latest.name}</p>}
                      {!latest && <p className="text-xs text-amber-300 mt-0.5">Commencez votre premier diagnostic</p>}
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {latest && <span className="text-2xl font-bold text-amber-400">{Math.round(latest.globalScore || 0)}%</span>}
                      <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/80 transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* TYKA Connect quick action */}
            <div className="mb-6 bg-gradient-to-r from-[#1B2A4A] to-[#2d3f6b] rounded-2xl p-5 text-white flex items-center gap-4 cursor-pointer group" onClick={() => setShowPublishAnn(true)}>
              <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Megaphone className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold">Publier une annonce</p>
                <p className="text-xs text-white/60">Partagez une opportunité, posez une question ou demandez de l'aide à la communauté</p>
              </div>
              <Plus className="w-6 h-6 text-white/60 group-hover:text-white transition-colors flex-shrink-0" />
            </div>

            {/* Skills Overview */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-orange-500" />
                  Mes Compétences
                </CardTitle>
              </CardHeader>
              <CardContent>
                {member.skills && member.skills.length > 0 ? (
                  <div className="space-y-3">
                    {member.skills.slice(0, 3).map((skill, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{skill.name}</span>
                          <span className="text-xs text-gray-600">{skill.level}/5</span>
                        </div>
                        <Progress value={skill.level * 20} className="h-2" />
                      </div>
                    ))}
                    {member.skills.length > 3 && (
                      <p className="text-xs text-gray-500 text-center pt-2">
                        + {member.skills.length - 3} compétences supplémentaires
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-3">Aucune compétence renseignée</p>
                    <Button
                      onClick={() => navigate("/profil/modifier")}
                      size="sm"
                      variant="outline"
                    >
                      Ajouter mes compétences
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Videos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-orange-500" />
                  Vidéos récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {watchedVideos.length > 0 ? (
                  <div className="space-y-3">
                    {watchedVideos.slice(0, 3).map((video) => (
                      <div key={video.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100 hover:shadow-sm transition-shadow">
                        <img 
                          src={video.videoThumbnail} 
                          alt={video.videoTitle}
                          className="w-20 h-14 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{video.videoTitle}</h4>
                          <p className="text-xs text-gray-500">{video.videoInstructor} • {video.videoDuration}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Regardée le {new Date(video.watchedAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    ))}
                    {watchedVideos.length > 3 && (
                      <p className="text-xs text-gray-500 text-center pt-2">
                        + {watchedVideos.length - 3} vidéos supplémentaires
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Play className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-3">Aucune vidéo regardée</p>
                    <Button
                      onClick={() => navigate("/explorer")}
                      size="sm"
                      variant="outline"
                    >
                      Explorer les vidéos
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cohorts Tab */}
          <TabsContent value="cohorts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-orange-500" />
                  Mes Cohortes de Formation
                </CardTitle>
                <CardDescription>
                  Suivez votre progression dans les cohortes auxquelles vous êtes inscrit
                </CardDescription>
              </CardHeader>
              <CardContent>
                {enrolledCohorts.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Vous n'êtes inscrit à aucune cohorte</p>
                    <Button
                      onClick={() => navigate("/co-creer")}
                      className="bg-gradient-to-r from-orange-500 to-amber-500"
                    >
                      Explorer les cohortes
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enrolledCohorts.map((cohort) => {
                      const getPaymentStatusConfig = () => {
                        switch (cohort.paymentStatus) {
                          case "pending_payment":
                            return {
                              label: "En attente de paiement",
                              color: "bg-amber-100 text-amber-700 border-amber-300",
                              icon: Clock,
                            };
                          case "payment_submitted":
                            return {
                              label: "Paiement soumis",
                              color: "bg-blue-100 text-blue-700 border-blue-300",
                              icon: Loader,
                            };
                          case "confirmed":
                            return {
                              label: "Paiement validé – Accès LMS disponible",
                              color: "bg-emerald-100 text-emerald-700 border-emerald-300",
                              icon: CheckCircle2,
                            };
                          default:
                            return {
                              label: "Statut inconnu",
                              color: "bg-gray-100 text-gray-700 border-gray-300",
                              icon: AlertCircle,
                            };
                        }
                      };

                      const paymentConfig = getPaymentStatusConfig();
                      const PaymentIcon = paymentConfig.icon;

                      return (
                        <div
                          key={cohort.cohortId}
                          className="p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1 text-lg">{cohort.cohortTitle}</h3>
                              {cohort.cohortDomain && (
                                <p className="text-sm text-gray-600 mb-2">{cohort.cohortDomain}</p>
                              )}
                            </div>
                          </div>

                          {/* Payment Status */}
                          <div className="mb-4">
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${paymentConfig.color}`}>
                              <PaymentIcon className="w-4 h-4 flex-shrink-0" />
                              <span className="text-sm font-medium">{paymentConfig.label}</span>
                            </div>
                          </div>

                          {/* LMS Access Button */}
                          {cohort.paymentStatus === "confirmed" && cohort.lmsAccessLink && (
                            <div className="mb-4">
                              <a
                                href={cohort.lmsAccessLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-md"
                              >
                                <ExternalLink className="w-5 h-5" />
                                Accéder à la formation
                              </a>
                              <p className="text-xs text-center text-gray-500 mt-2">
                                Vous serez redirigé vers TYKA Klasio
                              </p>
                            </div>
                          )}

                          {/* Additional Info */}
                          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-0.5">Montant</p>
                              <p className="font-semibold text-gray-900">
                                {cohort.price.toLocaleString("fr-FR")} {cohort.currency}
                              </p>
                            </div>
                            {cohort.cohortModality && (
                              <div>
                                <p className="text-xs text-gray-500 mb-0.5">Format</p>
                                <p className="font-medium text-gray-700 capitalize">{cohort.cohortModality}</p>
                              </div>
                            )}
                          </div>

                          {/* Progress Bar (only for confirmed) */}
                          {cohort.paymentStatus === "confirmed" && (
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Progression</span>
                                <span className="font-semibold text-orange-600">{cohort.progress || 0}%</span>
                              </div>
                              <Progress value={cohort.progress || 0} className="h-2" />
                            </div>
                          )}

                          <div className="pt-3 border-t border-orange-200 text-xs text-gray-500">
                            Inscrit le {new Date(cohort.enrolledAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-orange-500" />
                  Mes Vidéos
                </CardTitle>
                <CardDescription>
                  Liste des vidéos que vous avez regardées
                </CardDescription>
              </CardHeader>
              <CardContent>
                {watchedVideos.length > 0 ? (
                  <div className="space-y-4">
                    {watchedVideos.map((video) => (
                      <div key={video.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100 hover:shadow-sm transition-shadow">
                        <img 
                          src={video.videoThumbnail} 
                          alt={video.videoTitle}
                          className="w-20 h-14 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{video.videoTitle}</h4>
                          <p className="text-xs text-gray-500">{video.videoInstructor} • {video.videoDuration}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Regardée le {new Date(video.watchedAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Aucune vidéo regardée</p>
                    <Button
                      onClick={() => navigate("/explorer")}
                      className="bg-gradient-to-r from-orange-500 to-amber-500"
                    >
                      Explorer les vidéos
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6 space-y-6">
            {/* Community Profile Card */}
            <Card className="border-2 border-orange-200 bg-gradient-to-br from-white to-orange-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  Mon Profil Communautaire
                </CardTitle>
                <CardDescription>
                  Personnalisez votre profil pour vous présenter à la communauté TYKA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Ajoutez vos domaines d'expertise, vos centres d'intérêt, vos projets en cours et vos liens professionnels pour mieux vous faire connaître dans la communauté.
                </p>
                <Button
                  onClick={() => navigate("/profil/communaute")}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:opacity-90"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier mon profil communautaire
                </Button>
              </CardContent>
            </Card>

            {/* Privacy Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-500" />
                  Paramètres de Confidentialité
                </CardTitle>
                <CardDescription>
                  Gérez la visibilité de vos informations personnelles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                    <Badge variant={member.privacySettings?.showEmail ? "default" : "secondary"}>
                      {member.privacySettings?.showEmail ? "Visible" : "Masqué"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Téléphone</p>
                      <p className="text-sm text-gray-600">{member.phone || "Non renseigné"}</p>
                    </div>
                    <Badge variant={member.privacySettings?.showPhone ? "default" : "secondary"}>
                      {member.privacySettings?.showPhone ? "Visible" : "Masqué"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">WhatsApp</p>
                      <p className="text-sm text-gray-600">{member.whatsapp || "Non renseigné"}</p>
                    </div>
                    <Badge variant={member.privacySettings?.showWhatsApp ? "default" : "secondary"}>
                      {member.privacySettings?.showWhatsApp ? "Visible" : "Masqué"}
                    </Badge>
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      onClick={() => navigate("/profil/modifier")}
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500"
                    >
                      Modifier les paramètres
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ambassador Code */}
            {member.ambassadorCode && (
              <Card className="mt-6 border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-700">
                    <Award className="w-5 h-5" />
                    Code Ambassadeur
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center p-6 bg-white rounded-lg border-2 border-amber-300">
                    <p className="text-sm text-gray-600 mb-2">Votre code ambassadeur</p>
                    <p className="text-3xl font-bold text-amber-600 tracking-wider">{member.ambassadorCode}</p>
                    <p className="text-xs text-gray-500 mt-2">Partagez ce code pour inviter de nouveaux membres</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Publish Announcement Modal */}
      {showPublishAnn && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Megaphone className="w-5 h-5 text-[#1B2A4A]" />Publier une annonce</h2>
              <button onClick={() => setShowPublishAnn(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={e => {
              e.preventDefault();
              if (!member || !annForm.title.trim() || !annForm.description.trim()) return;
              addAnnouncement({ authorId: member.id, authorName: `${member.firstName} ${member.lastName}`, authorAvatar: (member as any).profilePhoto, ...annForm });
              setShowPublishAnn(false);
              setAnnForm({ category: "question", title: "", description: "", location: "", deadline: "", contact: "" });
              toast.success("Annonce soumise pour validation !");
            }} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    ["question", "Question", HelpCircle],
                    ["opportunity", "Opportunité", Briefcase],
                    ["assistance", "Assistance", HandHelping],
                    ["information", "Information", Megaphone],
                  ] as [Announcement["category"], string, any][]).map(([key, label, Icon]) => (
                    <button key={key} type="button" onClick={() => setAnnForm(p => ({ ...p, category: key }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${annForm.category === key ? "border-[#1B2A4A] bg-[#1B2A4A]/5 text-[#1B2A4A]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                      <Icon className="w-4 h-4" />{label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Titre *</label>
                <input value={annForm.title} onChange={e => setAnnForm(p => ({ ...p, title: e.target.value }))} required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/30 focus:border-[#1B2A4A]" placeholder="Titre de votre annonce" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
                <textarea value={annForm.description} onChange={e => setAnnForm(p => ({ ...p, description: e.target.value }))} required rows={4}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/30 focus:border-[#1B2A4A] resize-none" placeholder="Décrivez votre annonce..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Lieu</label>
                  <input value={annForm.location} onChange={e => setAnnForm(p => ({ ...p, location: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/30" placeholder="Paris, Remote..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date limite</label>
                  <input type="date" value={annForm.deadline} onChange={e => setAnnForm(p => ({ ...p, deadline: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/30" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact</label>
                <input value={annForm.contact} onChange={e => setAnnForm(p => ({ ...p, contact: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B2A4A]/30" placeholder="email ou téléphone" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPublishAnn(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">Annuler</button>
                <button type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#1B2A4A] text-white rounded-xl text-sm font-medium hover:bg-[#1B2A4A]/90 transition-colors">Soumettre</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}