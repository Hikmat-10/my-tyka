import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { 
  User, 
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Save,
  ArrowLeft,
  Globe,
  MessageSquare
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { useMemberAuth } from "../contexts/MemberAuthContext";

export default function EditProfile() {
  const navigate = useNavigate();
  const { currentMember, updateProfile } = useMemberAuth();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    whatsapp: "",
    country: "",
    city: "",
    bio: "",
    activity: "",
    interests: [] as string[],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [interestsInput, setInterestsInput] = useState("");

  useEffect(() => {
    if (!currentMember) {
      toast.error("Veuillez vous connecter pour accéder à cette page");
      navigate("/");
      return;
    }

    // Charger les données du membre
    setFormData({
      firstName: currentMember.firstName || "",
      lastName: currentMember.lastName || "",
      email: currentMember.email || "",
      phone: currentMember.phone || "",
      whatsapp: currentMember.whatsapp || "",
      country: currentMember.country || "",
      city: currentMember.city || "",
      bio: currentMember.bio || "",
      activity: currentMember.activity || "",
      interests: currentMember.interests || [],
    });
    setInterestsInput((currentMember.interests || []).join(", "));
  }, [currentMember, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInterestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInterestsInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Convertir les intérêts en tableau
      const interests = interestsInput
        .split(",")
        .map(i => i.trim())
        .filter(i => i.length > 0);

      const updatedData = {
        ...formData,
        interests,
      };

      // Mettre à jour le profil
      await updateProfile(updatedData);

      toast.success("Profil mis à jour avec succès !");
      navigate("/dashboard");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentMember) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {/* En-tête */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au Dashboard
            </Button>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Modifier mon profil
            </h1>
            <p className="text-gray-600">
              Mettez à jour vos informations personnelles et professionnelles
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Informations personnelles */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Informations personnelles
                </CardTitle>
                <CardDescription>
                  Vos informations de base
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10"
                      required
                      disabled
                    />
                  </div>
                  <p className="text-xs text-gray-500">L'email ne peut pas être modifié</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-green-600" />
                  Contact
                </CardTitle>
                <CardDescription>
                  Vos coordonnées de contact
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="whatsapp"
                      name="whatsapp"
                      type="tel"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Localisation */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  Localisation
                </CardTitle>
                <CardDescription>
                  Où vous situez-vous ?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Pays *</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="pl-10"
                      required
                      placeholder="France, Sénégal, etc."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="Paris, Dakar, etc."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profil professionnel */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  Profil professionnel
                </CardTitle>
                <CardDescription>
                  Parlez-nous de vous
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="activity">Activité professionnelle</Label>
                  <Input
                    id="activity"
                    name="activity"
                    value={formData.activity}
                    onChange={handleChange}
                    placeholder="Consultant, Entrepreneur, Étudiant, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biographie</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Parlez-nous de votre parcours, vos centres d'intérêt..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interests">Centres d'intérêt</Label>
                  <Input
                    id="interests"
                    value={interestsInput}
                    onChange={handleInterestsChange}
                    placeholder="Innovation sociale, Développement durable, Entrepreneuriat..."
                  />
                  <p className="text-xs text-gray-500">
                    Séparez vos intérêts par des virgules
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Boutons d'action */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard")}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}