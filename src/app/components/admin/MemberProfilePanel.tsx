import { X, Mail, Phone, Briefcase, Calendar, GraduationCap, Award, MessageCircle, Users, Star, CheckCircle2, Clock, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { validateMember } from "../../services/dataService";
import { toast } from "sonner";
import { useState, type ReactNode } from "react";

interface MemberProfilePanelProps {
  member: any | null;
  isOpen: boolean;
  onClose: () => void;
  onMemberUpdated?: () => void;
  canValidate?: boolean;
}

const validationStatusConfig: Record<string, { label: string; color: string; icon: any }> = {
  active: { label: "Validé", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  pending_validation: { label: "En attente", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  rejected: { label: "Rejeté", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
};

export function MemberProfilePanel({ member, isOpen, onClose, onMemberUpdated, canValidate }: MemberProfilePanelProps) {
  const [validating, setValidating] = useState(false);

  if (!member) return null;

  const initials = `${member.firstName?.[0] || ""}${member.lastName?.[0] || ""}`.toUpperCase();
  const validationStatus = member.validationStatus || "active";
  const statusInfo = validationStatusConfig[validationStatus] || validationStatusConfig.active;
  const StatusIcon = statusInfo.icon;

  const handleValidate = (status: "active" | "rejected") => {
    setValidating(true);
    validateMember(member.id, status);
    if (status === "active") {
      toast.success("✅ Membre validé avec succès !");
    } else {
      toast.error("Membre rejeté");
    }
    onMemberUpdated?.();
    setValidating(false);
  };

  const joinedDate = member.joinedAt ? new Date(member.joinedAt).toLocaleDateString("fr-FR", {
    year: "numeric", month: "long", day: "numeric"
  }) : "N/A";

  const enrolledCohorts = member.id
    ? JSON.parse(localStorage.getItem(`tykaCohortEnrollments_${member.id}`) || "[]")
    : [];

  const watchedVideos = member.id
    ? JSON.parse(localStorage.getItem(`tykaWatchedVideos_${member.id}`) || "[]")
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white z-50 shadow-2xl overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#D4522A]" />
                <span className="font-semibold text-gray-900">Fiche Membre</span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Identity Card */}
              <div className="bg-gradient-to-br from-[#1a0e05] to-[#2d1810] rounded-2xl p-6 text-white">
                <div className="flex items-start gap-5">
                  <Avatar className="w-20 h-20 border-4 border-white/20 flex-shrink-0">
                    {member.profileImage && <AvatarImage src={member.profileImage} alt={member.firstName} />}
                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-2xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl text-white mb-0.5">
                      {member.firstName} {member.lastName}
                    </h2>
                    {member.activity && (
                      <p className="text-amber-300 text-sm mb-2">{member.activity}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </span>
                      {member.status === "ambassador_active" && (
                        <span className="px-2.5 py-1 rounded-full text-xs bg-amber-100 text-amber-800 border border-amber-200 font-medium">
                          Ambassadeur actif
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-5">
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  {member.whatsapp && (
                    <div className="flex items-center gap-2 text-sm text-white/80">
                      <MessageCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>{member.whatsapp}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Calendar className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>Inscrit le {joinedDate}</span>
                  </div>
                </div>
              </div>

              {/* Validation Actions (for pending members) */}
              {canValidate && validationStatus === "pending_validation" && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-800 mb-3 font-medium">Ce membre est en attente de validation.</p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleValidate("rejected")}
                      variant="outline"
                      disabled={validating}
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeter
                    </Button>
                    <Button
                      onClick={() => handleValidate("active")}
                      disabled={validating}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Valider le membre
                    </Button>
                  </div>
                </div>
              )}

              {/* Professional Profile */}
              <Section title="Profil Professionnel" icon={Briefcase} color="text-blue-600">
                <InfoGrid>
                  {member.activity && <InfoItem label="Fonction / Activité" value={member.activity} />}
                  {member.city && <InfoItem label="Ville" value={member.city} />}
                  {member.country && <InfoItem label="Pays" value={member.country} />}
                </InfoGrid>
              </Section>

              {/* Bio */}
              {member.bio && (
                <Section title="Présentation / Bio" icon={Star} color="text-amber-600">
                  <p className="text-sm text-gray-600 leading-relaxed">{member.bio}</p>
                </Section>
              )}

              {/* Interests & Skills */}
              {(member.interests?.length > 0 || member.skills?.length > 0) && (
                <Section title="Compétences & Intérêts" icon={GraduationCap} color="text-purple-600">
                  {member.interests?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Centres d'intérêt</p>
                      <div className="flex flex-wrap gap-2">
                        {member.interests.map((i: string) => (
                          <span key={i} className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs border border-purple-100">{i}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {member.skills?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Compétences auto-évaluées</p>
                      <div className="space-y-2">
                        {member.skills.slice(0, 6).map((s: any) => (
                          <div key={s.name} className="flex items-center gap-3">
                            <span className="text-xs text-gray-700 w-36 flex-shrink-0">{s.name}</span>
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                                style={{ width: `${(s.level / 5) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-400 w-8 text-right">{s.level}/5</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Section>
              )}

              {/* TYKA Activity */}
              <Section title="Activité sur TYKA" icon={Award} color="text-[#D4522A]">
                <div className="grid grid-cols-3 gap-3">
                  <StatMini value={enrolledCohorts.length} label="Cohortes" color="bg-amber-50 border-amber-200 text-amber-700" />
                  <StatMini value={watchedVideos.length} label="Vidéos" color="bg-blue-50 border-blue-200 text-blue-700" />
                  <StatMini value={enrolledCohorts.filter((e: any) => e.status === "completed").length} label="Certificats" color="bg-emerald-50 border-emerald-200 text-emerald-700" />
                </div>
                {enrolledCohorts.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cohortes suivies</p>
                    <div className="space-y-2">
                      {enrolledCohorts.slice(0, 4).map((e: any) => (
                        <div key={e.cohortId} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                          <span className="text-gray-700 truncate">{e.cohortTitle || "Cohorte"}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{e.cohortDomain}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Section>

              {/* Network */}
              <Section title="Réseau & Parrainage" icon={Users} color="text-green-600">
                <InfoGrid>
                  {member.ambassadorReferralCode && (
                    <InfoItem label="Code ambassadeur utilisé" value={member.ambassadorReferralCode} highlight />
                  )}
                  {member.acquisitionSource && (
                    <InfoItem label="Source d'acquisition" value={member.acquisitionSource} />
                  )}
                  {member.ambassadorCode && (
                    <InfoItem label="Mon code ambassadeur" value={member.ambassadorCode} highlight />
                  )}
                </InfoGrid>
              </Section>

              {/* Privacy Settings */}
              {member.privacySettings && (
                <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 border border-gray-100">
                  <p className="font-semibold text-gray-700 mb-1.5">Paramètres de confidentialité</p>
                  <div className="flex gap-4 flex-wrap">
                    <span>Email : {member.privacySettings.showEmail ? "Visible" : "Masqué"}</span>
                    <span>Téléphone : {member.privacySettings.showPhone ? "Visible" : "Masqué"}</span>
                    <span>WhatsApp : {member.privacySettings.showWhatsApp ? "Visible" : "Masqué"}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ title, icon: Icon, color, children }: { title: string; icon: any; color: string; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${color}`} />
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="pl-6">{children}</div>
    </div>
  );
}

function InfoGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function InfoItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`text-sm font-medium ${highlight ? "text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md inline-block" : "text-gray-800"}`}>{value}</p>
    </div>
  );
}

function StatMini({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className={`rounded-xl border p-3 text-center ${color}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs mt-0.5 opacity-80">{label}</div>
    </div>
  );
}
