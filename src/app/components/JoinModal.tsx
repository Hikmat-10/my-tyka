import { X, CheckCircle, Copy, MessageCircle, Clock, AlertTriangle, CheckCircle2, XCircle, Smartphone } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { VisuallyHidden } from "./ui/visually-hidden";
import { useState, useEffect } from "react";
import { useMemberAuth } from "../contexts/MemberAuthContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

const ORANGE_MONEY_PREFIX = "*144*10*74049595*";
const ORANGE_MONEY_SUFFIX = "#";
const WHATSAPP_SUPPORT = "74049505";
const RESERVATION_HOURS = 48;

export type EnrollmentPaymentStatus = "pending_payment" | "payment_submitted" | "confirmed" | "expired";

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  cohorte: {
    id: string;
    title: string;
    domain?: string;
    modality?: string;
    price?: number;
    currency?: string;
    deadline?: string;
  } | null;
}

function buildOmCode(price: number): string {
  return `${ORANGE_MONEY_PREFIX}${price}${ORANGE_MONEY_SUFFIX}`;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00h 00min 00s";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}min ${String(s).padStart(2, "0")}s`;
}

export function JoinModal({ isOpen, onClose, cohorte }: JoinModalProps) {
  const { member } = useMemberAuth();
  const [step, setStep] = useState<"form" | "payment" | "submitted">("form");
  const [contactName, setContactName] = useState("");
  const [contactWhatsApp, setContactWhatsApp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [reservedAt, setReservedAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const price = cohorte?.price ?? 0;
  const omCode = buildOmCode(price);
  const waLink = `https://wa.me/${WHATSAPP_SUPPORT}?text=${encodeURIComponent(`Bonjour, j'ai effectué un paiement Orange Money pour la cohorte "${cohorte?.title}". Voici ma preuve de paiement.`)}`;

  // Auto-detect existing enrollment
  useEffect(() => {
    if (!isOpen || !member || !cohorte) return;
    const storageKey = `tykaCohortEnrollments_${member.id}`;
    const enrollments = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const existing = enrollments.find((e: any) => e.cohortId === cohorte.id);
    if (existing) {
      const ps = existing.paymentStatus as EnrollmentPaymentStatus;
      if (ps === "pending_payment") {
        setReservedAt(existing.reservedAt);
        setStep("payment");
      } else if (ps === "payment_submitted") {
        setStep("submitted");
      }
    }
  }, [isOpen, member?.id, cohorte?.id]);

  // Countdown timer
  useEffect(() => {
    if (step !== "payment" || !reservedAt) return;
    const expiry = new Date(reservedAt).getTime() + RESERVATION_HOURS * 3600 * 1000;
    const tick = () => setCountdown(Math.max(0, expiry - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [step, reservedAt]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || !cohorte) return;

    const storageKey = `tykaCohortEnrollments_${member.id}`;
    const enrollments = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const alreadyEnrolled = enrollments.some((e: any) => e.cohortId === cohorte.id);
    if (alreadyEnrolled) { toast.info("Vous êtes déjà inscrit à cette cohorte"); return; }

    const now = new Date().toISOString();
    const enrollment = {
      cohortId: cohorte.id,
      cohortTitle: cohorte.title,
      cohortDomain: cohorte.domain || "",
      cohortModality: cohorte.modality || "",
      price: cohorte.price || 0,
      currency: cohorte.currency || "FCFA",
      deadline: cohorte.deadline || "",
      enrolledAt: now,
      reservedAt: now,
      paymentStatus: "pending_payment" as EnrollmentPaymentStatus,
      status: "upcoming",
      progress: 0,
      contactName,
      contactWhatsApp,
    };

    localStorage.setItem(storageKey, JSON.stringify([...enrollments, enrollment]));
    setReservedAt(now);
    toast.success("Préinscription enregistrée — place réservée 48h !");
    setStep("payment");
  };

  const handlePaymentSubmitted = () => {
    if (!member || !cohorte) return;
    const storageKey = `tykaCohortEnrollments_${member.id}`;
    const enrollments = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const updated = enrollments.map((e: any) =>
      e.cohortId === cohorte.id ? { ...e, paymentStatus: "payment_submitted", paymentSubmittedAt: new Date().toISOString() } : e
    );
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setStep("submitted");
    toast.success("Preuve de paiement enregistrée — notre équipe va vérifier !");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(omCode).then(() => {
      setCopied(true);
      toast.success("Code copié !");
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      toast.error("Impossible de copier automatiquement, copiez manuellement");
    });
  };

  const handleClose = () => {
    setStep("form");
    setContactName("");
    setContactWhatsApp("");
    setReservedAt(null);
    onClose();
  };

  const isExpired = countdown === 0 && reservedAt !== null && step === "payment";
  const urgencyColor = countdown < 3600000 ? "text-red-600" : countdown < 21600000 ? "text-orange-600" : "text-amber-600";

  if (!cohorte) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl">
        <VisuallyHidden>
          <DialogTitle>Rejoindre {cohorte.title}</DialogTitle>
          <DialogDescription>Inscription à la cohorte et informations de paiement</DialogDescription>
        </VisuallyHidden>

        <AnimatePresence mode="wait">
          {/* === STEP 1: Form === */}
          {step === "form" && (
            <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="bg-gradient-to-br from-[#1a0e05] to-[#2d1810] px-6 py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-white text-lg font-semibold mb-1">Préinscription</h2>
                    <p className="text-amber-200/80 text-sm line-clamp-1">{cohorte.title}</p>
                  </div>
                  <button onClick={handleClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center flex-shrink-0 ml-4">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                {price > 0 && (
                  <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-amber-500/20 rounded-xl border border-amber-400/30">
                    <Smartphone className="w-4 h-4 text-amber-300 flex-shrink-0" />
                    <span className="text-amber-200 text-sm">Montant à régler : <strong>{price.toLocaleString("fr-FR")} {cohorte.currency || "FCFA"}</strong></span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                  <p className="text-sm text-amber-800 leading-relaxed">
                    <strong>🔒 Votre place est réservée pendant 48 heures</strong> après votre préinscription.
                    Suivez ensuite les instructions de paiement Orange Money pour confirmer définitivement votre place.
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet *</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      required
                      placeholder="Votre nom et prénom"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Numéro WhatsApp *</label>
                    <input
                      type="tel"
                      value={contactWhatsApp}
                      onChange={e => setContactWhatsApp(e.target.value)}
                      required
                      placeholder="+226 XX XX XX XX"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-[#D4522A] to-[#8B2500] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-orange-900/20"
                  >
                    Confirmer ma préinscription →
                  </button>
                  <p className="text-xs text-gray-400 text-center">Aucun paiement immédiat — vous serez guidé à l'étape suivante.</p>
                </form>
              </div>
            </motion.div>
          )}

          {/* === STEP 2: Payment Instructions === */}
          {step === "payment" && (
            <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {/* Header */}
              <div className="bg-gradient-to-br from-[#1a0e05] to-[#2d1810] px-6 py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300 text-xs font-semibold uppercase tracking-wide">Préinscription enregistrée</span>
                    </div>
                    <h2 className="text-white font-semibold">Instructions de paiement</h2>
                    <p className="text-white/60 text-xs mt-0.5 line-clamp-1">{cohorte.title}</p>
                  </div>
                  <button onClick={handleClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center flex-shrink-0 ml-4">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Countdown */}
                <div className={`rounded-xl border-2 p-4 flex items-center gap-4 ${isExpired ? "bg-red-50 border-red-200" : countdown < 3600000 ? "bg-red-50 border-red-300" : "bg-amber-50 border-amber-200"}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isExpired ? "bg-red-100" : "bg-amber-100"}`}>
                    {isExpired ? <XCircle className="w-5 h-5 text-red-500" /> : <Clock className="w-5 h-5 text-amber-600" />}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Temps restant pour confirmer</p>
                    <p className={`font-bold text-lg tabular-nums ${isExpired ? "text-red-600" : urgencyColor}`}>
                      {isExpired ? "Réservation expirée" : formatCountdown(countdown)}
                    </p>
                    {!isExpired && countdown < 86400000 && (
                      <p className="text-xs text-red-600 mt-0.5 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Urgence — payez maintenant pour garder votre place !
                      </p>
                    )}
                  </div>
                </div>

                {!isExpired && (
                  <>
                    {/* Instructions Text */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Votre préinscription a été enregistrée avec succès.<br />
                        Votre place dans cette cohorte est <strong>réservée pendant 48 heures</strong>.
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed mt-2">
                        Pour confirmer définitivement votre inscription, veuillez effectuer votre paiement via <strong>Orange Money</strong> en composant le code suivant :
                      </p>
                    </div>

                    {/* Orange Money Code */}
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white">
                      <div className="flex items-center gap-2 mb-3">
                        <Smartphone className="w-5 h-5 text-orange-100" />
                        <span className="text-orange-100 text-xs font-semibold uppercase tracking-wide">Code Orange Money</span>
                      </div>
                      <div className="bg-black/20 rounded-xl px-4 py-3 mb-4 text-center">
                        <span className="font-mono text-xl font-bold tracking-wider text-white">
                          {ORANGE_MONEY_PREFIX}<span className="text-orange-200">{price}</span>{ORANGE_MONEY_SUFFIX}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-center text-xs text-orange-200/80 mb-4">
                        <div><span className="block text-white font-semibold">{price.toLocaleString("fr-FR")} {cohorte.currency || "FCFA"}</span>Montant</div>
                        <div><span className="block text-white font-semibold">74049595</span>Numéro destinataire</div>
                      </div>
                      <button
                        onClick={handleCopyCode}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                          copied ? "bg-emerald-500 text-white" : "bg-white text-orange-600 hover:bg-orange-50"
                        }`}
                      >
                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Code copié !" : "Copier le code de paiement"}
                      </button>
                    </div>

                    {/* After payment instructions */}
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <p className="text-sm text-blue-800 leading-relaxed mb-3">
                        Après paiement, envoyez une <strong>capture d'écran de la transaction</strong> par WhatsApp au :
                      </p>
                      <div className="bg-white rounded-lg px-4 py-2 border border-blue-200 text-center mb-3">
                        <span className="font-bold text-blue-900 text-lg">📱 {WHATSAPP_SUPPORT}</span>
                      </div>
                      <p className="text-xs text-blue-600">Passé le délai de 48h sans paiement, votre réservation sera automatiquement annulée.</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={handlePaymentSubmitted}
                        className="flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-emerald-900/20"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        J'ai effectué mon paiement
                      </button>
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 py-3 border-2 border-emerald-400 text-emerald-700 rounded-xl font-medium text-sm hover:bg-emerald-50 transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Contacter l'assistance WhatsApp
                      </a>
                    </div>
                  </>
                )}

                {isExpired && (
                  <div className="text-center py-6">
                    <XCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm mb-4">
                      Votre réservation a expiré. La place a été remise à disposition.
                    </p>
                    <button
                      onClick={() => setStep("form")}
                      className="px-6 py-3 bg-gradient-to-r from-[#D4522A] to-[#8B2500] text-white rounded-xl text-sm font-semibold"
                    >
                      Recommencer l'inscription
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* === STEP 3: Payment Submitted === */}
          {step === "submitted" && (
            <motion.div key="submitted" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Paiement soumis !</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Notre équipe va vérifier votre paiement dans les <strong>24 heures</strong>.
                Vous recevrez une confirmation par WhatsApp au <strong>{contactWhatsApp || "numéro indiqué"}</strong>.
              </p>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mb-6 text-left">
                <div className="flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-blue-800 mb-1">Suivi de votre inscription</p>
                    <p className="text-xs text-blue-700">Votre inscription apparaît dans « Mes Cohortes » avec le statut <em>Paiement soumis</em> jusqu'à confirmation.</p>
                  </div>
                </div>
              </div>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 border-2 border-emerald-400 text-emerald-700 rounded-xl font-medium text-sm hover:bg-emerald-50 transition-colors mb-3"
              >
                <MessageCircle className="w-4 h-4" />
                Envoyer ma preuve de paiement
              </a>
              <div>
                <button onClick={handleClose} className="text-sm text-gray-400 hover:text-gray-600 mt-2">Fermer</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
