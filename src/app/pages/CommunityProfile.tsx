import { Header } from "../components/Header";
import { SupportModal } from "../components/SupportModal";
import { ArrowLeft, Camera, Save, Plus, X, Loader2, Linkedin, Globe, Facebook } from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useMemberAuth } from "../contexts/MemberAuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export default function CommunityProfile() {
  const navigate = useNavigate();
  const { currentMember, updateProfile, isAuthenticated } = useMemberAuth();
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newExpertise, setNewExpertise] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [newLink, setNewLink] = useState("");

  const [formData, setFormData] = useState({
    profileImage: currentMember?.profileImage || "",
    coverPhoto: currentMember?.coverPhoto || "",
    bio: currentMember?.bio || "",
    city: currentMember?.city || "",
    country: currentMember?.country || "",
    expertiseAreas: currentMember?.expertiseAreas || [],
    interests: currentMember?.interests || [],
    currentWork: currentMember?.currentWork || "",
    whatsapp: currentMember?.whatsapp || "",
    linkedin: currentMember?.linkedin || "",
    facebook: currentMember?.facebook || "",
    website: currentMember?.website || "",
    otherLinks: currentMember?.otherLinks || [],
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Connexion requise");
      navigate("/");
      return;
    }
  }, [isAuthenticated, navigate]);

  const handleImageUpload = (field: "profileImage" | "coverPhoto", event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFormData((prev) => ({ ...prev, [field]: result }));
    };
    reader.readAsDataURL(file);
  };

  const addExpertise = () => {
    if (!newExpertise.trim()) return;
    if (formData.expertiseAreas.includes(newExpertise.trim())) {
      toast.error("Ce domaine d'expertise existe déjà");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      expertiseAreas: [...prev.expertiseAreas, newExpertise.trim()],
    }));
    setNewExpertise("");
  };

  const removeExpertise = (expertise: string) => {
    setFormData((prev) => ({
      ...prev,
      expertiseAreas: prev.expertiseAreas.filter((e) => e !== expertise),
    }));
  };

  const addInterest = () => {
    if (!newInterest.trim()) return;
    if (formData.interests.includes(newInterest.trim())) {
      toast.error("Ce centre d'intérêt existe déjà");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      interests: [...prev.interests, newInterest.trim()],
    }));
    setNewInterest("");
  };

  const removeInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }));
  };

  const addOtherLink = () => {
    if (!newLink.trim()) return;
    if (formData.otherLinks.includes(newLink.trim())) {
      toast.error("Ce lien existe déjà");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      otherLinks: [...prev.otherLinks, newLink.trim()],
    }));
    setNewLink("");
  };

  const removeOtherLink = (link: string) => {
    setFormData((prev) => ({
      ...prev,
      otherLinks: prev.otherLinks.filter((l) => l !== link),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const result = await updateProfile(formData);

      if (result.success) {
        toast.success("Profil communautaire mis à jour", {
          description: "Vos informations sont maintenant visibles dans la communauté",
        });
        navigate("/communaute");
      } else {
        toast.error("Erreur", {
          description: result.error || "Impossible de mettre à jour le profil",
        });
      }
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentMember) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/30">
      <Header />
      <SupportModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />

      <main className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="mb-6">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour au profil</span>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Mon Profil Communautaire
            </h1>
            <p className="text-gray-600 mt-2">
              Personnalisez votre profil pour vous présenter à la communauté TYKA
            </p>
          </div>

          {/* Cover Photo & Profile Image */}
          <Card>
            <CardHeader>
              <CardTitle>Photos de profil</CardTitle>
              <CardDescription>
                Photo de profil et photo de couverture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cover Photo */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Photo de couverture (optionnelle)</Label>
                <div className="relative">
                  <div className="h-48 bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg overflow-hidden">
                    {formData.coverPhoto ? (
                      <img src={formData.coverPhoto} alt="Couverture" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <Camera className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-4 right-4 cursor-pointer bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors">
                    <Camera className="w-5 h-5 text-gray-700" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload("coverPhoto", e)}
                    />
                  </label>
                </div>
              </div>

              {/* Profile Image */}
              <div>
                <Label className="text-sm font-semibold mb-2 block">Photo de profil</Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 overflow-hidden">
                      {formData.profileImage ? (
                        <img src={formData.profileImage} alt="Profil" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-white text-3xl font-bold">
                          {currentMember.firstName[0]}{currentMember.lastName[0]}
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 cursor-pointer bg-white rounded-full p-1.5 shadow-lg hover:bg-gray-50 transition-colors">
                      <Camera className="w-4 h-4 text-gray-700" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload("profileImage", e)}
                      />
                    </label>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{currentMember.firstName} {currentMember.lastName}</p>
                    <p className="text-sm text-gray-500">{currentMember.email}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  placeholder="Présentez-vous à la communauté..."
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Ex: Dakar"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Ex: Sénégal"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expertise & Interests */}
          <Card>
            <CardHeader>
              <CardTitle>Domaines d'expertise</CardTitle>
              <CardDescription>
                Ajoutez vos domaines de compétence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addExpertise()}
                  placeholder="Ex: Design thinking, Leadership..."
                  className="flex-1"
                />
                <Button onClick={addExpertise} size="sm" className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.expertiseAreas.map((expertise) => (
                  <Badge key={expertise} variant="secondary" className="bg-orange-100 text-orange-700 px-3 py-1">
                    {expertise}
                    <button onClick={() => removeExpertise(expertise)} className="ml-2 hover:text-orange-900">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Centres d'intérêt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addInterest()}
                  placeholder="Ex: Entrepreneuriat social, Innovation..."
                  className="flex-1"
                />
                <Button onClick={addInterest} size="sm" className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="bg-blue-100 text-blue-700 px-3 py-1">
                    {interest}
                    <button onClick={() => removeInterest(interest)} className="ml-2 hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Work */}
          <Card>
            <CardHeader>
              <CardTitle>Ce sur quoi je travaille actuellement</CardTitle>
              <CardDescription>
                Partagez vos projets en cours, vos recherches ou vos objectifs professionnels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.currentWork}
                onChange={(e) => setFormData({ ...formData, currentWork: e.target.value })}
                rows={4}
                placeholder="Ex: Je rédige un mémoire sur l'entrepreneuriat social, je recherche un stage en suivi-évaluation, je développe une startup dans l'agriculture numérique..."
              />
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Coordonnées</CardTitle>
              <CardDescription>
                Ces informations seront visibles dans votre profil public
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="whatsapp">Numéro WhatsApp (optionnel)</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="+221 XX XXX XX XX"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Links */}
          <Card>
            <CardHeader>
              <CardTitle>Liens professionnels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="linkedin" className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-blue-600" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="facebook" className="flex items-center gap-2">
                  <Facebook className="w-4 h-4 text-blue-700" />
                  Facebook
                </Label>
                <Input
                  id="facebook"
                  value={formData.facebook}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                  placeholder="https://facebook.com/..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-600" />
                  Site web
                </Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>

              {/* Other Links */}
              <div>
                <Label>Autres liens professionnels</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addOtherLink()}
                    placeholder="https://..."
                    className="flex-1"
                  />
                  <Button onClick={addOtherLink} size="sm" className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-col gap-2 mt-3">
                  {formData.otherLinks.map((link) => (
                    <div key={link} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                      <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 flex-1 truncate">{link}</span>
                      <button onClick={() => removeOtherLink(link)} className="hover:text-red-600 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pb-8">
            <Button
              variant="outline"
              onClick={() => navigate("/profile")}
              disabled={isSaving}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-orange-600 to-amber-600 text-white hover:opacity-90 min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
