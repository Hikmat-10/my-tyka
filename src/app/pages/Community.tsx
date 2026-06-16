import { Header } from "../components/Header";
import { SupportModal } from "../components/SupportModal";
import { CommunityFAQ } from "../components/CommunityFAQ";
import { TykaConnect } from "../components/TykaConnect";
import { Sparkles, ArrowLeft, Lock, MessageCircle, Search, Filter, MapPin, X, User as UserIcon, Mail, Phone, Linkedin, Globe, Facebook, Briefcase, Target, Users, Zap } from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useMemberAuth } from "../contexts/MemberAuthContext";
import { getAllMembers } from "../services/dataService";
import { type Member as MemberType } from "../contexts/MemberAuthContext";
import { motion, AnimatePresence } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";

export default function Community() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"membres" | "connect">("membres");
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("all");
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterActivity, setFilterActivity] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const { isAuthenticated } = useMemberAuth();

  // Charger les membres réels depuis localStorage
  const allMembers = getAllMembers();
  const validatedMembers = allMembers.filter((member: MemberType) => {
    const validationStatus = member.validationStatus || "active";
    const visibleInTrombinoscope = member.visibleInTrombinoscope !== undefined ? member.visibleInTrombinoscope : true;
    return validationStatus === "active" && visibleInTrombinoscope === true;
  });

  // Extraire les listes uniques pour les filtres
  const cities = useMemo(() => {
    const set = new Set(validatedMembers.map((m: MemberType) => m.city).filter(Boolean));
    return Array.from(set).sort() as string[];
  }, [validatedMembers.length]);

  const countries = useMemo(() => {
    const set = new Set(validatedMembers.map((m: MemberType) => m.country).filter(Boolean));
    return Array.from(set).sort() as string[];
  }, [validatedMembers.length]);

  const activities = useMemo(() => {
    const set = new Set(validatedMembers.map((m: MemberType) => m.activity).filter(Boolean));
    return Array.from(set).sort() as string[];
  }, [validatedMembers.length]);

  // Filtrer les membres
  const filteredMembers = useMemo(() => {
    return validatedMembers.filter((member: MemberType) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
        const expertiseMatch = (member.expertiseAreas || []).some(e => e.toLowerCase().includes(q));
        const interestsMatch = (member.interests || []).some(i => i.toLowerCase().includes(q));
        const currentWorkMatch = (member.currentWork || "").toLowerCase().includes(q);

        const match = fullName.includes(q) ||
          (member.activity || "").toLowerCase().includes(q) ||
          (member.city || "").toLowerCase().includes(q) ||
          (member.country || "").toLowerCase().includes(q) ||
          (member.bio || "").toLowerCase().includes(q) ||
          expertiseMatch ||
          interestsMatch ||
          currentWorkMatch;
        if (!match) return false;
      }
      if (filterActivity !== "all" && member.activity !== filterActivity) return false;
      if (filterCity !== "all" && member.city !== filterCity) return false;
      if (filterCountry !== "all" && member.country !== filterCountry) return false;
      return true;
    });
  }, [searchQuery, filterActivity, filterCity, filterCountry, validatedMembers.length]);

  const activeFiltersCount = [filterActivity, filterCity, filterCountry].filter(f => f !== "all").length;

  const resetFilters = () => {
    setFilterActivity("all");
    setFilterCity("all");
    setFilterCountry("all");
    setSearchQuery("");
  };

  const handleMemberClick = (member: MemberType) => {
    if (!isAuthenticated) {
      toast.error("Connexion requise", {
        description: "Vous devez être connecté pour voir les profils détaillés des membres",
        icon: <Lock className="w-4 h-4" />,
      });
      return;
    }
    setSelectedMember(member);
  };

  const initials = (m: MemberType) => `${m.firstName?.[0] || ""}${m.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/30">
      <Header />

      <main className="container mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour à l'accueil
        </button>

        {/* Sub-module Tabs */}
        <div className="flex gap-1 mb-6 bg-white/70 backdrop-blur-sm rounded-2xl p-2 border border-white/50 shadow-sm">
          <button
            onClick={() => setActiveTab("membres")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${activeTab === "membres" ? "bg-orange-500 text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}>
            <Users className="w-4 h-4" />Membres
          </button>
          <button
            onClick={() => setActiveTab("connect")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${activeTab === "connect" ? "bg-[#1B2A4A] text-white shadow-md" : "text-gray-600 hover:bg-gray-100"}`}>
            <Zap className="w-4 h-4" />TYKA Connect
          </button>
        </div>

        {activeTab === "connect" && <TykaConnect />}

        {activeTab === "membres" && <><div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-white/50">
          {/* En-tête */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Communauté TYKA</h1>
                  <p className="text-gray-600">
                    {filteredMembers.length} membre{filteredMembers.length > 1 ? "s" : ""} actif{filteredMembers.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const faqSection = document.getElementById("community-faq");
                  faqSection?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                FAQ
              </button>
            </div>

            {!isAuthenticated && (
              <p className="text-sm text-amber-600 mb-4 flex items-center gap-2 bg-amber-50 p-3 rounded-lg">
                <Lock className="w-4 h-4" />
                Connectez-vous pour accéder aux profils détaillés et contacter les membres
              </p>
            )}

            {/* Barre de recherche et filtres */}
            <div className="flex gap-3 mt-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, activité, ville..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 h-12 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 transition-colors"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`h-12 px-5 rounded-xl border flex items-center gap-2 text-sm transition-colors ${
                  showFilters || activeFiltersCount > 0
                    ? "border-orange-400 bg-orange-50 text-orange-600"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtres{activeFiltersCount > 0 && ` (${activeFiltersCount})`}
              </button>
            </div>

            {/* Panneau de filtres */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-5 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Activité</label>
                    <select
                      value={filterActivity}
                      onChange={e => setFilterActivity(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400"
                    >
                      <option value="all">Toutes</option>
                      {activities.map(activity => (
                        <option key={activity} value={activity}>{activity}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Ville</label>
                    <select
                      value={filterCity}
                      onChange={e => setFilterCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400"
                    >
                      <option value="all">Toutes</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Pays</label>
                    <select
                      value={filterCountry}
                      onChange={e => setFilterCountry(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400"
                    >
                      <option value="all">Tous</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="mt-4 flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700"
                  >
                    <X className="w-4 h-4" />
                    Réinitialiser les filtres
                  </button>
                )}
              </motion.div>
            )}
          </div>

          {/* Grille de membres */}
          {filteredMembers.length === 0 ? (
            <div className="text-center py-16">
              <UserIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-400">Aucun membre trouvé</p>
              {(searchQuery || activeFiltersCount > 0) && (
                <button
                  onClick={resetFilters}
                  className="mt-4 text-sm text-orange-600 hover:underline"
                >
                  Réinitialiser la recherche
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredMembers.map((member: MemberType) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => handleMemberClick(member)}
                >
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="w-20 h-20 mb-3 ring-2 ring-orange-100 group-hover:ring-orange-300 transition-all">
                      {member.profileImage && <AvatarImage src={member.profileImage} />}
                      <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-600 text-white text-lg font-semibold">
                        {initials(member)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {member.firstName} {member.lastName}
                    </h3>
                    {member.activity && (
                      <p className="text-xs text-gray-500 mt-1">{member.activity}</p>
                    )}
                    {(member.city || member.country) && (
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {[member.city, member.country].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {member.bio && (
                      <p className="text-xs text-gray-500 mt-3 line-clamp-2">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <div id="community-faq" className="mt-12 scroll-mt-8">
          <CommunityFAQ />
        </div>

        {/* Support Section */}
        {/* end membres white card */}
        <div className="mt-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                <MessageCircle className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Besoin d'aide ?</h2>
              </div>
              <p className="text-orange-50 mb-2">
                Notre équipe est là pour répondre à vos questions et vous accompagner
              </p>
              <p className="text-sm text-orange-100">
                Contactez-nous et nous vous recontacterons dans les plus brefs délais
              </p>
            </div>
            <button
              onClick={() => setShowSupportModal(true)}
              className="px-8 py-6 bg-white text-orange-600 rounded-xl font-bold text-lg hover:shadow-2xl transition-all flex items-center gap-3 group whitespace-nowrap"
            >
              <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
              Contactez-nous !
            </button>
          </div>
        </div></>}
      </main>


      {/* Modal détails membre */}
      <AnimatePresence>
        {selectedMember && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
            />
            <motion.div
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-50 shadow-2xl overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="sticky top-0 bg-gradient-to-br from-orange-500 to-amber-600 text-white p-6 z-10">
                <button
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex flex-col items-center text-center">
                  <Avatar className="w-24 h-24 mb-4 ring-4 ring-white/50">
                    {selectedMember.profileImage && <AvatarImage src={selectedMember.profileImage} />}
                    <AvatarFallback className="bg-white text-orange-600 text-2xl font-bold">
                      {initials(selectedMember)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold">{selectedMember.firstName} {selectedMember.lastName}</h2>
                  {selectedMember.activity && (
                    <p className="text-orange-100 mt-1">{selectedMember.activity}</p>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6">
                {(selectedMember.city || selectedMember.country) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Localisation</h3>
                    <p className="text-gray-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      {[selectedMember.city, selectedMember.country].filter(Boolean).join(", ")}
                    </p>
                  </div>
                )}

                {selectedMember.bio && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Biographie</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedMember.bio}</p>
                  </div>
                )}

                {selectedMember.expertiseAreas && selectedMember.expertiseAreas.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-orange-500" />
                      Domaines d'expertise
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.expertiseAreas.map((expertise, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                          {expertise}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMember.interests && selectedMember.interests.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Centres d'intérêt</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.interests.map((interest, index) => (
                        <Badge key={index} variant="outline" className="bg-orange-50 border-orange-200 text-orange-700">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMember.currentWork && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-orange-500" />
                      Ce sur quoi je travaille actuellement
                    </h3>
                    <p className="text-gray-700 leading-relaxed bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-orange-100">
                      {selectedMember.currentWork}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Contact</h3>
                  <div className="space-y-2">
                    {selectedMember.privacySettings?.showEmail && selectedMember.email && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4 text-orange-500" />
                        <a href={`mailto:${selectedMember.email}`} className="hover:text-orange-600 hover:underline">
                          {selectedMember.email}
                        </a>
                      </div>
                    )}
                    {selectedMember.privacySettings?.showWhatsApp && selectedMember.whatsapp && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MessageCircle className="w-4 h-4 text-orange-500" />
                        <a href={`https://wa.me/${selectedMember.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-orange-600 hover:underline">
                          {selectedMember.whatsapp}
                        </a>
                      </div>
                    )}
                    {selectedMember.privacySettings?.showPhone && selectedMember.phone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-orange-500" />
                        <a href={`tel:${selectedMember.phone}`} className="hover:text-orange-600 hover:underline">
                          {selectedMember.phone}
                        </a>
                      </div>
                    )}
                    {(!selectedMember.privacySettings?.showEmail && !selectedMember.privacySettings?.showWhatsApp && !selectedMember.privacySettings?.showPhone) && (
                      <p className="text-sm text-gray-400 italic">Les coordonnées de ce membre ne sont pas publiques</p>
                    )}
                  </div>
                </div>

                {(selectedMember.linkedin || selectedMember.facebook || selectedMember.website || (selectedMember.otherLinks && selectedMember.otherLinks.length > 0)) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Liens professionnels</h3>
                    <div className="space-y-2">
                      {selectedMember.linkedin && (
                        <a
                          href={selectedMember.linkedin.startsWith('http') ? selectedMember.linkedin : `https://${selectedMember.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-gray-700 hover:text-blue-600 hover:underline"
                        >
                          <Linkedin className="w-4 h-4 text-blue-600" />
                          LinkedIn
                        </a>
                      )}
                      {selectedMember.facebook && (
                        <a
                          href={selectedMember.facebook.startsWith('http') ? selectedMember.facebook : `https://${selectedMember.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-gray-700 hover:text-blue-700 hover:underline"
                        >
                          <Facebook className="w-4 h-4 text-blue-700" />
                          Facebook
                        </a>
                      )}
                      {selectedMember.website && (
                        <a
                          href={selectedMember.website.startsWith('http') ? selectedMember.website : `https://${selectedMember.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-gray-700 hover:text-orange-600 hover:underline"
                        >
                          <Globe className="w-4 h-4 text-orange-500" />
                          Site web
                        </a>
                      )}
                      {selectedMember.otherLinks && selectedMember.otherLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link.startsWith('http') ? link : `https://${link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-gray-700 hover:text-orange-600 hover:underline"
                        >
                          <Globe className="w-4 h-4 text-gray-400" />
                          {link.length > 40 ? link.substring(0, 40) + '...' : link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMember.joinedAt && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Membre depuis</h3>
                    <p className="text-gray-700">{new Date(selectedMember.joinedAt).toLocaleDateString("fr-FR", {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SupportModal
        open={showSupportModal}
        onOpenChange={setShowSupportModal}
      />
    </div>
  );
}
