import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useMemberAuth } from "../contexts/MemberAuthContext";
import { Mail, CheckCircle } from "lucide-react";

interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBackToLogin?: () => void;
}

export function ForgotPasswordModal({ open, onOpenChange, onBackToLogin }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { requestPasswordReset } = useMemberAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await requestPasswordReset(email);
      
      if (result.success) {
        setEmailSent(true);
        toast.success("Email de récupération envoyé !");
      } else {
        toast.error(result.error || "Erreur lors de l'envoi");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setEmailSent(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            Mot de passe oublié
          </DialogTitle>
          <DialogDescription>
            {emailSent 
              ? "Consultez votre boîte email pour réinitialiser votre mot de passe"
              : "Entrez votre email pour recevoir un lien de réinitialisation"
            }
          </DialogDescription>
        </DialogHeader>

        {emailSent ? (
          <div className="space-y-4 mt-4">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-center text-gray-600 mb-2">
                Un email a été envoyé à <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-500 text-center">
                Vérifiez votre boîte de réception et suivez les instructions pour réinitialiser votre mot de passe.
              </p>
            </div>

            <Button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg"
            >
              Fermer
            </Button>

            <button
              onClick={() => {
                handleClose();
                onBackToLogin?.();
              }}
              className="w-full text-sm text-amber-600 hover:underline text-center"
            >
              Retour à la connexion
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email" className="text-sm font-medium">
                Adresse email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@example.com"
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500">
                Vous recevrez un lien de réinitialisation par email
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
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
                {isLoading ? "Envoi..." : "Envoyer"}
              </Button>
            </div>

            <button
              type="button"
              onClick={() => {
                handleClose();
                onBackToLogin?.();
              }}
              className="w-full text-sm text-amber-600 hover:underline text-center"
            >
              Retour à la connexion
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
