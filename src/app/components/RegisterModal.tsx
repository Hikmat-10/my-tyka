import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Upload, User, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useMemberAuth } from "../contexts/MemberAuthContext";

interface RegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Liste complète des pays
const COUNTRIES = [
  "Afghanistan", "Afrique du Sud", "Albanie", "Algérie", "Allemagne", "Andorre", "Angola", "Antigua-et-Barbuda", "Arabie Saoudite", "Argentine", "Arménie", "Australie", "Autriche", "Azerbaïdjan",
  "Bahamas", "Bahreïn", "Bangladesh", "Barbade", "Belgique", "Belize", "Bénin", "Bhoutan", "Biélorussie", "Bolivie", "Bosnie-Herzégovine", "Botswana", "Brésil", "Brunei", "Bulgarie", "Burkina Faso", "Burundi",
  "Cambodge", "Cameroun", "Canada", "Cap-Vert", "Centrafrique", "Chili", "Chine", "Chypre", "Colombie", "Comores", "Congo", "Corée du Nord", "Corée du Sud", "Costa Rica", "Côte d'Ivoire", "Croatie", "Cuba",
  "Danemark", "Djibouti", "Dominique",
  "Égypte", "Émirats Arabes Unis", "Équateur", "Érythrée", "Espagne", "Estonie", "Eswatini", "États-Unis", "Éthiopie",
  "Fidji", "Finlande", "France",
  "Gabon", "Gambie", "Géorgie", "Ghana", "Grèce", "Grenade", "Guatemala", "Guinée", "Guinée-Bissau", "Guinée équatoriale", "Guyana",
  "Haïti", "Honduras", "Hongrie",
  "Îles Marshall", "Îles Salomon", "Inde", "Indonésie", "Irak", "Iran", "Irlande", "Islande", "Israël", "Italie",
  "Jamaïque", "Japon", "Jordanie",
  "Kazakhstan", "Kenya", "Kirghizistan", "Kiribati", "Koweït",
  "Laos", "Lesotho", "Lettonie", "Liban", "Liberia", "Libye", "Liechtenstein", "Lituanie", "Luxembourg",
  "Macédoine du Nord", "Madagascar", "Malaisie", "Malawi", "Maldives", "Mali", "Malte", "Maroc", "Maurice", "Mauritanie", "Mexique", "Micronésie", "Moldavie", "Monaco", "Mongolie", "Monténégro", "Mozambique", "Myanmar",
  "Namibie", "Nauru", "Népal", "Nicaragua", "Niger", "Nigeria", "Norvège", "Nouvelle-Zélande",
  "Oman", "Ouganda", "Ouzbékistan",
  "Pakistan", "Palaos", "Palestine", "Panama", "Papouasie-Nouvelle-Guinée", "Paraguay", "Pays-Bas", "Pérou", "Philippines", "Pologne", "Portugal",
  "Qatar",
  "République Démocratique du Congo", "République Dominicaine", "République Tchèque", "Roumanie", "Royaume-Uni", "Russie", "Rwanda",
  "Saint-Christophe-et-Niévès", "Saint-Marin", "Saint-Vincent-et-les-Grenadines", "Sainte-Lucie", "Salvador", "Samoa", "São Tomé-et-Príncipe", "Sénégal", "Serbie", "Seychelles", "Sierra Leone", "Singapour", "Slovaquie", "Slovénie", "Somalie", "Soudan", "Soudan du Sud", "Sri Lanka", "Suède", "Suisse", "Suriname", "Syrie",
  "Tadjikistan", "Tanzanie", "Tchad", "Thaïlande", "Timor oriental", "Togo", "Tonga", "Trinité-et-Tobago", "Tunisie", "Turkménistan", "Turquie", "Tuvalu",
  "Ukraine", "Uruguay",
  "Vanuatu", "Vatican", "Venezuela", "Viêt Nam",
  "Yémen",
  "Zambie", "Zimbabwe"
];

// Sources d'acquisition
const ACQUISITION_SOURCES = [
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "bouche_a_oreille", label: "Bouche à oreille" },
  { value: "ambassadeur", label: "Ambassadeur" }
];

