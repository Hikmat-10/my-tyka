import { Header } from "../components/Header";
import { PremiumCohorteCard } from "../components/PremiumCohorteCard";
import { CohortDetail } from "../components/CohortDetail";
import { InitiativeCard } from "../components/InitiativeCard";
import { InitiativeDetail } from "../components/InitiativeDetail";
import { JoinModal } from "../components/JoinModal";
import { CohortAuthModal } from "../components/CohortAuthModal";
import { ProposeInitiativeModal } from "../components/ProposeInitiativeModal";
import { LoginModal } from "../components/LoginModal";
import { RegisterModal } from "../components/RegisterModal";
import {
  Search, GraduationCap, Lightbulb, SlidersHorizontal, X,
  Award, BookOpen, Sparkles, TrendingUp, Clock, CheckCircle2,
  Star, Target, BarChart3, Users, ChevronRight, Zap
} from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useMemberAuth } from "../contexts/MemberAuthContext";
import { getCohortes, subscribeToCohortes, getInitiatives } from "../services/dataService";
import type { Cohorte, Initiative } from "../services/dataService";
import type { EnrollmentPaymentStatus } from "../components/JoinModal";
import { motion, AnimatePresence } from "motion/react";

type FilterStatus = "all" | "active" | "upcoming" | "completed";
type PersonalTab = "enrolled" | "recommended" | "certificates";

const DOMAINS = ["Leadership", "Entrepreneuriat", "Innovation", "Technologie", "Communication", "Management", "Environnement", "Culture"];
const LEVELS = ["débutant", "intermédiaire", "avancé"] as const;
const PARTNERS_LIST = ["SOL VERT", "SONABEL", "World Vision", "Institut Français"];

