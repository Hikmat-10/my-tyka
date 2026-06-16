// Central data service for managing all platform data
import { type Video } from "../components/VideoCard";

export type { Video } from "../components/VideoCard";

export interface Podcast {
  id: string;
  title: string;
  speaker: string;
  duration: string;
  thumbnail: string;
  audioUrl: string;
  pdfUrl?: string;
  category: string;
  description?: string;
  publishedAt: string;
}

export interface Partner {
  name: string;
  logo?: string;
  partnershipType: "propulsée" | "partenariat" | "soutenue" | "parrainée";
  slogan?: string;
  sector?: string;
  description?: string;
  institutionalPresentation?: string;
  role?: string;
  productsServices?: string;
  website?: string;
  socialMedia?: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
  };
}

export interface Cohorte {
  id: string;
  title: string;
  domain: string;
  modality: "online" | "presential" | "hybrid";
  price: number;
  currency: string;
  participants: number;
  maxParticipants?: number;
  location?: string;
  deadline: string;
  description: string;
  createdAt: string;
  status?: "active" | "upcoming" | "completed";
  level?: "débutant" | "intermédiaire" | "avancé";
  coverImage?: string;
  duration?: string;
  partner?: Partner;
  objectives?: string;
  startDate?: string;
  endDate?: string;
  accessType?: "public" | "members" | "application" | "paid" | "free";
  proposedBy?: "TYKA" | "partner" | "member";
  proposedByMemberId?: string;
  proposedByMemberName?: string;
  additionalInfo?: string;
}

export interface Initiative {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate?: string;
  location: string;
  modality: "online" | "in-person" | "hybrid";
  organizer: string;
  organizerId: string;
  status: "draft" | "pending" | "in-review" | "approved" | "rejected" | "business-dev-contact";
  createdAt: string;
  image?: string;
  statusHistory?: StatusHistoryEntry[];
  // Enhanced fields
  objectives?: string[];
  targetAudience?: string;
  participationModalities?: string;
  partners?: string[];
  activityStatus?: "upcoming" | "ongoing" | "completed";
  actionType?: "participate" | "register" | "learn-more" | "access";
  time?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  price?: number;
  currency?: string;
  coverImage?: string;
  tags?: string[];
}

export interface StatusHistoryEntry {
  id: string;
  status: "draft" | "pending" | "in-review" | "approved" | "rejected" | "business-dev-contact";
  changedBy: string;
  changedByRole: string;
  timestamp: string;
  comment?: string;
}

export interface ActivityLog {
  id: string;
  memberId: string;
  type: "video_watched" | "initiative_created" | "cohort_joined" | "profile_updated";
  title: string;
  description: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  memberId: string;
  type: "initiative_approved" | "initiative_rejected" | "initiative_in_review" | "general" | "announcement_reply" | "announcement_validated" | "new_announcement";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedId?: string;
}

export interface AnnouncementReply {
  id: string;
  announcementId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  category: "question" | "opportunity" | "assistance" | "information";
  title: string;
  description: string;
  image?: string;
  location?: string;
  deadline?: string;
  contact?: string;
  status: "pending" | "active" | "rejected" | "suspended" | "featured";
  createdAt: string;
  views: number;
  replies: AnnouncementReply[];
}

// Announcement Management
export function getAnnouncements(): Announcement[] {
  const data = localStorage.getItem("tykaAnnouncements");
  return data ? JSON.parse(data) : [];
}

export function saveAnnouncements(announcements: Announcement[]): void {
  localStorage.setItem("tykaAnnouncements", JSON.stringify(announcements));
}

export function addAnnouncement(announcement: Omit<Announcement, "id" | "createdAt" | "views" | "replies" | "status">): Announcement {
  const announcements = getAnnouncements();
  const newAnn: Announcement = {
    ...announcement,
    id: `ann_${Date.now()}`,
    status: "pending",
    createdAt: new Date().toISOString(),
    views: 0,
    replies: [],
  };
  announcements.unshift(newAnn);
  saveAnnouncements(announcements);
  // Notify admins
  addNotificationForAdmins("new_announcement", "Nouvelle annonce à valider", `Une annonce "${newAnn.title}" a été soumise.`, newAnn.id);
  return newAnn;
}

export function updateAnnouncement(id: string, updates: Partial<Announcement>): void {
  const announcements = getAnnouncements();
  const idx = announcements.findIndex(a => a.id === id);
  if (idx !== -1) {
    announcements[idx] = { ...announcements[idx], ...updates };
    saveAnnouncements(announcements);
  }
}

export function deleteAnnouncement(id: string): void {
  const announcements = getAnnouncements().filter(a => a.id !== id);
  saveAnnouncements(announcements);
}

export function addReplyToAnnouncement(announcementId: string, reply: Omit<AnnouncementReply, "id" | "createdAt">): void {
  const announcements = getAnnouncements();
  const idx = announcements.findIndex(a => a.id === announcementId);
  if (idx !== -1) {
    const newReply: AnnouncementReply = { ...reply, id: `rep_${Date.now()}`, createdAt: new Date().toISOString() };
    announcements[idx].replies = [...(announcements[idx].replies || []), newReply];
    saveAnnouncements(announcements);
    // Notify author
    addNotification({ memberId: announcements[idx].authorId, type: "announcement_reply", title: "Réponse à votre annonce", message: `${reply.authorName} a répondu à votre annonce "${announcements[idx].title}".`, read: false, relatedId: announcementId });
  }
}

export function incrementAnnouncementViews(id: string): void {
  const announcements = getAnnouncements();
  const idx = announcements.findIndex(a => a.id === id);
  if (idx !== -1) {
    announcements[idx].views = (announcements[idx].views || 0) + 1;
    saveAnnouncements(announcements);
  }
}

