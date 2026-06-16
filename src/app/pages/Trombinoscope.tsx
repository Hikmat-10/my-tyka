import { Header } from "../components/Header";
import { Search, MapPin, Users, Mail, Phone, MessageCircle, User as UserIcon, Star, X, Filter, ChevronDown, GraduationCap, Award } from "lucide-react";
import { useState, useMemo } from "react";
import { getAllMembers } from "../services/dataService";
import { type Member } from "../contexts/MemberAuthContext";
import { motion, AnimatePresence } from "motion/react";

export default function Trombinoscope() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDomain, setFilterDomain] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterCohort, setFilterCohort] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const allMembers = getAllMembers();
  const validatedMembers = allMembers.filter((member: Member) => {
    const validationStatus = member.validationStatus || "active";
    const visibleInTrombinoscope = member.visibleInTrombinoscope !== undefined ? member.visibleInTrombinoscope : true;
    return validationStatus === "active" && visibleInTrombinoscope === true;
  });

  const domains = useMemo(() => {
    const set = new Set(validatedMembers.map((m: Member) => m.activity).filter(Boolean));
    return Array.from(set).sort() as string[];
  }, [validatedMembers.length]);

  const cities = useMemo(() => {
    const set = new Set(validatedMembers.map((m: Member) => m.city).filter(Boolean));
    return Array.from(set).sort() as string[];
  }, [validatedMembers.length]);

  const countries = useMemo(() => {
    const set = new Set(validatedMembers.map((m: Member) => m.country).filter(Boolean));
    return Array.from(set).sort() as string[];
  }, [validatedMembers.length]);

  const allCohorts = useMemo(() => {
    const cohortTitles = new Set<string>();
    validatedMembers.forEach((m: Member) => {
      const enrollments = JSON.parse(localStorage.getItem(`tykaCohortEnrollments_${m.id}`) || "[]");
      enrollments.forEach((e: any) => { if (e.cohortTitle) cohortTitles.add(e.cohortTitle); });
    });
    return Array.from(cohortTitles).sort();
  }, [validatedMembers.length]);

  const filteredMembers = useMemo(() => {
    return validatedMembers.filter((member: Member) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
        const match = fullName.includes(q) || (member.activity || "").toLowerCase().includes(q) ||
          (member.city || "").toLowerCase().includes(q) || (member.country || "").toLowerCase().includes(q) ||
          (member.bio || "").toLowerCase().includes(q);
        if (!match) return false;
      }
      if (filterDomain !== "all" && member.activity !== filterDomain) return false;
      if (filterCity !== "all" && member.city !== filterCity) return false;
      if (filterCountry !== "all" && member.country !== filterCountry) return false;
      if (filterCohort !== "all") {
        const enrollments = JSON.parse(localStorage.getItem(`tykaCohortEnrollments_${member.id}`) || "[]");
        const inCohort = enrollments.some((e: any) => e.cohortTitle === filterCohort);
        if (!inCohort) return false;
      }
      return true;
    });
  }, [searchQuery, filterDomain, filterCity, filterCountry, filterCohort, validatedMembers.length]);

  const activeFiltersCount = [filterDomain, filterCity, filterCountry, filterCohort].filter(f => f !== "all").length;

  const resetFilters = () => {
    setFilterDomain("all"); setFilterCity("all"); setFilterCountry("all"); setFilterCohort("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-[#0f0904]">
      <Header />

      {/* Dark Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a0e05] via-[#2d1810] to-[#1a0a00] py-14 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-amber-600/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-[#D4522A]/10 blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-400 text-sm mb-5">
            <Users className="w-4 h-4" />
            Communauté TYKA
          </div>
          <h1 className="text-4xl md:text-5xl text-white mb-3">Trombinoscope</h1>
          <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
            Découvrez et connectez-vous avec les membres actifs de la communauté
          </p>

          {/* Search Bar */}
          <div className="flex gap-3 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Rechercher un membre, une activité, une ville..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 h-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-amber-500/60 focus:bg-white/15 transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 h-12 rounded-xl border transition-all ${showFilters || activeFiltersCount > 0 ? "bg-amber-500 border-amber-500 text-white" : "bg-white/10 border-white/20 text-white/80 hover:bg-white/15"}`}
            >
              <Filter className="w-4 h-4" />
              Filtres
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-amber-600 text-xs flex items-center justify-center font-bold">{activeFiltersCount}</span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 max-w-2xl mx-auto bg-white/10 border border-white/20 rounded-xl p-4"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <FilterSelect label="Domaine" value={filterDomain} onChange={setFilterDomain} options={domains} />
                  <FilterSelect label="Ville" value={filterCity} onChange={setFilterCity} options={cities} />
                  <FilterSelect label="Pays" value={filterCountry} onChange={setFilterCountry} options={countries} />
                  <FilterSelect label="Cohorte suivie" value={filterCohort} onChange={setFilterCohort} options={allCohorts} />
                </div>
                {activeFiltersCount > 0 && (
                  <button onClick={resetFilters} className="mt-3 text-xs text-amber-400 hover:text-amber-300 transition-colors">
                    Réinitialiser les filtres
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 mt-8 text-sm">
            <div className="text-white/70"><span className="text-amber-400 font-bold text-xl">{filteredMembers.length}</span> membre{filteredMembers.length > 1 ? "s" : ""}</div>
            <div className="w-px h-6 bg-white/20" />
            <div className="text-white/70"><span className="text-emerald-400 font-bold text-xl">{countries.length}</span> pays</div>
            <div className="w-px h-6 bg-white/20" />
            <div className="text-white/70"><span className="text-blue-400 font-bold text-xl">{domains.length}</span> domaines</div>
          </div>
        </div>
      </div>

      {/* Members Grid */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-white/20" />
            </div>
            <p className="text-white/50 text-lg mb-2">Aucun membre trouvé</p>
            <p className="text-white/30 text-sm mb-4">Essayez d'autres critères de recherche</p>
            <button onClick={resetFilters} className="text-amber-400 text-sm hover:text-amber-300 transition-colors">
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredMembers.map((member: Member) => (
              <MemberCard key={member.id} member={member} onClick={() => setSelectedMember(member)} />
            ))}
          </div>
        )}
      </main>

      {/* Member Profile Slide-over */}
      <AnimatePresence>
        {selectedMember && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
            />
            <motion.div
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-[#1a0e05] z-50 shadow-2xl overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <MemberProfileSlide member={selectedMember} onClose={() => setSelectedMember(null)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-amber-500/60 focus:bg-white/15 transition-all"
      >
        <option value="all" className="bg-[#1a0e05] text-white">{label} : Tous</option>
        {options.map(o => <option key={o} value={o} className="bg-[#1a0e05] text-white">{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
    </div>
  );
}

function MemberCard({ member, onClick }: { member: Member; onClick: () => void }) {
  const initials = `${member.firstName?.[0] || ""}${member.lastName?.[0] || ""}`.toUpperCase();
  const isAmbassador = member.status === "ambassador_active" || member.status === "ambassador_potential";
  const enrolledCohorts = JSON.parse(localStorage.getItem(`tykaCohortEnrollments_${member.id}`) || "[]");

  return (
    <button
      onClick={onClick}
      className="group bg-gradient-to-b from-white/8 to-white/4 border border-white/10 rounded-2xl overflow-hidden hover:border-amber-500/40 hover:from-white/12 hover:to-white/6 transition-all text-left"
    >
      {/* Cover */}
      <div className="h-16 bg-gradient-to-br from-amber-900/40 to-[#D4522A]/20 relative">
        {isAmbassador && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/90 text-xs text-white font-medium">
            <Star className="w-3 h-3" />
            Ambassadeur
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="px-5 pb-5">
        <div className="-mt-8 mb-3">
          {member.profileImage ? (
            <img
              src={member.profileImage}
              alt={`${member.firstName} ${member.lastName}`}
              className="w-16 h-16 rounded-full object-cover border-4 border-[#1a0e05] group-hover:border-amber-900/60 transition-colors"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center border-4 border-[#1a0e05] group-hover:border-amber-900/60 transition-colors">
              <span className="text-white font-bold text-lg">{initials}</span>
            </div>
          )}
        </div>

        <h3 className="text-white font-semibold text-sm mb-0.5 group-hover:text-amber-300 transition-colors">
          {member.firstName} {member.lastName}
        </h3>
        {member.activity && (
          <p className="text-amber-400/80 text-xs mb-2 line-clamp-1">{member.activity}</p>
        )}

        {(member.city || member.country) && (
          <div className="flex items-center gap-1.5 text-xs text-white/50 mb-3">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{[member.city, member.country].filter(Boolean).join(", ")}</span>
          </div>
        )}

        {member.interests?.slice(0, 2).length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {member.interests.slice(0, 2).map((i: string) => (
              <span key={i} className="px-2 py-0.5 bg-white/5 text-white/50 rounded-full text-xs border border-white/10">{i}</span>
            ))}
          </div>
        )}

        {enrolledCohorts.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <GraduationCap className="w-3 h-3" />
            <span>{enrolledCohorts.length} cohorte{enrolledCohorts.length > 1 ? "s" : ""}</span>
          </div>
        )}
      </div>
    </button>
  );
}

function MemberProfileSlide({ member, onClose }: { member: Member; onClose: () => void }) {
  const initials = `${member.firstName?.[0] || ""}${member.lastName?.[0] || ""}`.toUpperCase();
  const isAmbassador = member.status === "ambassador_active";
  const enrolledCohorts = JSON.parse(localStorage.getItem(`tykaCohortEnrollments_${member.id}`) || "[]");
  const joinedDate = member.joinedAt ? new Date(member.joinedAt).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }) : "N/A";

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 bg-[#1a0e05]/95 backdrop-blur-sm border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-400" />
          <span className="text-white/80 text-sm">Profil membre</span>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
          <X className="w-4 h-4 text-white/70" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Identity */}
        <div className="bg-gradient-to-br from-amber-900/30 to-[#D4522A]/15 rounded-2xl p-6 border border-white/10">
          <div className="flex items-start gap-4">
            {member.profileImage ? (
              <img src={member.profileImage} alt={member.firstName} className="w-20 h-20 rounded-full object-cover border-4 border-white/20 flex-shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center border-4 border-white/20 flex-shrink-0">
                <span className="text-white font-bold text-2xl">{initials}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl text-white mb-1">{member.firstName} {member.lastName}</h2>
              {member.activity && <p className="text-amber-400 text-sm mb-2">{member.activity}</p>}
              <div className="flex flex-wrap gap-2">
                {isAmbassador && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Star className="w-3 h-3" />
                    Ambassadeur actif
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  Membre validé
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 mt-5">
            {(member.city || member.country) && (
              <div className="flex items-center gap-2 text-sm text-white/70">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{[member.city, member.country].filter(Boolean).join(", ")}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Inscrit le {joinedDate}</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {member.bio && (
          <div>
            <h3 className="text-xs text-white/40 uppercase tracking-wider mb-2">À propos</h3>
            <p className="text-sm text-white/70 leading-relaxed">{member.bio}</p>
          </div>
        )}

        {/* Contact (if public) */}
        {(member.privacySettings?.showEmail || member.privacySettings?.showPhone || member.privacySettings?.showWhatsApp) && (
          <div>
            <h3 className="text-xs text-white/40 uppercase tracking-wider mb-2">Contact</h3>
            <div className="space-y-2">
              {member.privacySettings?.showEmail && member.email && (
                <a href={`mailto:${member.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 transition-colors text-sm">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  {member.email}
                </a>
              )}
              {member.privacySettings?.showWhatsApp && member.whatsapp && (
                <a href={`https://wa.me/${member.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 transition-colors text-sm">
                  <MessageCircle className="w-4 h-4 flex-shrink-0" />
                  {member.whatsapp}
                </a>
              )}
              {member.privacySettings?.showPhone && member.phone && (
                <a href={`tel:${member.phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-colors text-sm">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  {member.phone}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Interests */}
        {member.interests?.length > 0 && (
          <div>
            <h3 className="text-xs text-white/40 uppercase tracking-wider mb-2">Centres d'intérêt</h3>
            <div className="flex flex-wrap gap-2">
              {member.interests.map((i: string) => (
                <span key={i} className="px-3 py-1 bg-white/5 text-white/60 rounded-full text-xs border border-white/10">{i}</span>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {member.skills?.length > 0 && (
          <div>
            <h3 className="text-xs text-white/40 uppercase tracking-wider mb-2">Compétences</h3>
            <div className="space-y-2">
              {member.skills.slice(0, 5).map((s: any) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-xs text-white/60 w-32 flex-shrink-0">{s.name}</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" style={{ width: `${(s.level / 5) * 100}%` }} />
                  </div>
                  <span className="text-xs text-white/30 w-8 text-right">{s.level}/5</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cohorts */}
        {enrolledCohorts.length > 0 && (
          <div>
            <h3 className="text-xs text-white/40 uppercase tracking-wider mb-2">Cohortes suivies</h3>
            <div className="space-y-2">
              {enrolledCohorts.slice(0, 4).map((e: any) => (
                <div key={e.cohortId} className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-sm text-white/70 truncate">{e.cohortTitle || "Cohorte"}</span>
                  {e.cohortDomain && <span className="text-xs text-amber-400/70 flex-shrink-0 ml-2">{e.cohortDomain}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ambassador code */}
        {member.ambassadorCode && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25">
            <p className="text-xs text-amber-400/70 mb-1">Code ambassadeur</p>
            <p className="text-amber-300 font-bold tracking-wider">{member.ambassadorCode}</p>
          </div>
        )}
      </div>
    </>
  );
}
