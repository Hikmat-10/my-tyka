import { X, Globe, Linkedin, Facebook, Twitter, ExternalLink, Building2, Handshake, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Partner } from "../services/dataService";

interface PartnerModalProps {
  partner: Partner | null;
  cohortTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onViewOtherCohorts?: () => void;
}

const partnershipLabels: Record<Partner["partnershipType"], { label: string; color: string }> = {
  propulsée: { label: "Propulsée par", color: "bg-amber-100 text-amber-800 border-amber-200" },
  partenariat: { label: "En partenariat avec", color: "bg-blue-100 text-blue-800 border-blue-200" },
  soutenue: { label: "Soutenue par", color: "bg-green-100 text-green-800 border-green-200" },
  parrainée: { label: "Parrainée par", color: "bg-purple-100 text-purple-800 border-purple-200" },
};

export function PartnerModal({ partner, cohortTitle, isOpen, onClose, onViewOtherCohorts }: PartnerModalProps) {
  if (!partner) return null;

  const typeInfo = partnershipLabels[partner.partnershipType];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white z-50 shadow-2xl overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                <span className="font-semibold text-gray-900">Fiche Partenaire</span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Partner Identity */}
              <div className="text-center pb-6 border-b border-gray-100">
                {partner.logo ? (
                  <img src={partner.logo} alt={partner.name} className="w-20 h-20 object-contain mx-auto mb-4 rounded-xl border border-gray-200 p-2" />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">{partner.name.charAt(0)}</span>
                  </div>
                )}
                <h2 className="text-2xl text-gray-900 mb-1">{partner.name}</h2>
                {partner.slogan && (
                  <p className="text-gray-500 italic text-sm mb-3">"{partner.slogan}"</p>
                )}
                {partner.sector && (
                  <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm border border-amber-200">
                    {partner.sector}
                  </span>
                )}
              </div>

              {/* Partnership Type */}
              {cohortTitle && (
                <div className={`rounded-xl p-4 border ${typeInfo.color}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Handshake className="w-4 h-4" />
                    <span className="font-semibold text-sm">{typeInfo.label} {partner.name}</span>
                  </div>
                  <p className="text-sm opacity-80">Cohorte : {cohortTitle}</p>
                </div>
              )}

              {/* Description */}
              {partner.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">À propos</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{partner.description}</p>
                </div>
              )}

              {/* Institutional Presentation */}
              {partner.institutionalPresentation && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">Présentation institutionnelle</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{partner.institutionalPresentation}</p>
                </div>
              )}

              {/* Role in cohort */}
              {partner.role && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <h3 className="font-semibold text-amber-800 mb-2 text-sm uppercase tracking-wide">Rôle dans la cohorte</h3>
                  <p className="text-amber-900 text-sm leading-relaxed">{partner.role}</p>
                </div>
              )}

              {/* Products / Services */}
              {partner.productsServices && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wide">Produits & Services</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{partner.productsServices}</p>
                </div>
              )}

              {/* Links */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                {partner.website && (
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors group"
                  >
                    <Globe className="w-5 h-5" />
                    <span className="font-medium">Visiter le site web</span>
                    <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}

                {/* Social Media */}
                {partner.socialMedia && (
                  <div className="flex gap-2">
                    {partner.socialMedia.linkedin && (
                      <a
                        href={`https://linkedin.com/company/${partner.socialMedia.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#0077b5] text-white rounded-xl hover:opacity-90 transition-opacity"
                      >
                        <Linkedin className="w-4 h-4" />
                        <span className="text-sm font-medium">LinkedIn</span>
                      </a>
                    )}
                    {partner.socialMedia.facebook && (
                      <a
                        href={`https://facebook.com/${partner.socialMedia.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1877F2] text-white rounded-xl hover:opacity-90 transition-opacity"
                      >
                        <Facebook className="w-4 h-4" />
                        <span className="text-sm font-medium">Facebook</span>
                      </a>
                    )}
                    {partner.socialMedia.twitter && (
                      <a
                        href={`https://x.com/${partner.socialMedia.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-xl hover:opacity-90 transition-opacity"
                      >
                        <Twitter className="w-4 h-4" />
                        <span className="text-sm font-medium">X</span>
                      </a>
                    )}
                  </div>
                )}

                {onViewOtherCohorts && (
                  <button
                    onClick={() => { onViewOtherCohorts(); onClose(); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium text-sm"
                  >
                    Voir les autres cohortes de ce partenaire
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