function addNotificationForAdmins(type: Notification["type"], title: string, message: string, relatedId?: string): void {
  // Store admin notifications in a shared key
  const data = localStorage.getItem("tykaAdminNotifications");
  const notifs: Notification[] = data ? JSON.parse(data) : [];
  notifs.unshift({ id: `notif_${Date.now()}`, memberId: "admin", type, title, message, read: false, createdAt: new Date().toISOString(), relatedId });
  localStorage.setItem("tykaAdminNotifications", JSON.stringify(notifs));
}

export interface WatchedVideo {
  id: string;
  videoId: string;
  memberId: string;
  videoTitle: string;
  videoThumbnail: string;
  videoInstructor: string;
  videoDuration: string;
  watchedAt: string;
}

// Video Management
export function getVideos(): Video[] {
  const videosData = localStorage.getItem("tykaVideos");
  if (videosData) {
    return JSON.parse(videosData);
  }
  
  // Default videos if none exist
  const defaultVideos: Video[] = [
    {
      id: "1",
      title: "Introduction à l'entrepreneuriat social et solidaire",
      instructor: "Amina Diallo",
      duration: "42 min",
      thumbnail: "https://images.unsplash.com/photo-1762329389942-c721052cb5ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      type: "formation",
      category: "entrepreneuriat"
    },
    {
      id: "2",
      title: "Leadership participatif : nouvelles approches territoriales",
      instructor: "Marcus Chen",
      duration: "1h 15min",
      thumbnail: "https://images.unsplash.com/photo-1762968269894-1d7e1ce8894e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      type: "masterclass",
      category: "societe"
    },
    {
      id: "3",
      title: "Transformation digitale des organisations",
      instructor: "Sophie Laurent",
      duration: "38 min",
      thumbnail: "https://images.unsplash.com/photo-1774292476423-c3ee7ea107b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      type: "formation",
      category: "science"
    },
    {
      id: "4",
      title: "Témoignage : Construire une communauté apprenante",
      instructor: "Karim El-Mansouri",
      duration: "25 min",
      thumbnail: "https://images.unsplash.com/photo-1770027611269-24975dfa41aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      type: "témoignage",
      category: "culture"
    },
    {
      id: "5",
      title: "Stratégies d'innovation collaborative",
      instructor: "Elena Rodriguez",
      duration: "52 min",
      thumbnail: "https://images.unsplash.com/photo-1758873272412-7166447a94ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      type: "expertise",
      category: "entrepreneuriat"
    },
    {
      id: "6",
      title: "Gestion de projet agile en contexte communautaire",
      instructor: "Jean-Pierre Dubois",
      duration: "1h 05min",
      thumbnail: "https://images.unsplash.com/photo-1646579886135-068c73800308?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      type: "masterclass",
      category: "societe"
    },
    {
      id: "7",
      title: "Design thinking appliqué aux territoires",
      instructor: "Yuki Tanaka",
      duration: "48 min",
      thumbnail: "https://images.unsplash.com/photo-1762329389942-c721052cb5ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      type: "formation",
      category: "art"
    },
    {
      id: "8",
      title: "Communication interculturelle",
      instructor: "Fatima Ndiaye",
      duration: "35 min",
      thumbnail: "https://images.unsplash.com/photo-1770027611269-24975dfa41aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      type: "expertise",
      category: "culture"
    },
    {
      id: "9",
      title: "Écologie et développement durable",
      instructor: "Pierre Durand",
      duration: "55 min",
      thumbnail: "https://images.unsplash.com/photo-1774292476423-c3ee7ea107b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      type: "formation",
      category: "environnement"
    },
    {
      id: "10",
      title: "Politique participative et citoyenneté",
      instructor: "Léa Mbaye",
      duration: "1h 10min",
      thumbnail: "https://images.unsplash.com/photo-1758873272412-7166447a94ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      type: "masterclass",
      category: "politique"
    },
    {
      id: "11",
      title: "Intelligence artificielle et société",
      instructor: "David Kim",
      duration: "45 min",
      thumbnail: "https://images.unsplash.com/photo-1762968269894-1d7e1ce8894e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      type: "expertise",
      category: "recherche"
    }
  ];
  
  localStorage.setItem("tykaVideos", JSON.stringify(defaultVideos));
  return defaultVideos;
}

