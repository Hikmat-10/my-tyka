import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Share2, Check, Link } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "video" | "cohort" | "podcast";
  data: {
    id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    price?: number;
    modality?: string;
    deadline?: string;
    spotsLeft?: number;
  };
}

export function ShareModal({ isOpen, onClose, type, data }: ShareModalProps) {
  // IMPORTANT: Toujours rediriger vers la page Initiatives (co-créer)
  const shareUrl = `${window.location.origin}/co-creer`;

  const [copied, setCopied] = useState(false);

  // Message différent selon le type de contenu
  const getShareMessage = () => {
    if (type === "video" || type === "podcast") {
      // Message spécifique pour vidéos et podcasts
      return `🎓 Je viens de découvrir cette ressource sur TYKA !\n\nUne communauté pour apprendre, partager des connaissances et développer son potentiel personnel, professionnel et entrepreneurial.\n\n🌍 Rejoignez la communauté TYKA :\nwww.mytyka.org`;
    } else {
      // Message pour les cohortes
      return `Je suis membre de la communauté TYKA et je participe à cette cohorte : rejoins-nous ! 👉 ${shareUrl}`;
    }
  };

  const automaticMessage = getShareMessage();

  const trackShare = (platform: string) => {
    // Track share in localStorage
    const shares = JSON.parse(localStorage.getItem("tykaShares") || "[]");
    shares.push({
      id: `share_${Date.now()}`,
      type,
      contentId: data.id,
      contentTitle: data.title,
      platform,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem("tykaShares", JSON.stringify(shares));
    
    // Dispatch custom event for analytics update
    window.dispatchEvent(new Event('tykaShareAdded'));
    
    // Show success message
    toast.success(`Partagé sur ${platform} !`, {
      description: "Merci de faire rayonner TYKA 🌟"
    });
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(automaticMessage);
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
    trackShare("WhatsApp");
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(automaticMessage)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    trackShare("Facebook");
  };

  const handleLinkedInShare = () => {
    const linkedinUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(data.title)}&summary=${encodeURIComponent(automaticMessage)}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=500');
    trackShare("LinkedIn");
  };

  const handleXShare = () => {
    const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(automaticMessage)}`;
    window.open(xUrl, '_blank', 'width=600,height=400');
    trackShare("X");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      trackShare("Copier le lien");
      toast.success("Lien copié !", {
        description: "Le lien a été copié dans le presse-papier"
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast.error("Erreur lors de la copie du lien");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Share2 className="w-5 h-5 text-orange-500" />
            Partager avec la communauté
          </DialogTitle>
          <DialogDescription>
            Invitez vos proches à découvrir TYKA et rejoindre les initiatives
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Message automatique */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
            <p className="text-sm font-medium text-gray-700 mb-2">📢 Message de partage :</p>
            <p className="text-gray-900 font-medium italic">
              "{automaticMessage}"
            </p>
          </div>

          {/* Share Buttons */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Partage en 1 clic :
            </p>

            {/* WhatsApp Button */}
            <Button
              onClick={handleWhatsAppShare}
              className="w-full h-12 bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold text-base transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
            >
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </Button>

            {/* Facebook - Full width pour vidéos/podcasts, half width pour cohortes */}
            <Button
              onClick={handleFacebookShare}
              className={`${type === "video" || type === "podcast" ? "w-full" : "h-12"} h-12 bg-[#1877F2] hover:bg-[#145DBF] text-white font-semibold transition-all hover:scale-[1.02] active:scale-95 shadow-lg`}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </Button>

            {/* Options supplémentaires uniquement pour les cohortes */}
            {type === "cohort" && (
              <>
                <Button
                  onClick={handleLinkedInShare}
                  className="h-12 bg-[#0077b5] hover:bg-[#005f8e] text-white font-semibold transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </Button>

                <Button
                  onClick={handleXShare}
                  className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
                >
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.629 5.905-5.629zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Partager sur X
                </Button>
              </>
            )}

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="w-full h-12 border-2 border-gray-200 hover:border-gray-300 text-gray-700 rounded-lg flex items-center justify-center gap-3 font-medium text-sm transition-all hover:bg-gray-50"
            >
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Link className="w-5 h-5" />}
              {copied ? "Lien copié !" : "Copier le lien"}
            </button>
          </div>

          {/* Feedback message */}
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <p className="text-xs text-amber-800 text-center">
              Merci de faire rayonner TYKA et d'inviter vos proches à rejoindre nos initiatives !
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}