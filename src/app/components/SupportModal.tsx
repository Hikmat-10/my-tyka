import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { MessageCircle, Phone, Send, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SupportModal({ open, onOpenChange }: SupportModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    message: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!formData.message.trim() || !formData.phone.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      setIsLoading(false);
      return;
    }

    try {
      // Préparer le message pour l'envoi
      const emailBody = `
📞 NOUVEAU MESSAGE DE SUPPORT - TYKA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 Numéro de téléphone : ${formData.phone}

💬 Message :
${formData.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date : ${new Date().toLocaleString('fr-FR')}
      `.trim();

      // Créer un lien mailto (fallback si pas de backend)
      const mailtoLink = `mailto:contactinfo@mytyka.org?subject=${encodeURIComponent('Nouveau message de support TYKA')}&body=${encodeURIComponent(emailBody)}`;

      // Simuler l'envoi (en production, cela devrait être un appel API)
      // Pour l'instant, on ouvre le client email par défaut
      window.location.href = mailtoLink;

      // Enregistrer dans localStorage pour tracking
      const supportMessages = JSON.parse(localStorage.getItem("tykaSupportMessages") || "[]");
      supportMessages.push({
        id: `support_${Date.now()}`,
        phone: formData.phone,
        message: formData.message,
        timestamp: new Date().toISOString(),
        status: "sent"
      });
      localStorage.setItem("tykaSupportMessages", JSON.stringify(supportMessages));

      // Afficher succès
      setShowSuccess(true);
      toast.success("Message envoyé avec succès !");

      // Réinitialiser le formulaire
      setTimeout(() => {
        setFormData({ message: "", phone: "" });
        setShowSuccess(false);
        onOpenChange(false);
      }, 2000);

    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {showSuccess ? (
          <div className="flex flex-col items-center text-center space-y-4 py-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center animate-pulse">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Message envoyé ! ✅
            </DialogTitle>
            <p className="text-gray-600">
              Nous avons bien reçu votre message. Notre équipe vous recontactera très bientôt.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-gray-900">
                    Contactez-nous !
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    Notre équipe est là pour vous aider
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Numéro de téléphone */}
              <div className="space-y-2">
                <Label htmlFor="support-phone" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-600" />
                  Numéro de téléphone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="support-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+221 77 123 45 67"
                  required
                  disabled={isLoading}
                  className="border-2 focus:border-amber-500"
                />
                <p className="text-xs text-gray-500">
                  📞 Nous vous recontacterons sur ce numéro
                </p>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="support-message" className="text-sm font-medium flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-amber-600" />
                  Votre message <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="support-message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Décrivez votre demande ou votre question..."
                  rows={5}
                  required
                  disabled={isLoading}
                  className="border-2 focus:border-amber-500 resize-none"
                />
                <p className="text-xs text-gray-500">
                  💬 Soyez aussi précis que possible pour une réponse rapide
                </p>
              </div>

              {/* Informations de contact */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  📧 Vous pouvez aussi nous contacter directement :
                </p>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>✉️ Email : <a href="mailto:contactinfo@mytyka.org" className="underline hover:text-blue-600">contactinfo@mytyka.org</a></p>
                  <p>📞 Téléphone : <a href="tel:74049595" className="underline hover:text-blue-600">74 04 95 95</a></p>
                </div>
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Envoi..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Envoyer
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