export function addVideo(video: Omit<Video, "id">): Video {
  const videos = getVideos();
  const newVideo: Video = {
    ...video,
    id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  videos.push(newVideo);
  localStorage.setItem("tykaVideos", JSON.stringify(videos));
  return newVideo;
}

export function updateVideo(id: string, updates: Partial<Video>): boolean {
  const videos = getVideos();
  const index = videos.findIndex(v => v.id === id);
  if (index === -1) return false;
  
  videos[index] = { ...videos[index], ...updates };
  localStorage.setItem("tykaVideos", JSON.stringify(videos));
  return true;
}

export function deleteVideo(id: string): boolean {
  const videos = getVideos();
  const filtered = videos.filter(v => v.id !== id);
  if (filtered.length === videos.length) return false;
  
  localStorage.setItem("tykaVideos", JSON.stringify(filtered));
  return true;
}

// Initiative Management
export function getInitiatives(): Initiative[] {
  const data = localStorage.getItem("tykaInitiatives");
  if (data) {
    return JSON.parse(data);
  }

  // Default initiatives if none exist
  const defaultInitiatives: Initiative[] = [
    {
      id: "init_1",
      title: "Atelier Design Thinking pour l'Innovation Sociale",
      description: "Un atelier interactif de 2 jours pour apprendre les méthodes du design thinking appliquées aux problématiques sociales et environnementales. Vous découvrirez comment identifier les besoins réels des utilisateurs, générer des idées innovantes et prototyper des solutions concrètes.",
      category: "Atelier pratique",
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Ouagadougou, Burkina Faso",
      modality: "hybrid",
      organizer: "Sarah Konaté",
      organizerId: "organizer_1",
      status: "approved",
      createdAt: new Date().toISOString(),
      objectives: [
        "Comprendre les principes fondamentaux du design thinking",
        "Maîtriser les outils d'empathie et de recherche utilisateur",
        "Développer des compétences en idéation créative et brainstorming",
        "Apprendre à prototyper rapidement des solutions innovantes",
        "Savoir tester et itérer sur vos idées avec les utilisateurs"
      ],
      targetAudience: "Entrepreneurs sociaux, étudiants, porteurs de projets innovants",
      participationModalities: "Inscription obligatoire. Places limitées à 25 participants. Prévoir un ordinateur portable.",
      partners: ["Institut Français", "SOL VERT"],
      activityStatus: "upcoming",
      actionType: "register",
      time: "9h00 - 17h00",
      maxParticipants: 25,
      currentParticipants: 12,
      price: 0,
      currency: "FCFA",
      coverImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=600&fit=crop&auto=format",
      tags: ["Innovation", "Design Thinking", "Entrepreneuriat Social"]
    },
    {
      id: "init_2",
      title: "Webinaire : Intelligence Artificielle et Éthique",
      description: "Une conférence en ligne animée par des experts internationaux sur les enjeux éthiques de l'intelligence artificielle. Nous aborderons les questions de biais algorithmiques, de protection des données personnelles, et de l'impact social de l'IA.",
      category: "Webinaire",
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      location: "",
      modality: "online",
      organizer: "Dr. Amadou Traoré",
      organizerId: "organizer_2",
      status: "approved",
      createdAt: new Date().toISOString(),
      objectives: [
        "Comprendre les défis éthiques posés par l'IA",
        "Identifier les biais dans les algorithmes",
        "Connaître les cadres réglementaires en matière d'IA",
        "Échanger sur les bonnes pratiques de développement responsable"
      ],
      targetAudience: "Développeurs, chercheurs, étudiants en informatique, professionnels de la tech",
      participationModalities: "Inscription gratuite. Lien Zoom envoyé 24h avant l'événement.",
      partners: ["World Vision"],
      activityStatus: "upcoming",
      actionType: "participate",
      time: "18h00 - 20h00",
      maxParticipants: 100,
      currentParticipants: 67,
      price: 0,
      currency: "FCFA",
      coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop&auto=format",
      tags: ["IA", "Éthique", "Technologie"]
    },
    {
      id: "init_3",
      title: "Festival des Cultures Africaines",
      description: "Un festival de 3 jours célébrant la richesse et la diversité des cultures africaines à travers la musique, la danse, l'art contemporain, la gastronomie et le cinéma. Venez découvrir des artistes émergents et confirmés, participer à des ateliers créatifs, et déguster des spécialités culinaires de toute l'Afrique.",
      category: "Activité culturelle",
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Place de la Nation, Ouagadougou",
      modality: "in-person",
      organizer: "Collectif Sankofa",
      organizerId: "organizer_3",
      status: "approved",
      createdAt: new Date().toISOString(),
      objectives: [
        "Promouvoir la diversité culturelle africaine",
        "Créer un espace de rencontre et d'échange interculturel",
        "Soutenir les artistes locaux et émergents",
        "Sensibiliser à la préservation du patrimoine culturel"
      ],
      targetAudience: "Tout public, familles, amateurs d'art et de culture",
      participationModalities: "Entrée libre et gratuite. Programme complet disponible sur notre site web.",
      partners: ["SONABEL", "Institut Français"],
      activityStatus: "upcoming",
      actionType: "learn-more",
      time: "10h00 - 22h00",
      price: 0,
      currency: "FCFA",
      coverImage: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&h=600&fit=crop&auto=format",
      tags: ["Culture", "Art", "Musique", "Festival"]
    }
  ];

  localStorage.setItem("tykaInitiatives", JSON.stringify(defaultInitiatives));
  return defaultInitiatives;
}

export function addInitiative(initiative: Omit<Initiative, "id" | "createdAt">): Initiative {
  const initiatives = getInitiatives();
  const newInitiative: Initiative = {
    ...initiative,
    id: `initiative_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  initiatives.push(newInitiative);
  localStorage.setItem("tykaInitiatives", JSON.stringify(initiatives));
  return newInitiative;
}

export function updateInitiative(id: string, updates: Partial<Initiative>): boolean {
  const initiatives = getInitiatives();
  const index = initiatives.findIndex(i => i.id === id);
  if (index === -1) return false;
  
  initiatives[index] = { ...initiatives[index], ...updates };
  localStorage.setItem("tykaInitiatives", JSON.stringify(initiatives));
  return true;
}

// Update initiative status with history tracking and notification
export function updateInitiativeStatus(
  initiativeId: string,
  newStatus: Initiative["status"],
  changedBy: string,
  changedByRole: string,
  comment?: string
): boolean {
  const initiatives = getInitiatives();
  const index = initiatives.findIndex(i => i.id === initiativeId);
  if (index === -1) return false;

  const initiative = initiatives[index];
  
  // Add to status history
  const statusHistory = initiative.statusHistory || [];
  const historyEntry: StatusHistoryEntry = {
    id: `history_${Date.now()}`,
    status: newStatus,
    changedBy,
    changedByRole,
    timestamp: new Date().toISOString(),
    comment,
  };
  statusHistory.push(historyEntry);

  // Update initiative
  initiatives[index] = {
    ...initiative,
    status: newStatus,
    statusHistory,
  };

  localStorage.setItem("tykaInitiatives", JSON.stringify(initiatives));

  // Send notification to member if initiative is approved
  if (newStatus === "approved" && initiative.organizerId) {
    addActivity({
      memberId: initiative.organizerId,
      type: "initiative_created",
      title: "Votre initiative a été validée",
      description: `Votre initiative a été validée.\n\nVotre proposition a été examinée avec succès. Un Business Developer de TYKA prendra contact avec vous pour la suite de l'accompagnement.\n\nVous pouvez également écrire directement à ce numéro pour le suivi de votre initiative :\n\n+226 77 57 96 44`,
    });
  }

  return true;
}