export default function CoCreate() {
  const { isAuthenticated, currentMember } = useMemberAuth();

  const [cohortes, setCohortes] = useState<Cohorte[]>([]);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [selectedCohorte, setSelectedCohorte] = useState<Cohorte | null>(null);
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showInitiativeDetail, setShowInitiativeDetail] = useState(false);
  const [showCohortDetail, setShowCohortDetail] = useState(false);

  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedPartner, setSelectedPartner] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [personalTab, setPersonalTab] = useState<PersonalTab>("enrolled");
  const [enrolledCohorts, setEnrolledCohorts] = useState<string[]>([]);

  useEffect(() => {
    setCohortes(getCohortes());
    const unsubscribe = subscribeToCohortes(setCohortes);

    // Load approved initiatives
    const allInitiatives = getInitiatives();
    const approvedInitiatives = allInitiatives.filter(i => i.status === "approved");
    setInitiatives(approvedInitiatives);

    return unsubscribe;
  }, []);

  function refreshEnrollments() {
    if (!currentMember) return;
    const storageKey = `tykaCohortEnrollments_${currentMember.id}`;
    const now = Date.now();
    const RESERVATION_MS_CHECK = 48 * 60 * 60 * 1000;
    const raw = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const updated = raw.map((e: any) => {
      if (e.paymentStatus === "pending_payment" && e.reservedAt && now - e.reservedAt > RESERVATION_MS_CHECK) {
        return { ...e, paymentStatus: "expired" };
      }
      return e;
    });
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setEnrolledCohorts(updated.map((e: any) => e.cohortId));
  }

  useEffect(() => {
    refreshEnrollments();
  }, [currentMember]);

  const filteredCohortes = useMemo(() => {
    return cohortes.filter((c) => {
      if (filterStatus !== "all" && c.status !== filterStatus) return false;
      if (selectedDomain && c.domain !== selectedDomain) return false;
      if (selectedLevel && c.level !== selectedLevel) return false;
      if (selectedPartner && (!c.partner || !c.partner.name.toLowerCase().includes(selectedPartner.toLowerCase()))) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.domain.toLowerCase().includes(q) ||
          (c.partner?.name.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [cohortes, filterStatus, selectedDomain, selectedLevel, selectedPartner, searchQuery]);

  const enrolledCohortsList = cohortes.filter(c => enrolledCohorts.includes(c.id));
  const activeCohorts = enrolledCohortsList.filter(c => c.status === "active");
  const upcomingCohorts = enrolledCohortsList.filter(c => c.status === "upcoming");
  const completedCohorts = enrolledCohortsList.filter(c => c.status === "completed");

  const recommendedCohorts = useMemo(() => {
    if (!currentMember) return cohortes.filter(c => c.status !== "completed").slice(0, 3);
    const interests = currentMember.interests || [];
    return cohortes
      .filter(c => !enrolledCohorts.includes(c.id) && c.status !== "completed")
      .filter(c => interests.some(i => c.domain.toLowerCase().includes(i.toLowerCase())) || true)
      .slice(0, 3);
  }, [cohortes, currentMember, enrolledCohorts]);

  const memberSkills = currentMember?.skills || [];
  const avgSkillScore = memberSkills.length > 0
    ? Math.round(memberSkills.reduce((s, sk) => s + sk.level, 0) / memberSkills.length * 10)
    : 0;
  const strongSkills = memberSkills.filter(s => s.level >= 4);
  const weakSkills = memberSkills.filter(s => s.level <= 2);

  const handleOpenCohortDetail = (cohorte: Cohorte) => {
    setSelectedCohorte(cohorte);
    setShowCohortDetail(true);
  };

  const handleJoinCohorte = (cohorte: Cohorte) => {
    setShowCohortDetail(false);
    if (!isAuthenticated) {
      setSelectedCohorte(cohorte);
      setShowAuthModal(true);
      return;
    }
    setSelectedCohorte(cohorte);
    setShowJoinModal(true);
  };

  const hasActiveFilters = selectedDomain || selectedLevel || selectedPartner;

  const filterCounts = {
    all: cohortes.length,
    active: cohortes.filter(c => c.status === "active").length,
    upcoming: cohortes.filter(c => c.status === "upcoming").length,
    completed: cohortes.filter(c => c.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* HERO HEADER */}
      <div className="relative bg-gradient-to-br from-[#1a0e05] via-[#2d1810] to-[#1a1005] overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, #c4622d 0%, transparent 50%), radial-gradient(circle at 80% 20%, #d4941a 0%, transparent 40%)"
          }}
        />
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
        />

        <div className="relative container mx-auto px-6 pt-14 pb-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-sm mb-6">
              <GraduationCap className="w-4 h-4" />
              <span>Opportunités d'apprentissage TYKA</span>
            </div>

            <h1 className="text-white mb-4 leading-tight" style={{ fontSize: "2.5rem", fontWeight: 700 }}>
              Initiatives & Cohortes TYKA
            </h1>
            <p className="text-amber-100/80 mb-10 leading-relaxed max-w-2xl mx-auto" style={{ fontSize: "1.1rem" }}>
              Apprendre, collaborer et développer ses compétences à travers des cohortes propulsées par des organisations engagées.
            </p>

            {/* Search Bar */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-2">
                {/* Keyword search */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher une cohorte..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-amber-400 transition-colors text-sm"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X className="w-4 h-4 text-white/50 hover:text-white" />
                    </button>
                  )}
                </div>

                {/* Domain filter */}
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400 transition-colors text-sm min-w-[160px]"
                  style={{ colorScheme: "dark" }}
                >
                  <option value="" style={{ background: "#1a1005" }}>Tous les domaines</option>
                  {DOMAINS.map(d => (
                    <option key={d} value={d} style={{ background: "#1a1005" }}>{d}</option>
                  ))}
                </select>

                {/* Level filter */}
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400 transition-colors text-sm min-w-[140px]"
                  style={{ colorScheme: "dark" }}
                >
                  <option value="" style={{ background: "#1a1005" }}>Tous niveaux</option>
                  {LEVELS.map(l => (
                    <option key={l} value={l} style={{ background: "#1a1005" }}>
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-center gap-8 mt-8 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{filterCounts.active} en cours</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span>{filterCounts.upcoming} à venir</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <span>{filterCounts.completed} terminée{filterCounts.completed > 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* FILTER TABS */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
            {(["all", "active", "upcoming", "completed"] as FilterStatus[]).map((status) => {
              const labels: Record<FilterStatus, string> = {
                all: "Toutes",
                active: "En cours",
                upcoming: "À venir",
                completed: "Terminées"
              };
              const dots: Record<FilterStatus, string> = {
                all: "",
                active: "bg-emerald-400",
                upcoming: "bg-amber-400",
                completed: "bg-gray-400"
              };
              return (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    filterStatus === status
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {dots[status] && (
                    <span className={`w-2 h-2 rounded-full ${dots[status]}`} />
                  )}
                  {labels[status]}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    filterStatus === status ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {filterCounts[status]}
                  </span>
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => { setSelectedDomain(""); setSelectedLevel(""); setSelectedPartner(""); }}
              className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-800 font-medium"
            >
              <X className="w-4 h-4" />
              Effacer les filtres
            </button>
          )}
        </div>

        {/* COHORTS GRID */}
        <AnimatePresence mode="wait">
          {filteredCohortes.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Aucune cohorte ne correspond à vos critères</p>
              <button
                onClick={() => { setFilterStatus("all"); setSearchQuery(""); setSelectedDomain(""); setSelectedLevel(""); }}
                className="text-amber-600 hover:text-amber-700 font-medium text-sm"
              >
                Réinitialiser les filtres
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={filterStatus + searchQuery}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            >
              {filteredCohortes.map((cohorte, i) => (
                <motion.div
                  key={cohorte.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <div onClick={() => handleOpenCohortDetail(cohorte)} className="cursor-pointer">
                    <PremiumCohorteCard cohorte={cohorte} onJoin={(c) => { handleJoinCohorte(c); }} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* INITIATIVES SECTION */}
        {initiatives.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-gray-900" style={{ fontSize: "1.3rem", fontWeight: 700 }}>Initiatives TYKA</h2>
                <p className="text-sm text-gray-500">Participez aux initiatives de la communauté</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {initiatives.map((initiative, i) => (
                <motion.div
                  key={initiative.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <InitiativeCard
                    initiative={initiative}
                    onClick={(init) => {
                      setSelectedInitiative(init);
                      setShowInitiativeDetail(true);
                    }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* PERSONAL MEMBER SPACE */}
        {isAuthenticated && currentMember && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-gray-900" style={{ fontSize: "1.3rem", fontWeight: 700 }}>Mes Cohortes</h2>
                <p className="text-sm text-gray-500">Votre espace d'apprentissage personnel</p>
              </div>
            </div>

            {/* Personal Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="border-b border-gray-100">
                <div className="flex">
                  {([
                    { key: "enrolled", label: "Mes inscriptions", icon: GraduationCap, count: enrolledCohortsList.length },
                    { key: "recommended", label: "Recommandées", icon: Sparkles, count: recommendedCohorts.length },
                    { key: "certificates", label: "Certificats & Badges", icon: Award, count: completedCohorts.length },
                  ] as const).map(({ key, label, icon: Icon, count }) => (
                    <button
                      key={key}
                      onClick={() => setPersonalTab(key)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors border-b-2 ${
                        personalTab === key
                          ? "border-amber-500 text-amber-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{label}</span>
                      {count > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          personalTab === key ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {/* Enrolled Tab */}
                {personalTab === "enrolled" && (
                  <div>
                    {enrolledCohortsList.length === 0 ? (
                      <div className="text-center py-12">
                        <GraduationCap className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-500 mb-4">Vous n'êtes inscrit à aucune cohorte pour l'instant.</p>
                        <button
                          onClick={() => setFilterStatus("active")}
                          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold"
                        >
                          Explorer les cohortes
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {activeCohorts.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              En cours ({activeCohorts.length})
                            </h3>
                            <div className="space-y-3">
                              {activeCohorts.map(c => <EnrolledCohortRow key={c.id} cohorte={c} memberId={currentMember!.id} onStatusChange={refreshEnrollments} />)}
                            </div>
                          </div>
                        )}
                        {upcomingCohorts.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              À venir ({upcomingCohorts.length})
                            </h3>
                            <div className="space-y-3">
                              {upcomingCohorts.map(c => <EnrolledCohortRow key={c.id} cohorte={c} memberId={currentMember!.id} onStatusChange={refreshEnrollments} />)}
                            </div>
                          </div>
                        )}
                        {completedCohorts.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-gray-400" />
                              Terminées ({completedCohorts.length})
                            </h3>
                            <div className="space-y-3">
                              {completedCohorts.map(c => <EnrolledCohortRow key={c.id} cohorte={c} memberId={currentMember!.id} onStatusChange={refreshEnrollments} />)}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Recommended Tab */}
                {personalTab === "recommended" && (
                  <div>
                    {currentMember.skills && currentMember.skills.length > 0 && (
                      <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <p className="text-sm text-amber-800">
                          <span className="font-semibold">Au regard de votre profil,</span> les cohortes suivantes correspondent à vos centres d'intérêt et compléteront vos compétences.
                        </p>
                      </div>
                    )}
                    {recommendedCohorts.length === 0 ? (
                      <div className="text-center py-12">
                        <Sparkles className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-500">Complétez votre profil pour obtenir des recommandations personnalisées.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {recommendedCohorts.map(c => (
                          <div key={c.id} className="rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-28 bg-gray-200 relative overflow-hidden">
                              <img src={c.coverImage || ""} alt={c.title} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                              <span className="absolute bottom-2 left-2 text-xs text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">{c.domain}</span>
                            </div>
                            <div className="p-3">
                              <p className="text-sm text-gray-900 line-clamp-2 mb-2">{c.title}</p>
                              <button
                                onClick={() => handleJoinCohorte(c)}
                                className="w-full text-xs py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg font-medium transition-colors"
                              >
                                Rejoindre
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Certificates Tab */}
                {personalTab === "certificates" && (
                  <div>
                    {completedCohorts.length === 0 ? (
                      <div className="text-center py-12">
                        <Award className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-500 mb-2">Aucun certificat obtenu pour l'instant.</p>
                        <p className="text-xs text-gray-400">Terminez une cohorte pour obtenir votre certificat TYKA.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {completedCohorts.map(c => (
                          <div key={c.id} className="border-2 border-amber-200 rounded-xl p-5 bg-gradient-to-br from-amber-50 to-orange-50">
                            <div className="flex items-start justify-between mb-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                                <Award className="w-6 h-6 text-white" />
                              </div>
                              <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">Certifié</span>
                            </div>
                            <h4 className="text-gray-900 text-sm mb-1">{c.title}</h4>
                            <p className="text-xs text-gray-500 mb-3">{c.domain} • {c.duration}</p>
                            <button className="text-xs text-amber-700 font-medium hover:text-amber-900 flex items-center gap-1">
                              Télécharger le certificat <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Opportunities Section */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-[#1a0e05] to-[#2d1810] rounded-xl text-white">
                      <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-amber-400" />
                        <h4 className="font-semibold text-sm">Mes Opportunités</h4>
                      </div>
                      <p className="text-white/70 text-xs leading-relaxed">
                        Vos certificats TYKA vous ouvrent des portes : mentoring, projets collaboratifs, missions freelance au sein de l'écosystème TYKA.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* HUMAN CAPITAL DIAGNOSTIC */}
        {isAuthenticated && currentMember && memberSkills.length > 0 && (
          <div className="mb-12">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c4622d] to-[#d4941a] flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-gray-900" style={{ fontWeight: 700 }}>Diagnostic du Capital Humain</h2>
                    <p className="text-xs text-gray-500">Basé sur votre auto-évaluation de compétences</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl text-amber-600" style={{ fontWeight: 700 }}>{avgSkillScore}<span className="text-sm text-gray-400">/100</span></div>
                  <p className="text-xs text-gray-500">Score global</p>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Strong Skills */}
                <div>
                  <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Compétences fortes
                  </h3>
                  {strongSkills.length > 0 ? (
                    <div className="space-y-2">
                      {strongSkills.slice(0, 3).map(s => (
                        <div key={s.name} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-700">{s.name}</span>
                              <span className="text-emerald-600">{s.level}/5</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${(s.level / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">Aucune compétence forte identifiée</p>
                  )}
                </div>

                {/* Skills to improve */}
                <div>
                  <h3 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    À renforcer
                  </h3>
                  {weakSkills.length > 0 ? (
                    <div className="space-y-2">
                      {weakSkills.slice(0, 3).map(s => (
                        <div key={s.name} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-700">{s.name}</span>
                              <span className="text-amber-600">{s.level}/5</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-400 rounded-full"
                                style={{ width: `${(s.level / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">Profil équilibré</p>
                  )}
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="text-sm font-semibold text-[#c4622d] mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Recommandations TYKA
                  </h3>
                  <div className="space-y-2">
                    {recommendedCohorts.slice(0, 2).map(c => (
                      <div key={c.id} className="flex items-start gap-2 p-2 bg-orange-50 rounded-lg">
                        <Sparkles className="w-3.5 h-3.5 text-orange-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-gray-700 line-clamp-2">{c.title}</p>
                      </div>
                    ))}
                    {recommendedCohorts.length === 0 && (
                      <p className="text-xs text-gray-400">Inscrivez-vous à des cohortes pour obtenir des recommandations.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NON-MEMBER CTA */}
        {!isAuthenticated && (
          <div className="mb-12 bg-gradient-to-r from-[#1a0e05] to-[#2d1810] rounded-2xl p-8 text-white flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-6 h-6 text-amber-400" />
                <h2 style={{ fontWeight: 700, fontSize: "1.2rem" }}>Accédez aux cohortes TYKA</h2>
              </div>
              <p className="text-white/70 text-sm leading-relaxed mb-4">
                Rejoignez la communauté TYKA pour découvrir et accéder aux cohortes, suivre votre progression et obtenir vos certificats.
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-5 py-3 border border-white/30 text-white rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                Se connecter
              </button>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-amber-900/50 transition-all"
              >
                Rejoindre TYKA
              </button>
            </div>
          </div>
        )}

        {/* PERMANENT CTA - "Vous avez une idée?" */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#c4622d] via-[#d4791a] to-[#d4941a] p-8 md:p-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="relative flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-white" style={{ fontWeight: 700, fontSize: "1.4rem" }}>Vous avez une idée ?</h2>
              </div>
              <p className="text-white/85 leading-relaxed mb-2">
                Transformez votre expertise ou votre projet en initiative TYKA.
              </p>
              <p className="text-white/65 text-sm">
                Partagez votre projet avec la communauté et contribuez à l'enrichissement collectif.
              </p>
            </div>
            <motion.button
              onClick={() => setShowProposeModal(true)}
              className="flex-shrink-0 flex items-center gap-2 px-8 py-4 bg-white text-[#c4622d] rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all group"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Lightbulb className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Proposer une initiative
            </motion.button>
          </div>
        </div>
      </main>

      {/* MODALS */}
      <CohortAuthModal
        isOpen={showAuthModal}
        onClose={() => { setShowAuthModal(false); setSelectedCohorte(null); }}
        onAuthenticated={() => { setShowAuthModal(false); setShowJoinModal(true); }}
      />
      <JoinModal
        isOpen={showJoinModal}
        onClose={() => { setShowJoinModal(false); setSelectedCohorte(null); }}
        cohorte={selectedCohorte}
      />
      <ProposeInitiativeModal
        open={showProposeModal}
        onOpenChange={setShowProposeModal}
        onLogin={() => { setShowProposeModal(false); setShowLoginModal(true); }}
        onRegister={() => { setShowProposeModal(false); setShowRegisterModal(true); }}
      />
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onRegister={() => { setShowLoginModal(false); setShowRegisterModal(true); }}
      />
      <RegisterModal open={showRegisterModal} onOpenChange={setShowRegisterModal} />

      {/* Initiative Detail Modal */}
      {showInitiativeDetail && selectedInitiative && (
        <InitiativeDetail
          initiative={selectedInitiative}
          onClose={() => {
            setShowInitiativeDetail(false);
            setSelectedInitiative(null);
          }}
        />
      )}

      {showCohortDetail && selectedCohorte && (
        <CohortDetail
          cohorte={selectedCohorte}
          onClose={() => { setShowCohortDetail(false); setSelectedCohorte(null); }}
          onJoin={handleJoinCohorte}
        />
      )}
    </div>
  );
}

const RESERVATION_MS = 48 * 60 * 60 * 1000;
const OM_PREFIX = "*144*10*74049595*";
const OM_SUFFIX = "#";
const WA_SUPPORT = "74049505";

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00h 00min 00s";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}min ${String(s).padStart(2, "0")}s`;
}

function EnrolledCohortRow({ cohorte, memberId, onStatusChange }: { cohorte: Cohorte; memberId: string; onStatusChange: () => void }) {
  const storageKey = `tykaCohortEnrollments_${memberId}`;

  function getEnrollment() {
    const all: any[] = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return all.find((e) => e.cohortId === cohorte.id) || null;
  }

  const enrollment = getEnrollment();
  const paymentStatus: EnrollmentPaymentStatus = enrollment?.paymentStatus ?? "pending_payment";
  const reservedAt: number = enrollment?.reservedAt ?? Date.now();
  const omCode = `${OM_PREFIX}${cohorte.price ?? ""}${OM_SUFFIX}`;

  const [remaining, setRemaining] = useState(() => Math.max(0, reservedAt + RESERVATION_MS - Date.now()));
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paymentStatus !== "pending_payment") return;
    intervalRef.current = setInterval(() => {
      const left = Math.max(0, reservedAt + RESERVATION_MS - Date.now());
      setRemaining(left);
      if (left === 0) {
        clearInterval(intervalRef.current!);
        const all: any[] = JSON.parse(localStorage.getItem(storageKey) || "[]");
        const updated = all.map((e: any) => e.cohortId === cohorte.id ? { ...e, paymentStatus: "expired" } : e);
        localStorage.setItem(storageKey, JSON.stringify(updated));
        onStatusChange();
      }
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [paymentStatus, reservedAt, cohorte.id, storageKey, onStatusChange]);

  function handleCopy() {
    navigator.clipboard.writeText(omCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handlePaymentSubmitted() {
    const all: any[] = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const updated = all.map((e: any) => e.cohortId === cohorte.id ? { ...e, paymentStatus: "payment_submitted" } : e);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    onStatusChange();
  }

  const waText = encodeURIComponent(`Bonjour, j'ai effectué mon paiement pour la cohorte "${cohorte.title}". Voici ma preuve de paiement :`);
  const waLink = `https://wa.me/${WA_SUPPORT}?text=${waText}`;

  const cohortStatusColors: Record<string, string> = {
    active: "text-emerald-600 bg-emerald-50",
    upcoming: "text-amber-600 bg-amber-50",
    completed: "text-gray-600 bg-gray-100",
  };
  const cohortStatusLabel: Record<string, string> = { active: "En cours", upcoming: "À venir", completed: "Terminée" };

  const payBadge: Record<EnrollmentPaymentStatus, { label: string; cls: string }> = {
    pending_payment: { label: "En attente de paiement", cls: "text-orange-600 bg-orange-50 border border-orange-200" },
    payment_submitted: { label: "Paiement soumis", cls: "text-blue-600 bg-blue-50 border border-blue-200" },
    confirmed: { label: "Confirmée", cls: "text-emerald-600 bg-emerald-50 border border-emerald-200" },
    expired: { label: "Expirée", cls: "text-red-600 bg-red-50 border border-red-200" },
  };

  const isExpanded = paymentStatus === "pending_payment" || paymentStatus === "payment_submitted";

  return (
    <div className="rounded-xl border border-gray-100 hover:border-amber-200 hover:shadow-sm transition-all overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-4 p-4">
        <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
          {cohorte.coverImage && <img src={cohorte.coverImage} alt={cohorte.title} className="w-full h-full object-cover" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 line-clamp-1">{cohorte.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{cohorte.domain}{cohorte.duration ? ` • ${cohorte.duration}` : ""}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${payBadge[paymentStatus].cls}`}>
            {payBadge[paymentStatus].label}
          </span>
          {cohorte.status && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cohortStatusColors[cohorte.status] ?? cohortStatusColors.active}`}>
              {cohortStatusLabel[cohorte.status] ?? cohorte.status}
            </span>
          )}
        </div>
      </div>

      {/* Payment instructions (pending_payment only) */}
      {paymentStatus === "pending_payment" && (
        <div className="px-4 pb-4 space-y-3 border-t border-orange-100 bg-orange-50/40">
          {/* Countdown */}
          <div className="flex items-center justify-between pt-3">
            <span className="text-xs text-gray-600">Place réservée — expire dans</span>
            <span className={`text-sm font-mono font-bold ${remaining < 3600000 ? "text-red-600" : "text-orange-600"}`}>
              {formatCountdown(remaining)}
            </span>
          </div>

          {/* OM code box */}
          <div className="bg-white border border-orange-300 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Code Orange Money à composer</p>
            <p className="font-mono text-sm text-gray-900 break-all">{omCode}</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
              {copied ? "Copié !" : "Copier le code de paiement"}
            </button>
            <button
              onClick={handlePaymentSubmitted}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              J'ai effectué mon paiement
            </button>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              <Users className="w-4 h-4" />
              Contacter l'assistance
            </a>
          </div>
        </div>
      )}

      {/* Payment submitted info */}
      {paymentStatus === "payment_submitted" && (
        <div className="px-4 pb-4 border-t border-blue-100 bg-blue-50/40">
          <p className="text-xs text-blue-700 pt-3 mb-2">Votre paiement est en cours de vérification. Envoyez votre preuve via WhatsApp si ce n'est pas encore fait.</p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Users className="w-4 h-4" />
            Envoyer ma preuve de paiement
          </a>
        </div>
      )}

      {/* Expired info */}
      {paymentStatus === "expired" && (
        <div className="px-4 pb-4 border-t border-red-100 bg-red-50/40">
          <p className="text-xs text-red-600 pt-3">Votre réservation a expiré. La place a été libérée. Vous pouvez vous réinscrire si des places sont disponibles.</p>
        </div>
      )}
    </div>
  );
}