export function RegisterModal({ open, onOpenChange }: RegisterModalProps) {
  const navigate = useNavigate();
  const { register } = useMemberAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showValidationPopup, setShowValidationPopup] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    activity: "",
    country: "",
    city: "",
    whatsapp: "",
    phone: "",
    bio: "",
    profileImage: "",
    acquisitionSource: "",
    ambassadorCode: "",
    privacySettings: {
      showEmail: false,
      showWhatsApp: true,
      showPhone: false,
    },
  });

  const [photoPreview, setPhotoPreview] = useState<string>("");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setFormData({ ...formData, profileImage: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.country || !formData.acquisitionSource) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      setIsLoading(false);
      return;
    }

    // Validation code ambassadeur si source = ambassadeur
    if (formData.acquisitionSource === "ambassadeur" && !formData.ambassadorCode.trim()) {
      toast.error("Veuillez saisir le code ambassadeur");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      setIsLoading(false);
      return;
    }

    try {
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        activity: formData.activity,
        country: formData.country,
        city: formData.city,
        whatsapp: formData.whatsapp,
        phone: formData.phone,
        bio: formData.bio,
        profileImage: formData.profileImage,
        acquisitionSource: formData.acquisitionSource,
        ambassadorCode: formData.ambassadorCode,
        privacySettings: formData.privacySettings,
      });

      if (result.success) {
        // Afficher popup de validation
        setShowValidationPopup(true);

        // Fermer le modal d'inscription après 4 secondes
        setTimeout(() => {
          onOpenChange(false);
          setShowValidationPopup(false);
        }, 4000);
      } else {
        toast.error(result.error || "Erreur lors de la création du compte");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidationPopupClose = () => {
    setShowValidationPopup(false);
    // Redirection vers le dashboard membre
    navigate("/dashboard");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Rejoindre TYKA
            </DialogTitle>
            <DialogDescription className="text-base">
              Rejoignez notre communauté d'apprentissage et de partage de compétences
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Photo de profil */}
            <div className="flex flex-col items-center space-y-4 py-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6">
              <div className="relative">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center border-4 border-white shadow-lg">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
                <label
                  htmlFor="photo-upload"
                  className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Upload className="w-5 h-5 text-amber-600" />
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </label>
              </div>
              <p className="text-sm text-gray-600">Photo de profil (optionnelle mais encouragée)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prénom */}
              <div className="space-y-2">
                <Label htmlFor="prenom" className="text-sm font-medium">
                  Prénom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="prenom"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Votre prénom"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Nom */}
              <div className="space-y-2">
                <Label htmlFor="nom" className="text-sm font-medium">
                  Nom <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nom"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Votre nom"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Adresse email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="votre.email@example.com"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Activité / Métier */}
              <div className="space-y-2">
                <Label htmlFor="activity" className="text-sm font-medium">
                  Activité / Métier
                </Label>
                <Input
                  id="activity"
                  value={formData.activity}
                  onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                  placeholder="Ex: Enseignant, Développeur..."
                  disabled={isLoading}
                />
              </div>

              {/* Mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Mot de passe <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                <p className="text-xs text-gray-500">Minimum 6 caractères</p>
              </div>

              {/* Confirmation mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium">
                  Confirmer le mot de passe <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Pays */}
              <div className="space-y-2">
                <Label htmlFor="pays" className="text-sm font-medium">
                  Pays <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.country} onValueChange={(val) => setFormData({ ...formData, country: val })} disabled={isLoading}>
                  <SelectTrigger id="pays" className="mt-1">
                    <SelectValue placeholder="Sélectionnez votre pays" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ville */}
              <div className="space-y-2">
                <Label htmlFor="ville" className="text-sm font-medium">
                  Ville
                </Label>
                <Input
                  id="ville"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Votre ville"
                  disabled={isLoading}
                />
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-sm font-medium">
                  Numéro WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="+33 6 12 34 56 78"
                  disabled={isLoading}
                />
              </div>

              {/* Téléphone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Téléphone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+33 6 12 34 56 78"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-sm font-medium">
                Bio / Présentation
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Quelques mots sur vous, vos centres d'intérêt, vos compétences..."
                rows={4}
                disabled={isLoading}
              />
            </div>

            {/* Source d'acquisition */}
            <div className="space-y-2 pt-4 border-t border-gray-200">
              <Label htmlFor="acquisition-source" className="text-sm font-medium">
                Comment avez-vous rejoint la communauté TYKA ? <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.acquisitionSource}
                onValueChange={(val) => setFormData({ ...formData, acquisitionSource: val, ambassadorCode: val !== "ambassadeur" ? "" : formData.ambassadorCode })}
                disabled={isLoading}
              >
                <SelectTrigger id="acquisition-source" className="mt-1">
                  <SelectValue placeholder="Sélectionnez une option" />
                </SelectTrigger>
                <SelectContent>
                  {ACQUISITION_SOURCES.map((source) => (
                    <SelectItem key={source.value} value={source.value}>{source.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Code Ambassadeur (conditionnel) */}
            {formData.acquisitionSource === "ambassadeur" && (
              <div className="space-y-2 bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                <Label htmlFor="ambassador-code" className="text-sm font-medium">
                  Code Ambassadeur <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ambassador-code"
                  value={formData.ambassadorCode}
                  onChange={(e) => setFormData({ ...formData, ambassadorCode: e.target.value })}
                  placeholder="Entrez le code ambassadeur"
                  required
                  disabled={isLoading}
                  className="border-amber-300 focus:border-amber-500"
                />
                <p className="text-xs text-amber-700">
                  ℹ️ Saisissez le code fourni par votre ambassadeur TYKA
                </p>
              </div>
            )}

            {/* Paramètres de confidentialité */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-lg text-gray-900">Paramètres de confidentialité</h3>
              <p className="text-sm text-gray-600">
                Votre profil public affichera toujours : Nom + Prénom, Activité, Pays + Ville
              </p>

              <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                {/* Visibilité Email */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="vis-email" className="text-sm font-medium cursor-pointer">
                      Autoriser les membres à voir mon email
                    </Label>
                  </div>
                  <Switch
                    id="vis-email"
                    checked={formData.privacySettings.showEmail}
                    onCheckedChange={(checked) => 
                      setFormData({ 
                        ...formData, 
                        privacySettings: { ...formData.privacySettings, showEmail: checked } 
                      })
                    }
                    disabled={isLoading}
                  />
                </div>

                {/* Visibilité WhatsApp */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="vis-whatsapp" className="text-sm font-medium cursor-pointer">
                      Autoriser les membres à voir mon numéro WhatsApp
                    </Label>
                  </div>
                  <Switch
                    id="vis-whatsapp"
                    checked={formData.privacySettings.showWhatsApp}
                    onCheckedChange={(checked) => 
                      setFormData({ 
                        ...formData, 
                        privacySettings: { ...formData.privacySettings, showWhatsApp: checked } 
                      })
                    }
                    disabled={isLoading}
                  />
                </div>

                {/* Visibilité Téléphone */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="vis-phone" className="text-sm font-medium cursor-pointer">
                      Autoriser les membres à voir mon numéro de téléphone
                    </Label>
                  </div>
                  <Switch
                    id="vis-phone"
                    checked={formData.privacySettings.showPhone}
                    onCheckedChange={(checked) => 
                      setFormData({ 
                        ...formData, 
                        privacySettings: { ...formData.privacySettings, showPhone: checked } 
                      })
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 italic">
                ℹ️ En vous inscrivant, vous serez automatiquement ajouté à notre base d'ambassadeurs potentiels avec un code ambassadeur unique.
              </p>
            </div>

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
                {isLoading ? "Création..." : "Créer mon compte"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Validation Popup */}
      <Dialog open={showValidationPopup} onOpenChange={setShowValidationPopup}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center text-center space-y-4 py-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center animate-pulse">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Bienvenue sur TYKA ! 🎉
            </DialogTitle>
            
            <div className="space-y-3">
              <p className="text-gray-700 font-medium">
                Votre compte a été créé avec succès
              </p>
              
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-3 justify-center mb-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <p className="text-amber-800 font-semibold">En attente de validation</p>
                </div>
                <p className="text-sm text-amber-700">
                  Votre compte est en cours de validation par l'équipe TYKA.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  📧 Vous recevrez une notification par <span className="font-semibold">email</span> et <span className="font-semibold">WhatsApp</span> dès que votre compte sera validé.
                </p>
              </div>
            </div>

            <Button
              onClick={handleValidationPopupClose}
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold h-11"
            >
              Compris !
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}