// Activity Log Management
export function getActivities(memberId: string): ActivityLog[] {
  const data = localStorage.getItem(`tykaActivities_${memberId}`);
  return data ? JSON.parse(data) : [];
}

export function addActivity(activity: Omit<ActivityLog, "id" | "timestamp">): ActivityLog {
  const activities = getActivities(activity.memberId);
  const newActivity: ActivityLog = {
    ...activity,
    id: `activity_${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  activities.unshift(newActivity); // Add to beginning
  localStorage.setItem(`tykaActivities_${activity.memberId}`, JSON.stringify(activities));
  return newActivity;
}

// Notification Management
export function getNotifications(memberId: string): Notification[] {
  const data = localStorage.getItem(`tykaNotifications_${memberId}`);
  return data ? JSON.parse(data) : [];
}

export function addNotification(notification: Omit<Notification, "id" | "createdAt">): Notification {
  const notifications = getNotifications(notification.memberId);
  const newNotification: Notification = {
    ...notification,
    id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(newNotification); // Add to beginning
  localStorage.setItem(`tykaNotifications_${notification.memberId}`, JSON.stringify(notifications));
  return newNotification;
}

export function markNotificationAsRead(memberId: string, notificationId: string): boolean {
  const notifications = getNotifications(memberId);
  const index = notifications.findIndex(n => n.id === notificationId);
  if (index === -1) return false;

  notifications[index] = { ...notifications[index], read: true };
  localStorage.setItem(`tykaNotifications_${memberId}`, JSON.stringify(notifications));
  return true;
}

export function markAllNotificationsAsRead(memberId: string): boolean {
  const notifications = getNotifications(memberId);
  const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
  localStorage.setItem(`tykaNotifications_${memberId}`, JSON.stringify(updatedNotifications));
  return true;
}

export function deleteNotification(memberId: string, notificationId: string): boolean {
  const notifications = getNotifications(memberId);
  const filtered = notifications.filter(n => n.id !== notificationId);
  if (filtered.length === notifications.length) return false;

  localStorage.setItem(`tykaNotifications_${memberId}`, JSON.stringify(filtered));
  return true;
}

export function getUnreadNotificationsCount(memberId: string): number {
  const notifications = getNotifications(memberId);
  return notifications.filter(n => !n.read).length;
}

// Alias for compatibility
export const getUnreadNotificationCount = getUnreadNotificationsCount;

// Get all members for trombinoscope
export function getAllMembers() {
  const membersData = localStorage.getItem("tykaMembers");
  return membersData ? JSON.parse(membersData) : [];
}

// Get members with validation status filter
export function getMembersByStatus(status?: "pending_validation" | "active" | "rejected") {
  const members = getAllMembers();
  if (!status) return members;
  return members.filter((m: any) => (m.validationStatus || "active") === status);
}

// Validate a member (for Ambassador Admin)
export function validateMember(memberId: string, status: "active" | "rejected") {
  const members = getAllMembers();
  const updatedMembers = members.map((member: any) => {
    if (member.id === memberId) {
      return {
        ...member,
        validationStatus: status,
        validatedAt: new Date().toISOString(),
        visibleInTrombinoscope: status === "active"
      };
    }
    return member;
  });
  
  localStorage.setItem("tykaMembers", JSON.stringify(updatedMembers));
  
  // Synchronize with ambassadors database
  const ambassadorsData = localStorage.getItem("tykaAmbassadors");
  const ambassadors = ambassadorsData ? JSON.parse(ambassadorsData) : [];
  const updatedAmbassadors = ambassadors.map((ambassador: any) => {
    if (ambassador.id === memberId) {
      return {
        ...ambassador,
        validationStatus: status,
        validatedAt: new Date().toISOString()
      };
    }
    return ambassador;
  });
  localStorage.setItem("tykaAmbassadors", JSON.stringify(updatedAmbassadors));
  
  // Update current member in session if they are logged in
  const currentMemberData = localStorage.getItem("tykaMember");
  if (currentMemberData) {
    const currentMember = JSON.parse(currentMemberData);
    if (currentMember.id === memberId) {
      const updatedCurrentMember = {
        ...currentMember,
        validationStatus: status,
        validatedAt: new Date().toISOString(),
        visibleInTrombinoscope: status === "active"
      };
      localStorage.setItem("tykaMember", JSON.stringify(updatedCurrentMember));
    }
  }
  
  // Dispatch event for real-time updates
  window.dispatchEvent(new Event('tykaMemberValidated'));
  
  return status === "active";
}

// Update member fields
export function updateMember(memberId: string, updates: Record<string, any>) {
  const members = getAllMembers();
  const updatedMembers = members.map((member: any) => {
    if (member.id === memberId) return { ...member, ...updates, updatedAt: new Date().toISOString() };
    return member;
  });
  localStorage.setItem("tykaMembers", JSON.stringify(updatedMembers));
  window.dispatchEvent(new Event("tykaMemberValidated"));
  return true;
}

// Delete member
export function deleteMember(memberId: string) {
  const members = getAllMembers();
  localStorage.setItem("tykaMembers", JSON.stringify(members.filter((m: any) => m.id !== memberId)));
  window.dispatchEvent(new Event("tykaMemberValidated"));
  return true;
}

// Subscribe to data changes (for real-time sync simulation)
export function subscribeToVideos(callback: (videos: Video[]) => void) {
  // Listen for storage changes
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === "tykaVideos") {
      callback(getVideos());
    }
  };
  
  window.addEventListener("storage", handleStorageChange);
  
  // Return unsubscribe function
  return () => window.removeEventListener("storage", handleStorageChange);
}

// Watched Videos Management
export function getWatchedVideos(memberId: string): WatchedVideo[] {
  const data = localStorage.getItem(`tykaWatchedVideos_${memberId}`);
  return data ? JSON.parse(data) : [];
}

export function addWatchedVideo(memberId: string, video: Video): WatchedVideo {
  const watchedVideos = getWatchedVideos(memberId);
  
  // Check if video was already watched
  const existingIndex = watchedVideos.findIndex(w => w.videoId === video.id);
  
  const watchedVideo: WatchedVideo = {
    id: `watched_${Date.now()}`,
    videoId: video.id,
    memberId,
    videoTitle: video.title,
    videoThumbnail: video.thumbnail,
    videoInstructor: video.instructor,
    videoDuration: video.duration,
    watchedAt: new Date().toISOString(),
  };
  
  if (existingIndex !== -1) {
    // Update watch time
    watchedVideos[existingIndex] = watchedVideo;
  } else {
    // Add new watched video
    watchedVideos.unshift(watchedVideo);
  }
  
  localStorage.setItem(`tykaWatchedVideos_${memberId}`, JSON.stringify(watchedVideos));
  
  // Also add to activity log
  addActivity({
    memberId,
    type: "video_watched",
    title: video.title,
    description: `Vidéo regardée : ${video.title} par ${video.instructor}`,
  });
  
  return watchedVideo;
}

// Get member statistics
export function getMemberStats(memberId: string) {
  const watchedVideos = getWatchedVideos(memberId);
  
  // Get cohort enrollments with new key format
  const storageKey = `tykaCohortEnrollments_${memberId}`;
  const memberEnrollments = JSON.parse(localStorage.getItem(storageKey) || "[]");
  
  const activities = getActivities(memberId);
  
  return {
    totalVideosWatched: watchedVideos.length,
    totalCohortsJoined: memberEnrollments.length,
    totalActivities: activities.length,
    lastActivity: activities[0]?.timestamp || null,
  };
}

// Podcast Management
export function getPodcasts(): Podcast[] {
  const podcastsData = localStorage.getItem("tykaPodcasts");
  if (podcastsData) {
    return JSON.parse(podcastsData);
  }

  // Default podcasts if none exist
  const defaultPodcasts: Podcast[] = [
    {
      id: "1",
      title: "L'entrepreneuriat social en Afrique",
      speaker: "Aminata Touré",
      duration: "32 min",
      thumbnail: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      audioUrl: "https://example.com/podcast1.mp3",
      category: "entrepreneuriat",
      description: "Discussion sur les défis et opportunités de l'entrepreneuriat social en Afrique",
      publishedAt: new Date().toISOString()
    },
    {
      id: "2",
      title: "Leadership et transformation",
      speaker: "Omar Sy",
      duration: "45 min",
      thumbnail: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
      audioUrl: "https://example.com/podcast2.mp3",
      pdfUrl: "https://example.com/transcript2.pdf",
      category: "societe",
      description: "Échange sur les nouvelles formes de leadership",
      publishedAt: new Date().toISOString()
    }
  ];

  localStorage.setItem("tykaPodcasts", JSON.stringify(defaultPodcasts));
  return defaultPodcasts;
}

export function addPodcast(podcast: Omit<Podcast, "id" | "publishedAt">): Podcast {
  const podcasts = getPodcasts();
  const newPodcast: Podcast = {
    ...podcast,
    id: `podcast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    publishedAt: new Date().toISOString(),
  };
  podcasts.push(newPodcast);
  localStorage.setItem("tykaPodcasts", JSON.stringify(podcasts));
  return newPodcast;
}

