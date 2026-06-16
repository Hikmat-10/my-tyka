import { X, Mail, MessageCircle, Users } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "./ui/sheet";
import { VisuallyHidden } from "./VisuallyHidden";

interface MemberDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  member: {
    id: string;
    name: string;
    location: string;
    profession: string;
    role: "apprenant" | "contributeur" | "ambassadeur";
    photo: string;
    country: string;
    bio: string;
    email: string;
    whatsapp?: string;
  } | null;
}

export function MemberDrawer({ isOpen, onClose, member }: MemberDrawerProps) {
  if (!member) return null;

  const roleLabels = {
    apprenant: "Apprenant",
    contributeur: "Contributeur",
    ambassadeur: "Ambassadeur"
  };

  const roleColors = {
    apprenant: "bg-blue-100 text-blue-700",
    contributeur: "bg-purple-100 text-purple-700",
    ambassadeur: "bg-amber-100 text-amber-700"
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 overflow-y-auto">
        <VisuallyHidden>
          <SheetTitle>{member.name} - Profil</SheetTitle>
          <SheetDescription>
            Profil de {member.name}, {member.profession} basé(e) à {member.location}
          </SheetDescription>
        </VisuallyHidden>
        
        <div className="relative">
          {/* Header Image */}
          <div className="h-64 bg-gradient-to-br from-blue-500 to-purple-600 relative">
            <img 
              src={member.photo} 
              alt={member.name}
              className="w-full h-full object-cover"
            />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{member.name}</h2>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <span className="text-2xl">{member.country}</span>
                  <span>{member.location}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[member.role]}`}>
                {roleLabels[member.role]}
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Fonction</h3>
              <p className="text-gray-900 font-medium">{member.profession}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bio</h3>
              <p className="text-gray-700 leading-relaxed">{member.bio}</p>
            </div>

            {/* Contact Actions */}
            <div className="space-y-3 mb-6">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                <Mail className="w-5 h-5" />
                <div className="flex-1 text-left">
                  <div className="font-medium">Envoyer un email</div>
                  <div className="text-sm text-blue-100">{member.email}</div>
                </div>
              </button>

              {member.whatsapp && (
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">Contacter sur WhatsApp</div>
                    <div className="text-sm text-green-100">{member.whatsapp}</div>
                  </div>
                </button>
              )}
            </div>

            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
              <Users className="w-5 h-5" />
              <span>Voir des profils similaires</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}