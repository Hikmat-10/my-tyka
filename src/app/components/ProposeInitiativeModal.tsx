import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { VisuallyHidden } from "./ui/visually-hidden";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Calendar } from "./ui/calendar";
import { CalendarIcon, Lightbulb, X, Check, Lock, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useMemberAuth } from "../contexts/MemberAuthContext";
import { addInitiative, addActivity } from "../services/dataService";

interface ProposeInitiativeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin?: () => void;
  onRegister?: () => void;
}

export function ProposeInitiativeModal({ open, onOpenChange, onLogin, onRegister }: ProposeInitiativeModalProps) {
  const { isAuthenticated, currentMember } = useMemberAuth();
  const [formData, setFormData] = useState({
    type: "",
    titre: "",
    description: "",
    lieu: "",
    format: "",
    date: undefined as Date | undefined,
  });
  const [showDateModal, setShowDateModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !currentMember) {
      toast.error("Vous devez être connecté pour proposer une initiative");
      return;
    }

    if (!formData.type || !formData.titre || !formData.description || !formData.format) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Sauvegarder la proposition via le service
    const newInitiative = addInitiative({
      title: formData.titre,
      description: formData.description,
      category: formData.type,
      startDate: formData.date?.toISOString() || new Date().toISOString(),
      location: formData.lieu,
      modality: formData.format === "en-ligne" ? "online" : formData.format === "presentiel" ? "in-person" : "hybrid",
      organizer: `${currentMember.firstName} ${currentMember.lastName}`,
      organizerId: currentMember.id,
      status: "pending",
    });

    // Add activity log
    addActivity({
      memberId: currentMember.id,
      type: "initiative_created",
      title: "Initiative proposée",
      description: `Vous avez proposé l'initiative "${formData.titre}"`,
    });

    toast.success("🎉 Votre initiative a été soumise avec succès !", {
      description: "Elle sera examinée par notre équipe sous 48h",
    });

    onOpenChange(false);
    
    // Réinitialiser le formulaire
    setFormData({
      type: "",
      titre: "",
      description: "",
      lieu: "",
      format: "",
      date: undefined,
    });
  };

  const handleDateConfirm = () => {
    setShowDateModal(false);
  };

  // Show auth required screen if not authenticated
  if (!isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Connexion requise
            </DialogTitle>
            <DialogDescription>
              Vous devez être connecté pour proposer une initiative
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <p className="text-center text-gray-600 mb-2">
                Rejoignez la communauté TYKA pour partager vos initiatives
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  onOpenChange(false);
                  onLogin?.();
                }}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg"
              >
                Se connecter
              </Button>

              <Button
                onClick={() => {
                  onOpenChange(false);
                  onRegister?.();
                }}
                variant="outline"
                className="w-full border-green-300 text-green-600 hover:bg-green-50"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Rejoindre la communauté
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
              <Lightbulb className="w-8 h-8 text-green-600" />
              Proposer une Initiative
            </DialogTitle>
            <DialogDescription className="text-base">
              Partagez votre idée avec la communauté TYKA
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Type d'initiative */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Type d'initiative <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionnez le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formation">Formation</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="activite-culturelle">Activité culturelle</SelectItem>
                  <SelectItem value="webinar">Webinaire</SelectItem>
                  <SelectItem value="jeux-societe">Jeux de société</SelectItem>
                  <SelectItem value="atelier">Atelier pratique</SelectItem>
                  <SelectItem value="conference">Conférence</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Titre */}
            <div className="space-y-2">
              <Label htmlFor="titre" className="text-sm font-medium">
                Titre de l'initiative <span className="text-red-500">*</span>
              </Label>
              <Input
                id="titre"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                placeholder="Ex: Atelier Design Thinking pour l'Innovation Sociale"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez votre initiative, ses objectifs et ce que les participants peuvent en tirer..."
                rows={5}
                required
              />
            </div>

            {/* Format */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Format <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={formData.format}
                onValueChange={(value) => setFormData({ ...formData, format: value })}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="en-ligne" id="en-ligne" />
                  <Label htmlFor="en-ligne" className="cursor-pointer font-normal">
                    🌐 En ligne
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="presentiel" id="presentiel" />
                  <Label htmlFor="presentiel" className="cursor-pointer font-normal">
                    🏢 Présentiel
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hybride" id="hybride" />
                  <Label htmlFor="hybride" className="cursor-pointer font-normal">
                    🔀 Hybride
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Lieu (si présentiel ou hybride) */}
            {(formData.format === "presentiel" || formData.format === "hybride") && (
              <div className="space-y-2">
                <Label htmlFor="lieu" className="text-sm font-medium">
                  Lieu
                </Label>
                <Input
                  id="lieu"
                  value={formData.lieu}
                  onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                  placeholder="Ex: Paris, France ou Salle A, Bâtiment X"
                />
              </div>
            )}

            {/* Date / Deadline */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Date souhaitée / Deadline
              </Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal hover:bg-gray-50 hover:border-green-300 transition-all"
                onClick={() => setShowDateModal(true)}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-green-600" />
                {formData.date ? format(formData.date, "PPP", { locale: fr }) : "Sélectionner une date"}
              </Button>
            </div>

            {/* Info modération */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>📋 Note :</strong> Votre proposition sera examinée par notre équipe de modération. 
                Vous recevrez une notification une fois qu'elle sera approuvée et publiée dans la section Initiatives.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Soumettre l'initiative
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Smart Date Picker Modal */}
      <Dialog open={showDateModal} onOpenChange={setShowDateModal}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>Sélectionner une date</DialogTitle>
            <DialogDescription>
              Choisissez la date souhaitée pour votre initiative
            </DialogDescription>
          </VisuallyHidden>
          
          <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Date de l'initiative</h3>
                  <p className="text-sm text-green-100">Sélectionnez une date</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDateModal(false)}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <Calendar
              mode="single"
              selected={formData.date}
              onSelect={(date) => setFormData({ ...formData, date })}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
              className="rounded-lg border-0"
            />
            
            <div className="mt-6 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDateModal(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="button"
                onClick={handleDateConfirm}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg"
                disabled={!formData.date}
              >
                <Check className="w-4 h-4 mr-2" />
                Valider la date
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}