export function updatePodcast(id: string, updates: Partial<Podcast>): boolean {
  const podcasts = getPodcasts();
  const index = podcasts.findIndex(p => p.id === id);
  if (index === -1) return false;

  podcasts[index] = { ...podcasts[index], ...updates };
  localStorage.setItem("tykaPodcasts", JSON.stringify(podcasts));
  return true;
}

export function deletePodcast(id: string): boolean {
  const podcasts = getPodcasts();
  const filtered = podcasts.filter(p => p.id !== id);
  if (filtered.length === podcasts.length) return false;

  localStorage.setItem("tykaPodcasts", JSON.stringify(filtered));
  return true;
}

// Subscribe to podcast changes
export function subscribeToPodcasts(callback: (podcasts: Podcast[]) => void) {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === "tykaPodcasts") {
      callback(getPodcasts());
    }
  };

  window.addEventListener("storage", handleStorageChange);
  return () => window.removeEventListener("storage", handleStorageChange);
}

// Cohorte Management
export function getCohortes(): Cohorte[] {
  const cohortesData = localStorage.getItem("tykaCohortes");
  if (cohortesData) {
    const parsed: Cohorte[] = JSON.parse(cohortesData);
    // Migrate if existing data lacks new fields
    if (parsed.length > 0 && !parsed[0].status) {
      localStorage.removeItem("tykaCohortes");
    } else {
      return parsed;
    }
  }

  const defaultCohortes: Cohorte[] = [
    {
      id: "1",
      title: "Leadership Transformationnel en Afrique",
      domain: "Leadership",
      modality: "hybrid",
      price: 15000,
      currency: "FCFA",
      participants: 24,
      maxParticipants: 30,
      location: "Dakar, Sénégal",
      deadline: "15 Août 2026",
      description: "Développez votre capacité à inspirer et mobiliser les équipes autour d'une vision commune. Formation pratique avec études de cas réels issus du contexte africain.",
      createdAt: new Date().toISOString(),
      status: "active",
      level: "intermédiaire",
      duration: "8 semaines",
      coverImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop&auto=format",
      objectives: "Maîtriser les fondamentaux du leadership transformationnel, développer son intelligence émotionnelle, construire une vision stratégique",
      startDate: "2026-06-15",
      endDate: "2026-08-10",
      accessType: "members",
      partner: {
        name: "SOL VERT",
        partnershipType: "propulsée",
        slogan: "Énergiser les territoires, transformer les communautés",
        sector: "Énergie renouvelable & Développement durable",
        description: "SOL VERT est une organisation pionnière dans le développement des énergies renouvelables en Afrique de l'Ouest, engagée pour un avenir durable.",
        institutionalPresentation: "Fondée en 2015 à Ouagadougou, SOL VERT accompagne les communautés rurales et urbaines dans leur transition énergétique. Avec plus de 200 projets réalisés, l'organisation est aujourd'hui présente dans 8 pays africains.",
        role: "SOL VERT co-finance et co-anime cette cohorte pour former les futurs leaders du développement durable et de la transition énergétique africaine.",
        productsServices: "Solutions solaires off-grid, formation en énergies renouvelables, consulting en durabilité environnementale, financement de projets verts",
        website: "https://solvert.org",
        socialMedia: { linkedin: "solvert-afrique", facebook: "solvert.org", twitter: "SolVertAfrique" }
      }
    },
    {
      id: "2",
      title: "Entrepreneuriat Social et Impact",
      domain: "Entrepreneuriat",
      modality: "online",
      price: 12000,
      currency: "FCFA",
      participants: 32,
      maxParticipants: 50,
      location: "En ligne",
      deadline: "30 Août 2026",
      description: "Créez un modèle économique viable tout en générant un impact social positif. Accompagnement personnalisé par des mentors expérimentés.",
      createdAt: new Date().toISOString(),
      status: "active",
      level: "débutant",
      duration: "10 semaines",
      coverImage: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=400&fit=crop&auto=format",
      objectives: "Concevoir un modèle d'impact, structurer son offre sociale, mobiliser des ressources, mesurer son impact",
      startDate: "2026-06-20",
      endDate: "2026-08-29",
      accessType: "members",
      partner: {
        name: "SONABEL",
        partnershipType: "partenariat",
        slogan: "L'énergie au service du développement",
        sector: "Énergie & Utilities",
        description: "SONABEL est la société nationale d'électricité du Burkina Faso, acteur majeur du développement énergétique au Sahel.",
        institutionalPresentation: "Créée en 1954, SONABEL assure la production, le transport et la distribution d'électricité sur l'ensemble du territoire burkinabè. Elle est engagée dans des initiatives de formation et d'innovation pour préparer les jeunes aux défis énergétiques de demain.",
        role: "SONABEL soutient cette cohorte en apportant son expertise sectorielle, des témoignages de terrain et des opportunités de stage pour les meilleurs participants.",
        productsServices: "Production et distribution d'électricité, formation technique, partenariats institutionnels",
        website: "https://sonabel.bf",
        socialMedia: { linkedin: "sonabel", facebook: "SONABEL.officiel" }
      }
    },
    {
      id: "3",
      title: "Design Thinking & Innovation Territoriale",
      domain: "Innovation",
      modality: "presential",
      price: 18000,
      currency: "FCFA",
      participants: 18,
      maxParticipants: 20,
      location: "Abidjan, Côte d'Ivoire",
      deadline: "20 Septembre 2026",
      description: "Maîtrisez la méthodologie du design thinking pour résoudre des problèmes complexes de manière créative et centrée sur les besoins des communautés.",
      createdAt: new Date().toISOString(),
      status: "upcoming",
      level: "intermédiaire",
      duration: "5 jours intensifs",
      coverImage: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&h=400&fit=crop&auto=format",
      objectives: "Appliquer les 5 étapes du design thinking, prototyper des solutions locales, tester et itérer avec les communautés",
      startDate: "2026-09-14",
      endDate: "2026-09-18",
      accessType: "application",
      partner: {
        name: "World Vision",
        partnershipType: "soutenue",
        slogan: "Notre vision : un monde où chaque enfant et chaque famille s'épanouit",
        sector: "Humanitaire & Développement",
        description: "World Vision est une organisation humanitaire chrétienne internationale dédiée à l'amélioration des conditions de vie des enfants et familles vulnérables.",
        institutionalPresentation: "Présente dans plus de 100 pays, World Vision intervient dans les secteurs de l'éducation, la santé, la sécurité alimentaire et la protection de l'enfance. En Côte d'Ivoire, l'organisation accompagne des centaines de communautés rurales.",
        role: "World Vision apporte son expertise terrain dans la conception de solutions adaptées aux réalités locales et ouvre ses communautés partenaires comme terrains d'expérimentation.",
        productsServices: "Programmes de développement communautaire, aide humanitaire d'urgence, plaidoyer international",
        website: "https://worldvision.org",
        socialMedia: { linkedin: "world-vision-international", facebook: "worldvision", twitter: "WorldVision" }
      }
    },
    {
      id: "4",
      title: "Data Science pour Débutants",
      domain: "Technologie",
      modality: "online",
      price: 10000,
      currency: "FCFA",
      participants: 45,
      maxParticipants: 60,
      location: "En ligne",
      deadline: "15 Juillet 2026",
      description: "Introduction pratique à la data science : Python, analyse de données, visualisation. Aucun prérequis technique nécessaire, juste de la curiosité.",
      createdAt: new Date().toISOString(),
      status: "active",
      level: "débutant",
      duration: "12 semaines",
      coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&auto=format",
      objectives: "Maîtriser Python pour la data, réaliser des analyses exploratoires, créer des visualisations percutantes, comprendre le machine learning de base",
      startDate: "2026-04-15",
      endDate: "2026-07-08",
      accessType: "public"
    },
    {
      id: "5",
      title: "Communication Interculturelle & Diplomatie",
      domain: "Communication",
      modality: "hybrid",
      price: 0,
      currency: "FCFA",
      participants: 35,
      maxParticipants: 35,
      location: "Paris, France",
      deadline: "Terminée",
      description: "Développez vos compétences pour communiquer efficacement dans des environnements multiculturels. Une formation qui a transformé 35 professionnels africains.",
      createdAt: new Date().toISOString(),
      status: "completed",
      level: "avancé",
      duration: "6 semaines",
      coverImage: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=400&fit=crop&auto=format",
      objectives: "Naviguer dans la diversité culturelle, maîtriser la communication non-verbale interculturelle, développer son intelligence culturelle (CQ)",
      startDate: "2026-01-10",
      endDate: "2026-02-21",
      accessType: "members",
      partner: {
        name: "Institut Français",
        partnershipType: "parrainée",
        slogan: "La culture en partage",
        sector: "Culture & Diplomatie",
        description: "L'Institut Français est l'opérateur public pour l'action culturelle extérieure de la France, présent dans plus de 100 pays.",
        institutionalPresentation: "L'Institut Français accompagne les échanges culturels, artistiques et linguistiques entre la France et le monde. En Afrique, il soutient des programmes de formation et de mobilité pour les professionnels de la culture.",
        role: "L'Institut Français a parrainé cette cohorte en offrant ses espaces, ses ressources pédagogiques et l'accès à son réseau international.",
        productsServices: "Cours de langue, résidences artistiques, échanges culturels, bibliothèques, programmes de mobilité",
        website: "https://institutfrancais.com",
        socialMedia: { linkedin: "institutfrancais", facebook: "institutfrancais", twitter: "institutfrancais" }
      }
    },
    {
      id: "6",
      title: "Gestion de Projet Agile & Scrum",
      domain: "Management",
      modality: "online",
      price: 14000,
      currency: "FCFA",
      participants: 12,
      maxParticipants: 40,
      location: "En ligne",
      deadline: "1 Octobre 2026",
      description: "Certification Scrum Master incluse. Apprenez à piloter des projets avec les méthodologies agiles les plus efficaces du marché.",
      createdAt: new Date().toISOString(),
      status: "upcoming",
      level: "intermédiaire",
      duration: "8 semaines",
      coverImage: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&h=400&fit=crop&auto=format",
      objectives: "Obtenir la certification Scrum Master, animer des sprints, faciliter des rétrospectives, implémenter Agile dans son organisation",
      startDate: "2026-09-28",
      endDate: "2026-11-22",
      accessType: "members"
    }
  ];

  localStorage.setItem("tykaCohortes", JSON.stringify(defaultCohortes));
  return defaultCohortes;
}

