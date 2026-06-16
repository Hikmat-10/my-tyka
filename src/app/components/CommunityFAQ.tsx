import { useState } from "react";
import { ChevronDown, HelpCircle, Users, Lightbulb, Award, Network, Compass, Gift, Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FAQItem {
  id: string;
  question: string;
  answer: JSX.Element;
  icon: JSX.Element;
}

export function CommunityFAQ() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(["1"]));

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const faqData: FAQItem[] = [
    {
      id: "1",
      question: "Qu'est-ce que TYKA ?",
      icon: <HelpCircle className="w-5 h-5 text-orange-600" />,
      answer: (
        <div className="space-y-3">
          <p className="text-gray-700 leading-relaxed">
            TYKA est une communauté dédiée au développement du capital humain, du capital social et des initiatives à impact.
            Elle rassemble des étudiants, professionnels, entrepreneurs, chercheurs, formateurs, organisations et citoyens engagés
            souhaitant apprendre, partager, collaborer et contribuer à des projets porteurs de valeur.
          </p>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-100">
            <p className="font-semibold text-orange-900 mb-2">TYKA repose sur trois piliers :</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span><strong>Apprendre</strong> : accéder à des ressources, formations et opportunités de développement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span><strong>Construire</strong> : développer des projets, des compétences et des initiatives</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span><strong>Connecter</strong> : créer des liens avec des personnes partageant des intérêts, expertises ou ambitions communes</span>
              </li>
            </ul>
          </div>
          <p className="text-gray-700 italic">
            L'objectif de TYKA est de permettre à chacun de progresser personnellement, professionnellement et entrepreneurialement
            tout en contribuant à une communauté dynamique et solidaire.
          </p>
        </div>
      ),
    },
    {
      id: "2",
      question: "Que puis-je trouver sur TYKA ?",
      icon: <Gift className="w-5 h-5 text-blue-600" />,
      answer: (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">📚 Ressources éducatives libres</h4>
            <p className="text-gray-700 mb-2">Vous pouvez accéder à :</p>
            <ul className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Des vidéos pédagogiques
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Des podcasts
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Des supports de formation
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Des guides pratiques
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Des études et rapports
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Mémoires et publications
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">👥 Une communauté diversifiée</h4>
            <p className="text-gray-700 text-sm">
              Étudiants, enseignants, chercheurs, entrepreneurs, consultants, salariés, associations, ONG et experts sectoriels.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">💡 Des initiatives et projets</h4>
            <p className="text-gray-700 text-sm">
              Découvrez, rejoignez ou proposez des initiatives à impact social, économique ou environnemental.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">🚀 Des opportunités de développement</h4>
            <p className="text-gray-700 text-sm">
              Formations, événements, ateliers, appels à projets, stages et opportunités professionnelles.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "3",
      question: "Puis-je proposer une initiative sur TYKA ?",
      icon: <Lightbulb className="w-5 h-5 text-amber-600" />,
      answer: (
        <div className="space-y-3">
          <p className="text-gray-700">
            <strong>Oui.</strong> Chaque membre peut soumettre une initiative, un projet, une activité ou une idée
            qu'il souhaite développer avec l'appui de la communauté.
          </p>
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
            <p className="font-semibold text-amber-900 mb-2">Une initiative peut concerner :</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
              <span>• L'éducation</span>
              <span>• L'entrepreneuriat</span>
              <span>• Le numérique</span>
              <span>• L'environnement</span>
              <span>• L'économie circulaire</span>
              <span>• L'agriculture</span>
              <span>• Le développement local</span>
              <span>• La recherche</span>
              <span>• L'innovation sociale</span>
            </div>
          </div>
          <p className="text-gray-700 text-sm italic">
            La communauté peut ensuite contribuer à sa réalisation à travers des compétences, des conseils,
            des ressources ou des partenariats.
          </p>
        </div>
      ),
    },
    {
      id: "4",
      question: "Puis-je devenir ambassadeur TYKA ?",
      icon: <Award className="w-5 h-5 text-purple-600" />,
      answer: (
        <div className="space-y-3">
          <p className="text-gray-700">
            <strong>Oui.</strong> Les membres les plus engagés peuvent rejoindre le réseau des ambassadeurs TYKA.
          </p>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <h4 className="font-semibold text-purple-900 mb-2">Quel est le rôle d'un ambassadeur ?</h4>
            <p className="text-gray-700 text-sm mb-2">
              L'ambassadeur est un facilitateur et un animateur de communauté. Il contribue notamment à :
            </p>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Promouvoir les valeurs et les activités de TYKA</li>
              <li>• Accueillir et orienter les nouveaux membres</li>
              <li>• Animer la communauté locale ou thématique</li>
              <li>• Identifier des opportunités utiles aux membres</li>
              <li>• Favoriser les échanges et les collaborations</li>
              <li>• Participer au développement de la plateforme</li>
              <li>• Relayer les initiatives et événements</li>
            </ul>
          </div>
          <p className="text-gray-700 text-sm italic">
            L'ambassadeur joue un rôle essentiel dans la croissance et la vitalité de la communauté.
          </p>
        </div>
      ),
    },
    {
      id: "5",
      question: "Comment développer mon réseau grâce à TYKA ?",
      icon: <Network className="w-5 h-5 text-green-600" />,
      answer: (
        <div className="space-y-2">
          <p className="text-gray-700 mb-3">L'espace Communauté vous permet :</p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>De consulter les profils des membres</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>D'identifier des personnes partageant vos centres d'intérêt</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>De découvrir les projets sur lesquels ils travaillent</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>De contacter des experts ou collaborateurs potentiels</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>De développer votre réseau professionnel et entrepreneurial</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "6",
      question: "Je souhaite bénéficier d'un accompagnement personnalisé. Comment faire ?",
      icon: <Compass className="w-5 h-5 text-teal-600" />,
      answer: (
        <div className="space-y-3">
          <p className="text-gray-700">
            TYKA met à votre disposition <strong>TYKA Compass</strong>, un outil intelligent de diagnostic et d'orientation.
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <h5 className="font-semibold text-blue-900 text-sm mb-2">Développement personnel</h5>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Identifier vos forces</li>
                <li>• Renforcer votre leadership</li>
                <li>• Améliorer votre confiance</li>
                <li>• Compétences relationnelles</li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-100">
              <h5 className="font-semibold text-green-900 text-sm mb-2">Développement professionnel</h5>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Clarifier votre projet</li>
                <li>• Améliorer l'employabilité</li>
                <li>• Identifier les compétences</li>
                <li>• Plan d'évolution</li>
              </ul>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
              <h5 className="font-semibold text-orange-900 text-sm mb-2">Développement entrepreneurial</h5>
              <ul className="text-xs text-gray-700 space-y-1">
                <li>• Évaluer une idée</li>
                <li>• Modèle économique</li>
                <li>• Diagnostiquer l'activité</li>
                <li>• Opportunités de croissance</li>
              </ul>
            </div>
          </div>
          <p className="text-gray-700 text-sm italic">
            À l'issue de l'évaluation, vous recevez des recommandations personnalisées, des ressources adaptées
            et une feuille de route de progression.
          </p>
        </div>
      ),
    },
    {
      id: "7",
      question: "L'accès à TYKA est-il gratuit ?",
      icon: <Gift className="w-5 h-5 text-emerald-600" />,
      answer: (
        <div className="space-y-2">
          <p className="text-gray-700">
            Une grande partie des ressources et services communautaires est accessible <strong>gratuitement</strong>.
          </p>
          <p className="text-gray-700 text-sm">
            Certaines formations, certifications ou activités spécialisées peuvent être proposées sous un format payant
            afin de garantir leur qualité et leur pérennité.
          </p>
          <p className="text-gray-700 text-sm italic">
            Les conditions d'accès sont précisées pour chaque activité concernée.
          </p>
        </div>
      ),
    },
    {
      id: "8",
      question: "Comment contribuer au développement de TYKA ?",
      icon: <Heart className="w-5 h-5 text-red-600" />,
      answer: (
        <div className="space-y-3">
          <p className="text-gray-700">Vous pouvez contribuer de plusieurs manières :</p>
          <div className="grid md:grid-cols-2 gap-2">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 text-sm text-gray-700">
              <span className="text-orange-600">•</span>
              Partager des ressources éducatives
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 text-sm text-gray-700">
              <span className="text-orange-600">•</span>
              Proposer une initiative
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 text-sm text-gray-700">
              <span className="text-orange-600">•</span>
              Devenir ambassadeur
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 text-sm text-gray-700">
              <span className="text-orange-600">•</span>
              Animer une formation
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 text-sm text-gray-700">
              <span className="text-orange-600">•</span>
              Mettre votre expertise au service
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 text-sm text-gray-700">
              <span className="text-orange-600">•</span>
              Recommander TYKA
            </div>
          </div>
          <p className="text-gray-700 text-sm italic bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-3 border border-orange-100">
            Chaque contribution permet de renforcer l'impact collectif de la communauté.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Foire Aux Questions</h2>
            <p className="text-gray-600">Tout ce que vous devez savoir sur TYKA</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {faqData.map((item) => (
          <div
            key={item.id}
            className="border border-gray-200 rounded-xl overflow-hidden hover:border-orange-300 transition-colors"
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-orange-50/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                {item.icon}
                <span className="font-semibold text-gray-900">{item.question}</span>
              </div>
              <motion.div
                animate={{ rotate: openItems.has(item.id) ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </motion.div>
            </button>

            <AnimatePresence>
              {openItems.has(item.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
            TYKA
          </h3>
          <p className="text-gray-700 font-medium">Learn. Build. Connect.</p>
          <p className="text-sm text-gray-600 mt-2">
            Une communauté pour apprendre, construire et grandir ensemble.
          </p>
        </div>
      </div>
    </div>
  );
}
