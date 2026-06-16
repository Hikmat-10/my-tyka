import {
  Compass, ChevronRight, ChevronLeft, Heart, Briefcase, Rocket, GraduationCap,
  ArrowRight, CheckCircle2, Star, Target, BarChart3, Lightbulb, FileText,
  Printer, BookOpen, TrendingUp, Users, MessageCircle, AlertCircle, Clock,
  Award, TrendingDown
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer
} from "recharts";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { useMemberAuth } from "../contexts/MemberAuthContext";
import { motion } from "motion/react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type MainBlock = "personal" | "professional" | "entrepreneurial" | "academic";
export type SubType = "startup" | "business" | "post-bac" | "licence-master";

export interface CompassDiagnostic {
  id: string;
  memberId: string;
  name: string;
  mainBlock: MainBlock;
  subType?: SubType;
  answers: Record<string, number | string>;
  scores: Record<string, number>;
  globalScore: number;
  status: "in_progress" | "completed";
  recommendations: Recommendation[];
  coherenceAnalysis?: CoherenceAnalysis;
  createdAt: string;
  updatedAt: string;
}

interface Recommendation {
  category: string;
  items: string[];
}

interface CoherenceAnalysis {
  level: "très-cohérent" | "cohérent" | "partiellement-cohérent" | "faiblement-cohérent" | "incohérent";
  explanation: string;
  suggestions: string[];
}

// ─── Storage Functions ────────────────────────────────────────────────────────

const STORAGE_KEY_PREFIX = "tykaCompass_";
const CONSENT_KEY = "tykaCompassConsent";

function saveDiagnostic(diagnostic: CompassDiagnostic) {
  const key = `${STORAGE_KEY_PREFIX}${diagnostic.memberId}`;
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  const index = existing.findIndex((d: CompassDiagnostic) => d.id === diagnostic.id);
  
  if (index >= 0) {
    existing[index] = diagnostic;
  } else {
    existing.push(diagnostic);
  }
  
  localStorage.setItem(key, JSON.stringify(existing));
}

function getDiagnostics(memberId: string): CompassDiagnostic[] {
  const key = `${STORAGE_KEY_PREFIX}${memberId}`;
  return JSON.parse(localStorage.getItem(key) || "[]");
}

function getConsent(): boolean {
  return localStorage.getItem(CONSENT_KEY) === "true";
}

function saveConsent() {
  localStorage.setItem(CONSENT_KEY, "true");
}

// ─── Questionnaires ───────────────────────────────────────────────────────────

interface Question {
  id: string;
  text: string;
  dimension: string;
  type?: "scale" | "text" | "select";
  options?: string[];
}

interface Section {
  dimension: string;
  label: string;
  questions: Question[];
}

