// Supabase API Service for TYKA
import { projectId, publicAnonKey } from '/utils/supabase/info';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-6c74deb9`;

// Helper function to make API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API Request Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================
// HEALTH CHECK
// ============================================

export async function checkHealth() {
  return apiRequest('/health');
}

// ============================================
// MEMBERS API
// ============================================

export interface Member {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  whatsapp?: string;
  country: string;
  city?: string;
  bio?: string;
  interests?: string[];
  profileImage?: string;
  activity?: string;
  status: "member" | "ambassador_potential" | "ambassador_active";
  ambassadorCode?: string;
  joinedAt: string;
  emailConfirmed: boolean;
  validationStatus?: "pending_validation" | "active" | "rejected";
  visibleInTrombinoscope?: boolean;
  skills?: { name: string; level: number }[];
  privacySettings?: {
    showEmail: boolean;
    showWhatsApp: boolean;
    showPhone: boolean;
  };
}

export async function getAllMembers() {
  return apiRequest<Member[]>('/members');
}

export async function getMemberById(id: string) {
  return apiRequest<Member>(`/members/${id}`);
}

export async function createMember(memberData: Partial<Member>) {
  return apiRequest<Member>('/members', {
    method: 'POST',
    body: JSON.stringify(memberData),
  });
}

export async function updateMember(id: string, updates: Partial<Member>) {
  return apiRequest<Member>(`/members/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function validateMember(id: string, status: 'active' | 'rejected') {
  return apiRequest<Member>(`/members/${id}/validate`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
}

export async function login(email: string, password: string) {
  return apiRequest<Member>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// ============================================
// VIDEOS API
// ============================================

export interface Video {
  id: string;
  title: string;
  instructor: string;
  duration: string;
  thumbnail: string;
  type: string;
  category: string;
  createdAt?: string;
}

export async function getAllVideos() {
  return apiRequest<Video[]>('/videos');
}

export async function createVideo(videoData: Partial<Video>) {
  return apiRequest<Video>('/videos', {
    method: 'POST',
    body: JSON.stringify(videoData),
  });
}

export async function updateVideo(id: string, updates: Partial<Video>) {
  return apiRequest<Video>(`/videos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteVideo(id: string) {
  return apiRequest(`/videos/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// WATCHED VIDEOS API
// ============================================

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

export async function getWatchedVideos(memberId: string) {
  return apiRequest<WatchedVideo[]>(`/members/${memberId}/watched-videos`);
}

export async function addWatchedVideo(memberId: string, videoData: {
  videoId: string;
  videoTitle: string;
  videoThumbnail: string;
  videoInstructor: string;
  videoDuration: string;
}) {
  return apiRequest<WatchedVideo>(`/members/${memberId}/watched-videos`, {
    method: 'POST',
    body: JSON.stringify(videoData),
  });
}

// ============================================
// INITIATIVES API
// ============================================

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
  status: "draft" | "pending" | "approved" | "rejected";
  createdAt: string;
  image?: string;
}

export async function getAllInitiatives() {
  return apiRequest<Initiative[]>('/initiatives');
}

export async function createInitiative(initiativeData: Partial<Initiative>) {
  return apiRequest<Initiative>('/initiatives', {
    method: 'POST',
    body: JSON.stringify(initiativeData),
  });
}

export async function updateInitiative(id: string, updates: Partial<Initiative>) {
  return apiRequest<Initiative>(`/initiatives/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

// ============================================
// COHORTS API
// ============================================

export async function getAllCohorts() {
  return apiRequest('/cohorts');
}

export async function enrollInCohort(cohortId: string, memberId: string) {
  return apiRequest(`/cohorts/${cohortId}/enroll`, {
    method: 'POST',
    body: JSON.stringify({ memberId }),
  });
}

export async function getMemberEnrollments(memberId: string) {
  return apiRequest(`/members/${memberId}/enrollments`);
}

// ============================================
// ACTIVITIES API
// ============================================

export async function getMemberActivities(memberId: string) {
  return apiRequest(`/members/${memberId}/activities`);
}

// ============================================
// AMBASSADORS API
// ============================================

export async function getAllAmbassadors() {
  return apiRequest('/ambassadors');
}

// ============================================
// STATISTICS API
// ============================================

export interface MemberStats {
  totalVideosWatched: number;
  totalCohortsJoined: number;
  totalActivities: number;
  lastActivity: string | null;
}

export async function getMemberStats(memberId: string) {
  return apiRequest<MemberStats>(`/members/${memberId}/stats`);
}

// ============================================
// INITIALIZATION API
// ============================================

export async function initializeDefaultData() {
  return apiRequest('/init-default-data', {
    method: 'POST',
  });
}
