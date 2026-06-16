import { MapPin, BadgeCheck } from "lucide-react";

export interface Member {
  id: string;
  name: string;
  location: string;
  profession: string;
  role: "apprenant" | "contributeur" | "ambassadeur";
  photo: string;
}

interface MemberCardProps {
  member: Member;
}

export function MemberCard({ member }: MemberCardProps) {
  const roleStyles = {
    apprenant: {
      badge: "bg-blue-100 text-blue-700 border-blue-200",
      label: "Apprenant"
    },
    contributeur: {
      badge: "bg-purple-100 text-purple-700 border-purple-200",
      label: "Contributeur"
    },
    ambassadeur: {
      badge: "bg-amber-100 text-amber-700 border-amber-200",
      label: "Ambassadeur"
    }
  };

  const roleConfig = roleStyles[member.role];

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200 hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
        <img 
          src={member.photo} 
          alt={member.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          {member.role === "ambassadeur" && (
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
              <BadgeCheck className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
          {member.name}
        </h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-1">
          {member.profession}
        </p>
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <MapPin className="w-3 h-3" />
          <span>{member.location}</span>
        </div>
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${roleConfig.badge}`}>
          {roleConfig.label}
        </span>
      </div>
    </div>
  );
}
