import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useMemberAuth } from "../contexts/MemberAuthContext";

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onForgotPassword?: () => void;
  onRegister?: () => void;
}

export function LoginModal({ open, onOpenChange, onForgotPassword, onRegister }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const { login } = useMemberAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setLoginError("");
    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success("Connexion réussie !");
        onOpenChange(false);
        navigate("/dashboard");
      } else {
        const msg = result.error || "Identifiants incorrects";
        setLoginError(msg);
        // Only show toast for non-pending errors
        if (!msg.includes("attente de validation")) toast.error(msg);
      }
    } catch {
      setLoginError("Une erreur est survenue. Réessayez.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
            Connexion
          </DialogTitle>
          <DialogDescription>
            Connectez-vous pour accéder à votre espace membre
          </DialogDescription>
        </DialogHeader>

        {loginError && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${loginError.includes("attente de validation") ? "bg-amber-50 border border-amber-200 text-amber-800" : "bg-red-50 border border-red-200 text-red-700"}`}>
            {loginError.includes("attente de validation") && <p className="font-semibold mb-1">⏳ Compte en attente de validation</p>}
            {loginError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-sm font-medium">
              Adresse email
            </Label>
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password" className="text-sm font-medium">
              Mot de passe
            </Label>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onForgotPassword?.();
            }}
            className="text-sm text-amber-600 hover:underline"
          >
            Mot de passe oublié ?
          </button>

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
              {isLoading ? "Connexion..." : "Se connecter"}
            </Button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500 mt-4">
          Pas encore de compte ?{" "}
          <button
            onClick={() => {
              onOpenChange(false);
              onRegister?.();
            }}
            className="text-amber-600 hover:underline"
          >
            Créer un compte
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}