const QUESTIONNAIRES: Record<string, Section[]> = {
  personal: [
    {
      dimension: "confiance",
      label: "Confiance en soi",
      questions: [
        { id: "p1", text: "Je me sens à l'aise pour défendre mes idées face à des interlocuteurs importants.", dimension: "confiance" },
        { id: "p2", text: "L'échec me fait grandir plutôt que me décourager.", dimension: "confiance" },
        { id: "p3", text: "J'ai une vision claire de mes forces et de mes axes de progression.", dimension: "confiance" },
      ]
    },
    {
      dimension: "leadership",
      label: "Leadership",
      questions: [
        { id: "p4", text: "Je prends facilement des décisions importantes, même dans l'incertitude.", dimension: "leadership" },
        { id: "p5", text: "Je sais mobiliser et inspirer des personnes autour d'un projet.", dimension: "leadership" },
        { id: "p6", text: "J'assume la responsabilité de mes erreurs et de celles de mon équipe.", dimension: "leadership" },
      ]
    },
    {
      dimension: "gestion_temps",
      label: "Gestion du temps",
      questions: [
        { id: "p7", text: "Je planifie mes journées et je respecte mes priorités.", dimension: "gestion_temps" },
        { id: "p8", text: "Je sais déléguer ce qui peut l'être.", dimension: "gestion_temps" },
        { id: "p9", text: "Je protège mon temps face aux interruptions et sollicitations.", dimension: "gestion_temps" },
      ]
    },
    {
      dimension: "communication",
      label: "Communication interpersonnelle",
      questions: [
        { id: "p10", text: "Je communique clairement mes attentes et mes besoins.", dimension: "communication" },
        { id: "p11", text: "Je suis à l'écoute active des autres.", dimension: "communication" },
        { id: "p12", text: "Je gère les conflits de manière constructive.", dimension: "communication" },
      ]
    },
    {
      dimension: "prise_parole",
      label: "Prise de parole en public",
      questions: [
        { id: "p13", text: "Je suis à l'aise pour prendre la parole en public.", dimension: "prise_parole" },
        { id: "p14", text: "Je structure clairement mon message avant de l'exprimer.", dimension: "prise_parole" },
        { id: "p15", text: "Je gère bien le stress lors d'une intervention importante.", dimension: "prise_parole" },
      ]
    },
    {
      dimension: "presence_digitale",
      label: "Présence digitale",
      questions: [
        { id: "p16", text: "J'ai un profil LinkedIn actif et régulièrement mis à jour.", dimension: "presence_digitale" },
        { id: "p17", text: "Je produis et partage régulièrement du contenu professionnel en ligne.", dimension: "presence_digitale" },
        { id: "p18", text: "J'utilise les réseaux sociaux pour développer mon réseau professionnel.", dimension: "presence_digitale" },
      ]
    },
  ],
  
  professional: [
    {
      dimension: "positionnement",
      label: "Positionnement professionnel",
      questions: [
        { id: "pr1", text: "J'ai une vision claire de mon projet professionnel.", dimension: "positionnement" },
        { id: "pr2", text: "Je connais bien le métier que je vise.", dimension: "positionnement" },
        { id: "pr3", text: "Mon parcours est cohérent avec mes objectifs.", dimension: "positionnement" },
      ]
    },
    {
      dimension: "competences_techniques",
      label: "Compétences techniques",
      questions: [
        { id: "pr4", text: "Mes compétences techniques sont à jour et en demande sur le marché.", dimension: "competences_techniques" },
        { id: "pr5", text: "Je maîtrise les outils numériques spécifiques à mon domaine.", dimension: "competences_techniques" },
        { id: "pr6", text: "Je détiens des certifications reconnues dans mon secteur.", dimension: "competences_techniques" },
      ]
    },
    {
      dimension: "reseau",
      label: "Réseau professionnel",
      questions: [
        { id: "pr7", text: "Mon réseau professionnel est actif et varié.", dimension: "reseau" },
        { id: "pr8", text: "Je participe à des événements professionnels ou à des communautés.", dimension: "reseau" },
        { id: "pr9", text: "Je suis en contact avec des personnes influentes dans mon secteur.", dimension: "reseau" },
      ]
    },
    {
      dimension: "employabilite",
      label: "Employabilité",
      questions: [
        { id: "pr10", text: "Mon CV est professionnel et à jour.", dimension: "employabilite" },
        { id: "pr11", text: "Ma présence LinkedIn génère des opportunités.", dimension: "employabilite" },
        { id: "pr12", text: "Je suis préparé(e) pour réussir mes entretiens professionnels.", dimension: "employabilite" },
      ]
    },
  ],
  
  startup: [
    {
      dimension: "probleme",
      label: "Problème identifié",
      questions: [
        { id: "s1", text: "J'ai clairement identifié un problème réel que rencontrent des personnes.", dimension: "probleme" },
        { id: "s2", text: "J'ai validé ce problème auprès de vrais utilisateurs potentiels.", dimension: "probleme" },
        { id: "s3", text: "Le problème est suffisamment douloureux pour justifier une solution.", dimension: "probleme" },
      ]
    },
    {
      dimension: "solution",
      label: "Solution & Différenciation",
      questions: [
        { id: "s4", text: "Ma solution résout efficacement le problème identifié.", dimension: "solution" },
        { id: "s5", text: "Ma solution est différente et meilleure que ce qui existe déjà.", dimension: "solution" },
        { id: "s6", text: "J'ai un avantage compétitif défendable.", dimension: "solution" },
      ]
    },
    {
      dimension: "marche",
      label: "Marché cible",
      questions: [
        { id: "s7", text: "J'ai défini précisément ma cible principale (persona).", dimension: "marche" },
        { id: "s8", text: "La taille de mon marché est suffisante pour être viable.", dimension: "marche" },
        { id: "s9", text: "J'ai accès à ma cible et je sais comment la rejoindre.", dimension: "marche" },
      ]
    },
    {
      dimension: "faisabilite",
      label: "Faisabilité",
      questions: [
        { id: "s10", text: "J'ai les compétences ou l'équipe pour développer la solution.", dimension: "faisabilite" },
        { id: "s11", text: "Je peux démarrer avec des ressources limitées.", dimension: "faisabilite" },
        { id: "s12", text: "J'ai un modèle économique viable identifié.", dimension: "faisabilite" },
      ]
    },
  ],
  
  business: [
    {
      dimension: "marche_clients",
      label: "Marché et clients",
      questions: [
        { id: "b1", text: "Je connais précisément mon marché cible et sa taille.", dimension: "marche_clients" },
        { id: "b2", text: "Mes clients sont satisfaits de mes produits/services.", dimension: "marche_clients" },
        { id: "b3", text: "J'ai un bon taux de fidélisation client.", dimension: "marche_clients" },
      ]
    },
    {
      dimension: "marketing",
      label: "Marketing et visibilité",
      questions: [
        { id: "b4", text: "Ma présence digitale est forte et génère des opportunités.", dimension: "marketing" },
        { id: "b5", text: "Ma stratégie marketing est clairement définie.", dimension: "marketing" },
        { id: "b6", text: "J'utilise efficacement les réseaux sociaux pour mon business.", dimension: "marketing" },
      ]
    },
    {
      dimension: "finances",
      label: "Gestion financière",
      questions: [
        { id: "b7", text: "Mon activité est rentable.", dimension: "finances" },
        { id: "b8", text: "Je gère rigoureusement ma trésorerie.", dimension: "finances" },
        { id: "b9", text: "J'ai une visibilité financière à 6-12 mois.", dimension: "finances" },
      ]
    },
    {
      dimension: "organisation",
      label: "Organisation",
      questions: [
        { id: "b10", text: "Les responsabilités sont clairement réparties.", dimension: "organisation" },
        { id: "b11", text: "Mes processus opérationnels sont efficaces.", dimension: "organisation" },
        { id: "b12", text: "Je délègue efficacement pour me concentrer sur l'essentiel.", dimension: "organisation" },
      ]
    },
    {
      dimension: "innovation",
      label: "Innovation",
      questions: [
        { id: "b13", text: "J'innove régulièrement dans mon offre.", dimension: "innovation" },
        { id: "b14", text: "Je me différencie clairement de mes concurrents.", dimension: "innovation" },
        { id: "b15", text: "Je développe de nouvelles offres régulièrement.", dimension: "innovation" },
      ]
    },
  ],

  "post-bac": [
    {
      dimension: "profil_academique",
      label: "Profil académique",
      questions: [
        { id: "ac1", text: "Âge", dimension: "profil_academique", type: "text" },
        { id: "ac2", text: "Série du BAC", dimension: "profil_academique", type: "select", options: ["A", "C", "D", "G1", "G2", "G3", "F", "Autre"] },
        { id: "ac3", text: "Dernier diplôme obtenu", dimension: "profil_academique", type: "text" },
      ]
    },
    {
      dimension: "satisfaction",
      label: "Satisfaction du parcours",
      questions: [
        { id: "ac10", text: "Je suis satisfait de ma filière actuelle.", dimension: "satisfaction" },
        { id: "ac11", text: "J'ai choisi moi-même cette filière.", dimension: "satisfaction" },
        { id: "ac12", text: "Cette formation correspond à mes centres d'intérêt.", dimension: "satisfaction" },
        { id: "ac13", text: "Cette formation répond à mon projet professionnel.", dimension: "satisfaction" },
      ]
    },
    {
      dimension: "competences_analytiques",
      label: "Compétences analytiques",
      questions: [
        { id: "ac20", text: "Résolution de problèmes", dimension: "competences_analytiques" },
        { id: "ac21", text: "Analyse de données", dimension: "competences_analytiques" },
        { id: "ac22", text: "Esprit critique", dimension: "competences_analytiques" },
      ]
    },
    {
      dimension: "competences_relationnelles",
      label: "Compétences relationnelles",
      questions: [
        { id: "ac30", text: "Communication", dimension: "competences_relationnelles" },
        { id: "ac31", text: "Leadership", dimension: "competences_relationnelles" },
        { id: "ac32", text: "Travail d'équipe", dimension: "competences_relationnelles" },
      ]
    },
    {
      dimension: "projet_professionnel",
      label: "Vision professionnelle",
      questions: [
        { id: "ac40", text: "Avez-vous un projet professionnel clairement défini ?", dimension: "projet_professionnel", type: "select", options: ["Oui", "Partiellement", "Non"] },
        { id: "ac41", text: "Ma formation actuelle me prépare au métier que je vise.", dimension: "projet_professionnel" },
        { id: "ac42", text: "Je connais les débouchés de cette filière.", dimension: "projet_professionnel" },
      ]
    },
    {
      dimension: "coherence",
      label: "Cohérence formation/métier",
      questions: [
        { id: "ac50", text: "Ma formation actuelle me prépare au métier que je vise.", dimension: "coherence" },
        { id: "ac51", text: "Je maîtrise les prérequis nécessaires à ce métier.", dimension: "coherence" },
        { id: "ac52", text: "J'ai déjà rencontré des professionnels du secteur.", dimension: "coherence" },
      ]
    },
  ],

  "licence-master": [
    {
      dimension: "profil_academique",
      label: "Profil académique",
      questions: [
        { id: "lm1", text: "Licence obtenue", dimension: "profil_academique", type: "text" },
        { id: "lm2", text: "Domaine de spécialité", dimension: "profil_academique", type: "text" },
        { id: "lm3", text: "Établissement d'origine", dimension: "profil_academique", type: "text" },
      ]
    },
    {
      dimension: "satisfaction",
      label: "Satisfaction du parcours",
      questions: [
        { id: "lm10", text: "Je suis satisfait de mon parcours académique.", dimension: "satisfaction" },
        { id: "lm11", text: "Mon parcours reflète mes aspirations.", dimension: "satisfaction" },
        { id: "lm12", text: "Ma formation actuelle est alignée avec mon projet professionnel.", dimension: "satisfaction" },
      ]
    },
    {
      dimension: "competences_techniques",
      label: "Compétences techniques",
      questions: [
        { id: "lm20", text: "Je maîtrise les compétences techniques de mon domaine.", dimension: "competences_techniques" },
        { id: "lm21", text: "J'ai acquis des compétences recherchées sur le marché.", dimension: "competences_techniques" },
        { id: "lm22", text: "Je possède des certifications complémentaires.", dimension: "competences_techniques" },
      ]
    },
    {
      dimension: "experience",
      label: "Expérience professionnelle",
      questions: [
        { id: "lm30", text: "J'ai effectué des stages pertinents dans mon domaine.", dimension: "experience" },
        { id: "lm31", text: "J'ai une expérience professionnelle significative.", dimension: "experience" },
        { id: "lm32", text: "Mon réseau professionnel est développé.", dimension: "experience" },
      ]
    },
    {
      dimension: "coherence",
      label: "Cohérence Licence→Master",
      questions: [
        { id: "lm40", text: "Mon master est cohérent avec ma licence.", dimension: "coherence" },
        { id: "lm41", text: "Mon parcours me prépare efficacement au métier visé.", dimension: "coherence" },
        { id: "lm42", text: "J'ai identifié les formations complémentaires nécessaires.", dimension: "coherence" },
      ]
    },
    {
      dimension: "projet_professionnel",
      label: "Clarté du projet professionnel",
      questions: [
        { id: "lm50", text: "J'ai un projet professionnel précis.", dimension: "projet_professionnel" },
        { id: "lm51", text: "Je connais les exigences du métier que je vise.", dimension: "projet_professionnel" },
        { id: "lm52", text: "J'ai identifié des opportunités concrètes dans mon secteur.", dimension: "projet_professionnel" },
      ]
    },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function TykaCompass() {
  const { currentMember } = useMemberAuth();
  const navigate = useNavigate();
  const [showConsent, setShowConsent] = useState(!getConsent());
  const [selectedBlock, setSelectedBlock] = useState<MainBlock | null>(null);
  const [selectedSubType, setSelectedSubType] = useState<SubType | null>(null);
  const [currentDiagnostic, setCurrentDiagnostic] = useState<CompassDiagnostic | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!currentMember) {
      toast.error("Vous devez être connecté pour accéder à TYKA Compass");
      navigate("/");
    }
  }, [currentMember, navigate]);

  if (!currentMember) return null;

  const handleConsent = () => {
    saveConsent();
    setShowConsent(false);
    toast.success("Vous pouvez maintenant utiliser TYKA Compass");
  };

  const handleBlockSelect = (block: MainBlock) => {
    if (block === "entrepreneurial" || block === "academic") {
      setSelectedBlock(block);
    } else {
      startDiagnostic(block);
    }
  };

  const handleSubTypeSelect = (subType: SubType) => {
    setSelectedSubType(subType);
    if (selectedBlock === "entrepreneurial") {
      startDiagnostic("entrepreneurial", subType === "business" ? "business" : "startup");
    } else if (selectedBlock === "academic") {
      startDiagnostic("academic", subType);
    }
  };

  const startDiagnostic = (block: MainBlock, subType?: string) => {
    const questionnaireKey = subType || block;
    const questionnaire = QUESTIONNAIRES[questionnaireKey];
    
    if (!questionnaire) {
      toast.error("Questionnaire non disponible");
      return;
    }

    const diagnostic: CompassDiagnostic = {
      id: `diagnostic_${Date.now()}`,
      memberId: currentMember.id,
      name: `Diagnostic ${block} - ${new Date().toLocaleDateString("fr-FR")}`,
      mainBlock: block,
      subType: subType as SubType,
      answers: {},
      scores: {},
      globalScore: 0,
      status: "in_progress",
      recommendations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCurrentDiagnostic(diagnostic);
    setAnswers({});
    setCurrentStep(0);
  };

  const handleAnswer = (questionId: string, value: number) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    
    // Auto-save to localStorage
    if (currentDiagnostic) {
      const updatedDiag = {
        ...currentDiagnostic,
        answers: newAnswers,
        updatedAt: new Date().toISOString(),
      };
      saveDiagnostic(updatedDiag);
    }
  };

  const handleNext = () => {
    const questionnaireKey = currentDiagnostic?.subType || currentDiagnostic?.mainBlock;
    const questionnaire = QUESTIONNAIRES[questionnaireKey || ""];
    
    if (!questionnaire) return;

    if (currentStep < questionnaire.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeDiagnostic();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeDiagnostic = () => {
    if (!currentDiagnostic) return;

    const questionnaireKey = currentDiagnostic.subType || currentDiagnostic.mainBlock;
    const questionnaire = QUESTIONNAIRES[questionnaireKey || ""];
    
    // Calculate scores per dimension
    const scores: Record<string, number> = {};
    questionnaire.forEach(section => {
      const sectionQuestions = section.questions;
      const sectionAnswers = sectionQuestions
        .map(q => answers[q.id] || 0)
        .filter(a => a > 0);
      
      if (sectionAnswers.length > 0) {
        scores[section.dimension] = (sectionAnswers.reduce((a, b) => a + b, 0) / sectionAnswers.length) * 20;
      }
    });

    // Calculate global score
    const globalScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;

    // Generate recommendations
    const recommendations = generateRecommendations(currentDiagnostic.mainBlock, scores);

    const completedDiagnostic: CompassDiagnostic = {
      ...currentDiagnostic,
      answers,
      scores,
      globalScore,
      status: "completed",
      recommendations,
      updatedAt: new Date().toISOString(),
    };

    saveDiagnostic(completedDiagnostic);
    setCurrentDiagnostic(completedDiagnostic);
    toast.success("Diagnostic terminé !");
  };

  const generateRecommendations = (block: MainBlock, scores: Record<string, number>): Recommendation[] => {
    const recs: Recommendation[] = [];
    const lowThreshold = 50;

    Object.entries(scores).forEach(([dimension, score]) => {
      if (score < lowThreshold) {
        recs.push({
          category: dimension.replace(/_/g, " "),
          items: getRecommendationsForDimension(block, dimension)
        });
      }
    });

    if (recs.length === 0) {
      recs.push({
        category: "Excellence",
        items: ["Excellent profil ! Continuez sur cette voie", "Partagez votre expertise avec la communauté TYKA"]
      });
    }

    return recs;
  };

  const getRecommendationsForDimension = (block: MainBlock, dimension: string): string[] => {
    const recommendations: Record<string, string[]> = {
      confiance: ["Rejoindre un programme de développement personnel TYKA", "Pratiquer l'auto-affirmation quotidienne"],
      leadership: ["Formation Leadership Collaboratif TYKA", "Animer un projet communautaire"],
      presence_digitale: ["Optimiser votre profil LinkedIn", "Publier du contenu régulièrement"],
      competences_techniques: ["Suivre des certifications dans votre domaine", "Formation continue TYKA"],
      reseau: ["Participer aux événements networking TYKA", "Rejoindre des groupes professionnels"],
      marketing: ["Formation Marketing Digital TYKA", "Développer votre stratégie de contenu"],
      finances: ["Formation Gestion Financière", "Consulter un expert TYKA"],
    };

    return recommendations[dimension] || ["Consulter un expert TYKA dans ce domaine"];
  };

  // Consent Modal
  if (showConsent) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
          <div className="container mx-auto px-6 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Compass className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">TYKA Compass</h1>
                  <p className="text-gray-600">Assistant intelligent d'orientation</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h2 className="text-xl font-semibold text-gray-900">Utilisation des données</h2>
                <p className="text-gray-700">
                  TYKA Compass analyse vos réponses pour générer des recommandations personnalisées. 
                  Vos données sont stockées localement sur votre appareil et ne sont jamais partagées.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Confidentialité :</strong> Toutes vos réponses restent privées et sont uniquement utilisées 
                    pour améliorer vos recommandations.
                  </p>
                </div>
              </div>

              <Button onClick={handleConsent} className="w-full" size="lg">
                J'accepte et je commence
              </Button>
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  // Diagnostic in progress
  if (currentDiagnostic && currentDiagnostic.status === "in_progress") {
    const questionnaireKey = currentDiagnostic.subType || currentDiagnostic.mainBlock;
    const questionnaire = QUESTIONNAIRES[questionnaireKey || ""];
    const currentSection = questionnaire?.[currentStep];

    if (!currentSection) {
      return null;
    }

    const allAnswered = currentSection.questions.every(q => answers[q.id] !== undefined);
    const progress = ((currentStep + 1) / questionnaire.length) * 100;

    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
          <div className="container mx-auto px-6 max-w-4xl">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Section {currentStep + 1} sur {questionnaire.length}
                </span>
                <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question Section */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">{currentSection.label}</CardTitle>
                  <CardDescription>
                    Évaluez chaque affirmation de 1 (pas du tout d'accord) à 5 (tout à fait d'accord)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentSection.questions.map((question, idx) => (
                    <div key={question.id} className="space-y-3">
                      <p className="font-medium text-gray-900">
                        {idx + 1}. {question.text}
                      </p>
                      
                      {/* Text input */}
                      {question.type === "text" && (
                        <input
                          type="text"
                          value={answers[question.id] || ""}
                          onChange={(e) => handleAnswer(question.id, e.target.value as any)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Votre réponse..."
                        />
                      )}
                      
                      {/* Select dropdown */}
                      {question.type === "select" && question.options && (
                        <select
                          value={answers[question.id] || ""}
                          onChange={(e) => handleAnswer(question.id, e.target.value as any)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Sélectionner...</option>
                          {question.options.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      )}
                      
                      {/* Scale 1-5 (default) */}
                      {(!question.type || question.type === "scale") && (
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              onClick={() => handleAnswer(question.id, value)}
                              className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                                answers[question.id] === value
                                  ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                                  : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                              }`}
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                variant="outline"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>
              <Button
                onClick={handleNext}
                disabled={!allAnswered}
              >
                {currentStep === questionnaire.length - 1 ? "Terminer" : "Suivant"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Results view
  if (currentDiagnostic && currentDiagnostic.status === "completed") {
    const radarData = Object.entries(currentDiagnostic.scores).map(([key, value]) => ({
      dimension: key.replace(/_/g, " "),
      score: value,
    }));

    // Calculate top 3 strengths and bottom 3 improvements
    const sortedScores = Object.entries(currentDiagnostic.scores).sort((a, b) => b[1] - a[1]);
    const topStrengths = sortedScores.slice(0, 3);
    const improvements = sortedScores.slice(-3).reverse();

    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
          <div className="container mx-auto px-6 max-w-6xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Résultats de votre diagnostic</h1>
              <p className="text-gray-600">Voici votre profil détaillé et vos recommandations personnalisées</p>
            </div>

            {/* Résumé exécutif */}
            <Card className="shadow-xl mb-8 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Résumé exécutif
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Avec un score global de <strong className="text-blue-600">{Math.round(currentDiagnostic.globalScore)}%</strong>, 
                  votre profil révèle {currentDiagnostic.globalScore >= 75 ? "une excellente maîtrise" : 
                                       currentDiagnostic.globalScore >= 60 ? "un bon niveau de compétences" : 
                                       currentDiagnostic.globalScore >= 40 ? "des compétences en développement" : 
                                       "un potentiel important à développer"} dans ce domaine. 
                  Vos principaux atouts se concentrent sur <strong>{topStrengths[0][0].replace(/_/g, " ")}</strong>, 
                  tandis que des opportunités d'amélioration existent notamment en <strong>{improvements[0][0].replace(/_/g, " ")}</strong>.
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Score global */}
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Score Global
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-6xl font-bold text-blue-600 mb-4">
                      {Math.round(currentDiagnostic.globalScore)}
                      <span className="text-2xl text-gray-400">/100</span>
                    </div>
                    <Badge variant="outline" className="text-lg px-4 py-1">
                      {currentDiagnostic.globalScore >= 75 ? "Excellent" :
                       currentDiagnostic.globalScore >= 60 ? "Bon" :
                       currentDiagnostic.globalScore >= 40 ? "En progression" :
                       "À développer"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Radar Chart */}
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-500" />
                    Profil de compétences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
                      <Radar dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Points forts et axes d'amélioration */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Points forts */}
              <Card className="shadow-xl border-l-4 border-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <TrendingUp className="w-5 h-5" />
                    Points forts
                  </CardTitle>
                  <CardDescription>Vos 3 meilleures dimensions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topStrengths.map(([dimension, score], idx) => (
                    <div key={dimension} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-gray-900 capitalize">{dimension.replace(/_/g, " ")}</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">{Math.round(score)}%</span>
                      </div>
                      <p className="text-sm text-gray-600 pl-7">
                        {score >= 75 ? "Excellence remarquable ! Continuez à cultiver cette force." :
                         score >= 60 ? "Très bon niveau. Cette compétence est un atout majeur." :
                         "Point fort identifié. Capitalisez sur cet avantage."}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Axes prioritaires d'amélioration */}
              <Card className="shadow-xl border-l-4 border-orange-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <Target className="w-5 h-5" />
                    Axes prioritaires d'amélioration
                  </CardTitle>
                  <CardDescription>Opportunités de développement</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {improvements.map(([dimension, score], idx) => (
                    <div key={dimension} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-orange-600" />
                          <span className="font-medium text-gray-900 capitalize">{dimension.replace(/_/g, " ")}</span>
                        </div>
                        <span className="text-lg font-bold text-orange-600">{Math.round(score)}%</span>
                      </div>
                      <p className="text-sm text-gray-600 pl-7">
                        {score < 40 ? "Axe prioritaire de développement. Concentrez vos efforts ici." :
                         score < 60 ? "Potentiel d'amélioration identifié. Des progrès sont possibles." :
                         "Opportunité de perfectionnement pour viser l'excellence."}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recommandations */}
            <Card className="shadow-xl mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Recommandations personnalisées
                </CardTitle>
                <CardDescription>Actions concrètes pour progresser</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentDiagnostic.recommendations.map((rec, idx) => (
                  <div key={idx}>
                    <h3 className="font-semibold text-lg text-gray-900 mb-3 capitalize">{rec.category}</h3>
                    <ul className="space-y-2">
                      {rec.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4 mt-8">
              <Button onClick={() => setCurrentDiagnostic(null)} variant="outline" size="lg">
                <ArrowRight className="w-4 h-4 mr-2" />
                Nouveau diagnostic
              </Button>
              <Button onClick={() => navigate("/compass/historique")} variant="outline" size="lg">
                <Clock className="w-4 h-4 mr-2" />
                Voir l'historique
              </Button>
              <Button onClick={() => window.print()} variant="outline" size="lg">
                <Printer className="w-4 h-4 mr-2" />
                Imprimer le rapport
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Sub-type selection for entrepreneurial
  if (selectedBlock === "entrepreneurial" && !selectedSubType) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Développement Entrepreneurial</h1>
              <p className="text-gray-600">Choisissez votre situation</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="cursor-pointer border-2 hover:border-purple-400 transition-all shadow-lg h-full"
                  onClick={() => handleSubTypeSelect("startup")}
                >
                  <CardHeader>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <Lightbulb className="w-6 h-6 text-purple-600" />
                    </div>
                    <CardTitle>J'ai une idée d'entreprise</CardTitle>
                    <CardDescription className="text-base">
                      Vous souhaitez créer une activité ou une entreprise et transformer votre idée en projet structuré
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="cursor-pointer border-2 hover:border-emerald-400 transition-all shadow-lg h-full"
                  onClick={() => handleSubTypeSelect("business")}
                >
                  <CardHeader>
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                      <BarChart3 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <CardTitle>Je développe mon business</CardTitle>
                    <CardDescription className="text-base">
                      Vous possédez déjà une activité et vous souhaitez identifier les leviers de croissance
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            </div>

            <div className="text-center mt-8">
              <Button onClick={() => setSelectedBlock(null)} variant="outline">
                Retour
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Sub-type selection for academic
  if (selectedBlock === "academic" && !selectedSubType) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Orientation Académique</h1>
              <p className="text-gray-600">Choisissez votre parcours</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="cursor-pointer border-2 hover:border-indigo-400 transition-all shadow-lg h-full"
                  onClick={() => handleSubTypeSelect("post-bac")}
                >
                  <CardHeader>
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                      <GraduationCap className="w-6 h-6 text-indigo-600" />
                    </div>
                    <CardTitle>Orientation Post-Bac</CardTitle>
                    <CardDescription className="text-base">
                      Choisir la bonne formation après le Baccalauréat selon votre profil et vos aspirations
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="cursor-pointer border-2 hover:border-violet-400 transition-all shadow-lg h-full"
                  onClick={() => handleSubTypeSelect("licence-master")}
                >
                  <CardHeader>
                    <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                      <BookOpen className="w-6 h-6 text-violet-600" />
                    </div>
                    <CardTitle>Orientation Licence → Master</CardTitle>
                    <CardDescription className="text-base">
                      Valider la cohérence de votre parcours académique et professionnel
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-lg mt-8">
              <div className="flex gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">Fonctionnalité en développement</h3>
                  <p className="text-amber-800">
                    Les questionnaires d'orientation académique seront bientôt disponibles. 
                    Ils analyseront la cohérence entre votre formation, vos compétences et votre projet professionnel.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <Button onClick={() => setSelectedBlock(null)} variant="outline">
                Retour
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Main block selection
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Compass className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-bold text-gray-900">TYKA Compass</h1>
                <p className="text-gray-600">Assistant intelligent d'orientation et de développement</p>
              </div>
            </div>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Identifiez vos besoins prioritaires et recevez des recommandations personnalisées 
              pour construire un parcours cohérent entre vos aspirations, compétences et projets de vie.
            </p>
          </div>

          {/* 4 Main Blocks */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Block 1: Développement Personnel */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="cursor-pointer border-2 hover:border-rose-400 transition-all shadow-xl h-full bg-gradient-to-br from-rose-50 to-white"
                onClick={() => handleBlockSelect("personal")}
              >
                <CardHeader>
                  <div className="w-14 h-14 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
                    <Heart className="w-7 h-7 text-rose-600" />
                  </div>
                  <CardTitle className="text-2xl text-rose-900">Développement Personnel</CardTitle>
                  <CardDescription className="text-base text-gray-700">
                    Évaluez vos compétences comportementales, relationnelles et personnelles : 
                    confiance en soi, leadership, gestion du temps, communication, présence digitale...
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-rose-600 font-medium">
                    Commencer le diagnostic
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Block 2: Développement Professionnel */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="cursor-pointer border-2 hover:border-blue-400 transition-all shadow-xl h-full bg-gradient-to-br from-blue-50 to-white"
                onClick={() => handleBlockSelect("professional")}
              >
                <CardHeader>
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <Briefcase className="w-7 h-7 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl text-blue-900">Développement Professionnel</CardTitle>
                  <CardDescription className="text-base text-gray-700">
                    Renforcez votre employabilité : positionnement professionnel, compétences techniques, 
                    réseau, évolution de carrière, recherche d'opportunités...
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-blue-600 font-medium">
                    Commencer le diagnostic
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Block 3: Développement Entrepreneurial */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="cursor-pointer border-2 hover:border-purple-400 transition-all shadow-xl h-full bg-gradient-to-br from-purple-50 to-white"
                onClick={() => handleBlockSelect("entrepreneurial")}
              >
                <CardHeader>
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                    <Rocket className="w-7 h-7 text-purple-600" />
                  </div>
                  <CardTitle className="text-2xl text-purple-900">Développement Entrepreneurial</CardTitle>
                  <CardDescription className="text-base text-gray-700">
                    Créez ou développez votre entreprise : Business Model Canvas, diagnostic 360°, 
                    viabilité de l'idée, leviers de croissance...
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-purple-600 font-medium">
                    Choisir mon parcours
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Block 4: Orientation Académique */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="cursor-pointer border-2 hover:border-indigo-400 transition-all shadow-xl h-full bg-gradient-to-br from-indigo-50 to-white"
                onClick={() => handleBlockSelect("academic")}
              >
                <CardHeader>
                  <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                    <GraduationCap className="w-7 h-7 text-indigo-600" />
                  </div>
                  <CardTitle className="text-2xl text-indigo-900">Orientation Académique</CardTitle>
                  <CardDescription className="text-base text-gray-700">
                    Faites des choix de formation cohérents : Post-Bac, Licence→Master, 
                    analyse de cohérence, perspectives professionnelles...
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-indigo-600 font-medium">
                    Choisir mon parcours
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Previous diagnostics */}
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Mes diagnostics précédents</h2>
              {getDiagnostics(currentMember.id).filter(d => d.status === "completed").length > 0 && (
                <Button onClick={() => navigate("/compass/historique")} variant="outline">
                  <Clock className="w-4 h-4 mr-2" />
                  Voir l'historique complet
                </Button>
              )}
            </div>
            {getDiagnostics(currentMember.id).length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Vous n'avez pas encore réalisé de diagnostic</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getDiagnostics(currentMember.id).map((diag) => (
                  <Card key={diag.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg">{diag.name}</CardTitle>
                      <CardDescription>
                        {new Date(diag.createdAt).toLocaleDateString("fr-FR")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant={diag.status === "completed" ? "default" : "secondary"}>
                          {diag.status === "completed" ? "Terminé" : "En cours"}
                        </Badge>
                        {diag.status === "completed" && (
                          <span className="text-2xl font-bold text-blue-600">
                            {Math.round(diag.globalScore)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}