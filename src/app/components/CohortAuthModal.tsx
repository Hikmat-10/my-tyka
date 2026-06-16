import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { VisuallyHidden } from "./ui/visually-hidden";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { LogIn, UserPlus, X, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";

interface CohortAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export function CohortAuthModal({ isOpen, onClose, onAuthenticated }: CohortAuthModalProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"choice" | "login" | "signup">("choice");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    nom: "",
    prenom: "",
    email: "",
    whatsapp: "",
    password: "",
    confirmPassword: "",
    ambassadorCode: "",
    emailVisible: true,
    whatsappVisible: true,
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier les identifiants
    const users = JSON.parse(localStorage.getItem("tykaUsers") || "[]");
    const user = users.find(
      (u: any) => u.email === loginData.email && u.password === loginData.password
    );

    if (user) {
      localStorage.setItem("tykaCurrentUser", JSON.stringify(user));
      toast.success("Connexion réussie !", {
        description: `Bienvenue ${user.prenom} ${user.nom}`,
      });
      onAuthenticated();
      onClose();
      handleReset();
    } else {
      toast.error("Email ou mot de passe incorrect");
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    if (signupData.password !== signupData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (signupData.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    const users = JSON.parse(localStorage.getItem("tykaUsers") || "[]");
    
    // Vérifier si l'email existe déjà
    if (users.some((u: any) => u.email === signupData.email)) {
      toast.error("Un compte existe déjà avec cet email");
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      nom: signupData.nom,
      prenom: signupData.prenom,
      email: signupData.email,
      whatsapp: signupData.whatsapp,
      password: signupData.password,
      ambassadorReferralCode: signupData.ambassadorCode || undefined,
      emailVisible: signupData.emailVisible,
      whatsappVisible: signupData.whatsappVisible,
      dateInscription: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem("tykaUsers", JSON.stringify(users));
    localStorage.setItem("tykaCurrentUser", JSON.stringify(newUser));

    toast.success("🎉 Compte créé avec succès !", {
      description: `Bienvenue dans la communauté TYKA !`,
    });

    onAuthenticated();
    onClose();
    handleReset();
  };

  const handleReset = () => {
    setMode("choice");
    setLoginData({ email: "", password: "" });
    setSignupData({
      nom: "",
      prenom: "",
      email: "",
      whatsapp: "",
      password: "",
      confirmPassword: "",
      ambassadorCode: "",
      emailVisible: true,
      whatsappVisible: true,
    });
  };

  const handleClose = () => {
    onClose();
    setTimeout(handleReset, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Rejoindre TYKA</DialogTitle>
          <DialogDescription>
            Connectez-vous ou créez un compte pour rejoindre une cohorte
          </DialogDescription>
        </VisuallyHidden>

        {/* Header */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold mb-1">Rejoindre TYKA</h2>
          <p className="text-green-100 text-sm">
            {mode === "choice" && "Connectez-vous ou créez un compte"}
            {mode === "login" && "Accédez à votre espace membre"}
            {mode === "signup" && "Rejoignez la communauté d'apprentissage"}
          </p>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Choice View */}
            {mode === "choice" && (
              <motion.div 
                key="choice"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="grid md:grid-cols-2 gap-4"
              >
                {/* Login Option */}
                <motion.button
                  onClick={() => setMode("login")}
                  className="group relative overflow-hidden bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-500 group-hover:scale-110 transition-all">
                      <LogIn className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Se connecter</h3>
                      <p className="text-sm text-gray-600">
                        J'ai déjà un compte TYKA
                      </p>
                    </div>
                  </div>
                </motion.button>

                {/* Signup Option */}
                <motion.button
                  onClick={() => setMode("signup")}
                  className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 hover:border-green-500 hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-500 group-hover:scale-110 transition-all">
                      <UserPlus className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Créer un compte</h3>
                      <p className="text-sm text-gray-600">
                        Nouveau sur TYKA
                      </p>
                    </div>
                  </div>
                </motion.button>
              </motion.div>
            )}

            {/* Login Form */}
            {mode === "login" && (
              <motion.form 
                key="login"
                onSubmit={handleLogin} 
                className="space-y-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      placeholder="votre@email.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="login-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="••••••••"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMode("choice")}
                    className="flex-1"
                  >
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Se connecter
                  </Button>
                </div>

                <p className="text-center text-sm text-gray-500 pt-2">
                  Pas encore de compte ?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-green-600 font-medium hover:underline"
                  >
                    Créer un compte
                  </button>
                </p>
              </motion.form>
            )}

            {/* Signup Form */}
            {mode === "signup" && (
              <motion.form 
                key="signup"
                onSubmit={handleSignup} 
                className="space-y-4 max-h-[60vh] overflow-y-auto pr-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="prenom">Prnom *</Label>
                    <Input
                      id="prenom"
                      value={signupData.prenom}
                      onChange={(e) => setSignupData({ ...signupData, prenom: e.target.value })}
                      placeholder="Jean"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nom">Nom *</Label>
                    <Input
                      id="nom"
                      value={signupData.nom}
                      onChange={(e) => setSignupData({ ...signupData, nom: e.target.value })}
                      placeholder="Dupont"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email *</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    placeholder="votre@email.com"
                    required
                  />
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="email-visible"
                      checked={signupData.emailVisible}
                      onCheckedChange={(checked) =>
                        setSignupData({ ...signupData, emailVisible: checked as boolean })
                      }
                    />
                    <label htmlFor="email-visible" className="text-sm text-gray-600 cursor-pointer">
                      Rendre mon email visible aux autres membres
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp *</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    value={signupData.whatsapp}
                    onChange={(e) => setSignupData({ ...signupData, whatsapp: e.target.value })}
                    placeholder="+221 XX XXX XX XX"
                    required
                  />
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="whatsapp-visible"
                      checked={signupData.whatsappVisible}
                      onCheckedChange={(checked) =>
                        setSignupData({ ...signupData, whatsappVisible: checked as boolean })
                      }
                    />
                    <label htmlFor="whatsapp-visible" className="text-sm text-gray-600 cursor-pointer">
                      Rendre mon WhatsApp visible aux autres membres
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Mot de passe *</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    placeholder="Minimum 6 caractères"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmer le mot de passe *</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    placeholder="Répétez votre mot de passe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ambassador-code">Code ambassadeur (si disponible)</Label>
                  <Input
                    id="ambassador-code"
                    type="text"
                    value={signupData.ambassadorCode}
                    onChange={(e) => setSignupData({ ...signupData, ambassadorCode: e.target.value })}
                    placeholder="Ex: AMB-DAKAR-2024"
                  />
                  <p className="text-xs text-gray-500">Optionnel : renseignez uniquement si vous possédez un code ambassadeur</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMode("choice")}
                    className="flex-1"
                  >
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Créer mon compte
                  </Button>
                </div>

                <p className="text-center text-sm text-gray-500 pt-2">
                  Déjà un compte ?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Se connecter
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}