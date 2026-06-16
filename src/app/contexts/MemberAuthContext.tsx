import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "../../lib/supabase";

export interface Member {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  whatsapp?: string;
  country: string;
  city: string;
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

interface MemberAuthContextType {
  currentMember: Member | null;
  member: Member | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: Partial<Member>) => Promise<{ success: boolean; error?: string; member?: Member }>;
  logout: () => void;
  updateProfile: (data: Partial<Member>) => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  confirmEmail: (token: string) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
}

const defaultContextValue: MemberAuthContextType = {
  currentMember: null,
  member: null,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
  updateProfile: async () => ({ success: false }),
  requestPasswordReset: async () => ({ success: true }),
  confirmEmail: async () => ({ success: true }),
  isAuthenticated: false,
};

const MemberAuthContext = createContext<MemberAuthContextType>(defaultContextValue);

function generateAmbassadorCode(firstName: string, lastName: string): string {
  const prefix = (firstName.substring(0, 2) + lastName.substring(0, 2)).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${random}`;
}

export function MemberAuthProvider({ children }: { children: ReactNode }) {
  const [currentMember, setCurrentMember] = useState<Member | null>(null);

  useEffect(() => {
    const storedMember = localStorage.getItem("tykaMember");
    if (storedMember) {
      setCurrentMember(JSON.parse(storedMember));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // D'abord chercher dans Supabase
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (error || !data) {
      // Fallback localStorage
      const membersData = localStorage.getItem("tykaMembers");
      const members: Member[] = membersData ? JSON.parse(membersData) : [];
      const member = members.find(m => m.email === email && m.password === password);
      if (!member) return { success: false, error: "Email ou mot de passe incorrect" };
      if (member.validationStatus === "rejected") return { success: false, error: "Votre demande a été refusée." };
      if (member.validationStatus === "pending_validation") return { success: false, error: "Compte en attente de validation." };
      setCurrentMember(member);
      localStorage.setItem("tykaMember", JSON.stringify(member));
      return { success: true };
    }

    const member: Member = {
      id: data.id,
      email: data.email,
      password: data.password,
      firstName: data.first_name,
      lastName: data.last_name,
      phone: data.phone,
      whatsapp: data.whatsapp,
      country: data.country,
      city: data.city,
      bio: data.bio,
      interests: data.interests,
      profileImage: data.profile_image,
      activity: data.activity,
      status: data.status,
      ambassadorCode: data.ambassador_code,
      joinedAt: data.joined_at,
      emailConfirmed: data.email_confirmed,
      validationStatus: data.validation_status,
      visibleInTrombinoscope: data.visible_in_trombinoscope,
      skills: data.skills,
      privacySettings: data.privacy_settings,
    };

    if (member.validationStatus === "rejected") return { success: false, error: "Votre demande a été refusée." };
    if (member.validationStatus === "pending_validation") return { success: false, error: "Compte en attente de validation." };

    setCurrentMember(member);
    localStorage.setItem("tykaMember", JSON.stringify(member));
    return { success: true };
  };

  const register = async (data: Partial<Member>) => {
    if (!data.email || !data.password || !data.firstName || !data.lastName || !data.country) {
      return { success: false, error: "Veuillez remplir tous les champs obligatoires" };
    }

    const newMember = {
      id: `member_${Date.now()}`,
      email: data.email,
      password: data.password,
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone || "",
      whatsapp: data.whatsapp || "",
      country: data.country,
      city: data.city || "",
      bio: data.bio || "",
      interests: data.interests || [],
      profile_image: data.profileImage || "",
      activity: data.activity || "",
      status: "ambassador_potential",
      ambassador_code: generateAmbassadorCode(data.firstName, data.lastName),
      joined_at: new Date().toISOString(),
      email_confirmed: true,
      validation_status: "pending_validation",
      visible_in_trombinoscope: false,
      skills: data.skills || [],
      privacy_settings: data.privacySettings || { showEmail: false, showWhatsApp: true, showPhone: false },
    };

    // Sauvegarder dans Supabase
    const { error } = await supabase.from("members").insert([newMember]);

    if (error) {
      // Fallback localStorage si Supabase échoue
      console.error("Supabase error:", error);
      const membersData = localStorage.getItem("tykaMembers");
      const members: Member[] = membersData ? JSON.parse(membersData) : [];
      if (members.some(m => m.email === data.email)) {
        return { success: false, error: "Cet email est déjà utilisé" };
      }
      const localMember: Member = {
        ...newMember,
        firstName: data.firstName!,
        lastName: data.lastName!,
        validationStatus: "pending_validation",
        visibleInTrombinoscope: false,
      };
      members.push(localMember);
      localStorage.setItem("tykaMembers", JSON.stringify(members));
      return { success: true, member: localMember };
    }

    return { success: true };
  };

  const logout = () => {
    setCurrentMember(null);
    localStorage.removeItem("tykaMember");
  };

  const updateProfile = async (data: Partial<Member>) => {
    if (!currentMember) return { success: false, error: "Non authentifié" };
    
    const { error } = await supabase
      .from("members")
      .update({
        first_name: data.firstName,
        last_name: data.lastName,
        bio: data.bio,
        activity: data.activity,
        country: data.country,
        city: data.city,
      })
      .eq("id", currentMember.id);

    if (!error) {
      const updated = { ...currentMember, ...data };
      setCurrentMember(updated);
      localStorage.setItem("tykaMember", JSON.stringify(updated));
    }

    return { success: !error };
  };

  const requestPasswordReset = async (email: string) => ({ success: true });
  const confirmEmail = async (token: string) => ({ success: true });

  return (
    <MemberAuthContext.Provider value={{
      currentMember,
      member: currentMember,
      login,
      register,
      logout,
      updateProfile,
      requestPasswordReset,
      confirmEmail,
      isAuthenticated: !!currentMember && (currentMember.validationStatus === "active" || !currentMember.validationStatus),
    }}>
      {children}
    </MemberAuthContext.Provider>
  );
}

export function useMemberAuth() {
  return useContext(MemberAuthContext);
}

export function useMemberAuthSafe() {
  return useContext(MemberAuthContext) || null;
}