export function addCohorte(cohorte: Omit<Cohorte, "id" | "createdAt" | "participants">): Cohorte {
  const cohortes = getCohortes();
  const newCohorte: Cohorte = {
    ...cohorte,
    id: `cohorte_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    participants: 0,
    createdAt: new Date().toISOString(),
  };
  cohortes.push(newCohorte);
  localStorage.setItem("tykaCohortes", JSON.stringify(cohortes));

  // Dispatch event for real-time sync
  window.dispatchEvent(new Event('tykaCohorteAdded'));

  return newCohorte;
}

export function updateCohorte(id: string, updates: Partial<Cohorte>): boolean {
  const cohortes = getCohortes();
  const index = cohortes.findIndex(c => c.id === id);
  if (index === -1) return false;

  cohortes[index] = { ...cohortes[index], ...updates };
  localStorage.setItem("tykaCohortes", JSON.stringify(cohortes));

  // Dispatch event for real-time sync
  window.dispatchEvent(new Event('tykaCohorteUpdated'));

  return true;
}

export function deleteCohorte(id: string): boolean {
  const cohortes = getCohortes();
  const filtered = cohortes.filter(c => c.id !== id);
  if (filtered.length === cohortes.length) return false;

  localStorage.setItem("tykaCohortes", JSON.stringify(filtered));

  // Dispatch event for real-time sync
  window.dispatchEvent(new Event('tykaCohorteDeleted'));

  return true;
}

// Subscribe to cohorte changes
export function subscribeToCohortes(callback: (cohortes: Cohorte[]) => void) {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === "tykaCohortes") {
      callback(getCohortes());
    }
  };

  const handleCustomEvent = () => {
    callback(getCohortes());
  };

  window.addEventListener("storage", handleStorageChange);
  window.addEventListener("tykaCohorteAdded", handleCustomEvent);
  window.addEventListener("tykaCohorteUpdated", handleCustomEvent);
  window.addEventListener("tykaCohorteDeleted", handleCustomEvent);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener("tykaCohorteAdded", handleCustomEvent);
    window.removeEventListener("tykaCohorteUpdated", handleCustomEvent);
    window.removeEventListener("tykaCohorteDeleted", handleCustomEvent);
  };
}

// Payment Management for Cohort Enrollments
export interface CohortEnrollment {
  cohortId: string;
  cohortTitle: string;
  cohortDomain?: string;
  cohortModality?: string;
  price: number;
  currency: string;
  deadline?: string;
  enrolledAt: string;
  reservedAt?: string;
  paymentStatus: "pending_payment" | "payment_submitted" | "confirmed" | "expired";
  paymentSubmittedAt?: string;
  paymentValidatedAt?: string;
  status: "upcoming" | "active" | "completed";
  progress?: number;
  contactName?: string;
  contactWhatsApp?: string;
  lmsAccessLink?: string;
  memberId?: string;
  memberName?: string;
  memberEmail?: string;
}

// Get all pending payment submissions across all members
export function getAllPendingPayments(): CohortEnrollment[] {
  const members = getAllMembers();
  const pendingPayments: CohortEnrollment[] = [];

  members.forEach((member: any) => {
    const storageKey = `tykaCohortEnrollments_${member.id}`;
    const enrollments = JSON.parse(localStorage.getItem(storageKey) || "[]");

    enrollments.forEach((enrollment: CohortEnrollment) => {
      if (enrollment.paymentStatus === "payment_submitted") {
        pendingPayments.push({
          ...enrollment,
          memberId: member.id,
          memberName: `${member.firstName} ${member.lastName}`,
          memberEmail: member.email,
        });
      }
    });
  });

  return pendingPayments.sort((a, b) =>
    new Date(b.paymentSubmittedAt || 0).getTime() - new Date(a.paymentSubmittedAt || 0).getTime()
  );
}

// Validate payment and add LMS access link
export function validatePayment(
  memberId: string,
  cohortId: string,
  lmsAccessLink: string
): boolean {
  const storageKey = `tykaCohortEnrollments_${memberId}`;
  const enrollments = JSON.parse(localStorage.getItem(storageKey) || "[]");

  const updatedEnrollments = enrollments.map((e: CohortEnrollment) => {
    if (e.cohortId === cohortId && e.paymentStatus === "payment_submitted") {
      return {
        ...e,
        paymentStatus: "confirmed",
        paymentValidatedAt: new Date().toISOString(),
        lmsAccessLink,
        status: "active",
      };
    }
    return e;
  });

  localStorage.setItem(storageKey, JSON.stringify(updatedEnrollments));

  // Dispatch event for real-time updates
  window.dispatchEvent(new Event('tykaPaymentValidated'));

  return true;
}

// Get cohort enrollments for a specific member
export function getMemberCohortEnrollments(memberId: string): CohortEnrollment[] {
  const storageKey = `tykaCohortEnrollments_${memberId}`;
  return JSON.parse(localStorage.getItem(storageKey) || "[]");
}

// === NOUVELLES FONCTIONS POUR LA GESTION FINANCIÈRE ===

export interface ValidatedPayment {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  cohortId: string;
  cohortTitle: string;
  amount: number;
  currency: string;
  validatedAt: string;
  lmsAccessLink?: string;
}

// Get all validated payments
export function getAllValidatedPayments(): ValidatedPayment[] {
  const members = getAllMembers();
  const validatedPayments: ValidatedPayment[] = [];

  members.forEach((member: any) => {
    const storageKey = `tykaCohortEnrollments_${member.id}`;
    const enrollments = JSON.parse(localStorage.getItem(storageKey) || "[]");

    enrollments.forEach((enrollment: CohortEnrollment) => {
      if (enrollment.paymentStatus === "confirmed" && enrollment.paymentValidatedAt) {
        validatedPayments.push({
          id: `${member.id}_${enrollment.cohortId}`,
          memberId: member.id,
          memberName: `${member.firstName} ${member.lastName}`,
          memberEmail: member.email,
          cohortId: enrollment.cohortId,
          cohortTitle: enrollment.cohortTitle,
          amount: enrollment.price,
          currency: enrollment.currency,
          validatedAt: enrollment.paymentValidatedAt,
          lmsAccessLink: enrollment.lmsAccessLink,
        });
      }
    });
  });

  return validatedPayments.sort((a, b) =>
    new Date(b.validatedAt).getTime() - new Date(a.validatedAt).getTime()
  );
}

// Get financial statistics
export interface FinancialStats {
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  totalPayments: number;
  pendingPayments: number;
  averagePaymentAmount: number;
  revenueByMonth: { month: string; amount: number }[];
  revenueByCohort: { cohortId: string; cohortTitle: string; amount: number; count: number }[];
}

export function getFinancialStats(): FinancialStats {
  const validatedPayments = getAllValidatedPayments();
  const pendingPayments = getAllPendingPayments();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Total revenue
  const totalRevenue = validatedPayments.reduce((sum, p) => sum + p.amount, 0);

  // Monthly revenue (current month)
  const monthlyRevenue = validatedPayments
    .filter(p => {
      const date = new Date(p.validatedAt);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, p) => sum + p.amount, 0);

  // Yearly revenue (current year)
  const yearlyRevenue = validatedPayments
    .filter(p => new Date(p.validatedAt).getFullYear() === currentYear)
    .reduce((sum, p) => sum + p.amount, 0);

  // Average payment amount
  const averagePaymentAmount = validatedPayments.length > 0
    ? totalRevenue / validatedPayments.length
    : 0;

  // Revenue by month (last 12 months)
  const revenueByMonth: { month: string; amount: number }[] = [];
  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - i, 1);
    const month = date.getMonth();
    const year = date.getFullYear();

    const amount = validatedPayments
      .filter(p => {
        const pDate = new Date(p.validatedAt);
        return pDate.getMonth() === month && pDate.getFullYear() === year;
      })
      .reduce((sum, p) => sum + p.amount, 0);

    revenueByMonth.push({
      month: `${monthNames[month]} ${year}`,
      amount,
    });
  }

  // Revenue by cohort
  const cohortMap = new Map<string, { cohortTitle: string; amount: number; count: number }>();

  validatedPayments.forEach(p => {
    const existing = cohortMap.get(p.cohortId) || { cohortTitle: p.cohortTitle, amount: 0, count: 0 };
    cohortMap.set(p.cohortId, {
      cohortTitle: p.cohortTitle,
      amount: existing.amount + p.amount,
      count: existing.count + 1,
    });
  });

  const revenueByCohort = Array.from(cohortMap.entries()).map(([cohortId, data]) => ({
    cohortId,
    ...data,
  })).sort((a, b) => b.amount - a.amount);

  return {
    totalRevenue,
    monthlyRevenue,
    yearlyRevenue,
    totalPayments: validatedPayments.length,
    pendingPayments: pendingPayments.length,
    averagePaymentAmount,
    revenueByMonth,
    revenueByCohort,
  };
}

// Export financial data to CSV
export function exportFinancialDataToCSV(): string {
  const validatedPayments = getAllValidatedPayments();

  const headers = ['Date', 'Membre', 'Email', 'Cohorte', 'Montant', 'Devise', 'Lien LMS'];
  const rows = validatedPayments.map(p => [
    new Date(p.validatedAt).toLocaleDateString('fr-FR'),
    p.memberName,
    p.memberEmail,
    p.cohortTitle,
    p.amount.toString(),
    p.currency,
    p.lmsAccessLink || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}