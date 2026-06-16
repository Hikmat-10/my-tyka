import { useState } from "react";
import { Calculator, Download, Send, Plus, Trash2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import jsPDF from "jspdf";

type Modality = "online" | "physical" | "hybrid";

interface ProjectInfo {
  title: string;
  activityType: string;
  modality: Modality;
  date: string;
  location: string;
  participants: number;
  duration: string;
}

interface CostItem {
  id: string;
  label: string;
  value: number;
}

interface Costs {
  pedagogical: CostItem[];
  logistics: CostItem[];
  catering: CostItem[];
  communication: CostItem[];
  other: CostItem[];
}

export function CostEstimationTool() {
  const [project, setProject] = useState<ProjectInfo>({
    title: "",
    activityType: "",
    modality: "physical",
    date: "",
    location: "",
    participants: 0,
    duration: ""
  });

  const [pricePerParticipant, setPricePerParticipant] = useState<number>(0);
  const [bdCommissionRate, setBdCommissionRate] = useState<number>(2.5);

  const [costs, setCosts] = useState<Costs>({
    pedagogical: [
      { id: "p1", label: "Formateur", value: 0 },
      { id: "p2", label: "Assistant", value: 0 },
      { id: "p3", label: "Création de contenu", value: 0 },
      { id: "p4", label: "Impression", value: 0 }
    ],
    logistics: [
      { id: "l1", label: "Location de salle", value: 0 },
      { id: "l2", label: "Transport", value: 0 },
      { id: "l3", label: "Carburant", value: 0 },
      { id: "l4", label: "Location vidéoprojecteur", value: 0 },
      { id: "l5", label: "Système audio", value: 0 },
      { id: "l6", label: "Internet", value: 0 }
    ],
    catering: [
      { id: "c1", label: "Pause café", value: 0 },
      { id: "c2", label: "Déjeuner", value: 0 },
      { id: "c3", label: "Eau", value: 0 }
    ],
    communication: [
      { id: "co1", label: "Visuels", value: 0 },
      { id: "co2", label: "Publicité réseaux sociaux", value: 0 },
      { id: "co3", label: "Téléphone / suivi", value: 0 },
      { id: "co4", label: "Couverture médiatique", value: 0 }
    ],
    other: [
      { id: "o1", label: "Frais administratifs", value: 0 },
      { id: "o2", label: "Divers", value: 0 }
    ]
  });

  // CALCULATION 1 - Total Direct Costs (CTD)
  const calculateCTD = () => {
    let total = 0;
    Object.values(costs).forEach(category => {
      category.forEach(item => {
        total += item.value;
      });
    });
    return total;
  };

  const CTD = calculateCTD();

  // CALCULATION 2 - Total Revenue (PV)
  const PV = pricePerParticipant * project.participants;

  // CALCULATION 3 - Gross Margin (MB)
  const MB = PV - CTD;

  // CALCULATION 4 - BD Commission (CBD)
  const CBD = MB <= 0 ? 0 : (MB * bdCommissionRate) / 100;

  // CALCULATION 5 - TYKA Margin (MT)
  const MT = MB - CBD;

  // CALCULATION 6 - Profitability Status
  const getProfitabilityStatus = () => {
    if (MB < 0) return { status: "loss", label: "🔴 Perte", color: "bg-red-100 text-red-800 border-red-300" };
    if (MT <= 0) return { status: "low", label: "🟠 Marge faible", color: "bg-orange-100 text-orange-800 border-orange-300" };
    if (MT / PV < 0.1 && PV > 0) return { status: "low", label: "🟠 Marge faible", color: "bg-orange-100 text-orange-800 border-orange-300" };
    return { status: "profitable", label: "🟢 Rentable", color: "bg-green-100 text-green-800 border-green-300" };
  };

  const profitabilityStatus = getProfitabilityStatus();

  // CALCULATION 7 - Break-even Price
  const breakEvenPrice = project.participants > 0 ? CTD / project.participants : 0;

  const formatFCFA = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value) + ' FCFA';
  };

  const updateCostItem = (category: keyof Costs, id: string, value: number) => {
    setCosts(prev => ({
      ...prev,
      [category]: prev[category].map(item => 
        item.id === id ? { ...item, value } : item
      )
    }));
  };

  const addCostItem = (category: keyof Costs) => {
    const newId = `${category}_${Date.now()}`;
    setCosts(prev => ({
      ...prev,
      [category]: [...prev[category], { id: newId, label: "", value: 0 }]
    }));
  };

  const removeCostItem = (category: keyof Costs, id: string) => {
    setCosts(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.id !== id)
    }));
  };

  const updateCostLabel = (category: keyof Costs, id: string, label: string) => {
    setCosts(prev => ({
      ...prev,
      [category]: prev[category].map(item => 
        item.id === id ? { ...item, label } : item
      )
    }));
  };

  const handleExportPDF = () => {
    if (!project.title.trim()) {
      toast.error("Veuillez entrer un titre de projet");
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;
      const lineHeight = 7;
      const margin = 20;

      // Helper function to add text with word wrap
      const addText = (text: string, x: number, y: number, maxWidth?: number, style?: any) => {
        if (style) {
          doc.setFont("helvetica", style.weight || "normal");
          doc.setFontSize(style.size || 10);
        }
        if (maxWidth) {
          const lines = doc.splitTextToSize(text, maxWidth);
          doc.text(lines, x, y);
          return lines.length * lineHeight;
        }
        doc.text(text, x, y);
        return lineHeight;
      };

      // Header
      doc.setFillColor(255, 140, 0);
      doc.rect(0, 0, pageWidth, 30, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("ESTIMATION DE COUTS - TYKA", pageWidth / 2, 15, { align: "center" });
      doc.setFontSize(10);
      doc.text("Calculs Automatises", pageWidth / 2, 22, { align: "center" });

      yPos = 45;
      doc.setTextColor(0, 0, 0);

      // Project Information
      doc.setFillColor(240, 248, 255);
      doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, "F");
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("INFORMATIONS PROJET", margin + 2, yPos);
      yPos += 12;

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Titre:`, margin, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(project.title, margin + 25, yPos);
      yPos += lineHeight;

      if (project.activityType) {
        doc.setFont("helvetica", "bold");
        doc.text(`Type:`, margin, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(project.activityType, margin + 25, yPos);
        yPos += lineHeight;
      }

      doc.setFont("helvetica", "bold");
      doc.text(`Modalite:`, margin, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(project.modality === "online" ? "En ligne" : project.modality === "physical" ? "Presentiel" : "Hybride", margin + 25, yPos);
      yPos += lineHeight;

      if (project.date) {
        doc.setFont("helvetica", "bold");
        doc.text(`Date:`, margin, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(project.date, margin + 25, yPos);
        yPos += lineHeight;
      }

      if (project.location) {
        doc.setFont("helvetica", "bold");
        doc.text(`Localisation:`, margin, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(project.location, margin + 25, yPos);
        yPos += lineHeight;
      }

      doc.setFont("helvetica", "bold");
      doc.text(`Participants (N):`, margin, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(String(project.participants), margin + 35, yPos);
      yPos += lineHeight;

      if (project.duration) {
        doc.setFont("helvetica", "bold");
        doc.text(`Duree:`, margin, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(project.duration, margin + 25, yPos);
        yPos += lineHeight;
      }

      yPos += 5;

      // Costs Details
      doc.setFillColor(240, 248, 255);
      doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, "F");
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("DETAIL DES COUTS (FCFA)", margin + 2, yPos);
      yPos += 12;

      const addCostCategory = (title: string, items: CostItem[]) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(title, margin, yPos);
        yPos += lineHeight;

        doc.setFont("helvetica", "normal");
        items.forEach(item => {
          if (item.label && item.value > 0) {
            doc.text(`  ${item.label}:`, margin + 2, yPos);
            doc.text(formatFCFA(item.value), pageWidth - margin - 2, yPos, { align: "right" });
            yPos += lineHeight - 1;
          }
        });
        yPos += 3;
      };

      addCostCategory("A. COUTS PEDAGOGIQUES", costs.pedagogical);
      addCostCategory("B. LOGISTIQUE", costs.logistics);
      addCostCategory("C. RESTAURATION", costs.catering);
      addCostCategory("D. COMMUNICATION", costs.communication);
      addCostCategory("E. AUTRES COUTS", costs.other);

      yPos += 5;

      // Calculations
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFillColor(255, 248, 240);
      doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 8, "F");
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("CALCULS AUTOMATIQUES", margin + 2, yPos);
      yPos += 12;

      doc.setFontSize(10);
      
      // CTD
      doc.setFont("helvetica", "bold");
      doc.text("CTD (Couts Totaux Directs):", margin, yPos);
      doc.setTextColor(200, 0, 0);
      doc.text(formatFCFA(CTD), pageWidth - margin - 2, yPos, { align: "right" });
      doc.setTextColor(0, 0, 0);
      yPos += lineHeight;

      // PP
      doc.setFont("helvetica", "bold");
      doc.text("PP (Prix par participant):", margin, yPos);
      doc.text(formatFCFA(pricePerParticipant), pageWidth - margin - 2, yPos, { align: "right" });
      yPos += lineHeight;

      // PV
      doc.setFont("helvetica", "bold");
      doc.text(`PV (Revenu Total) = PP x N:`, margin, yPos);
      doc.setTextColor(0, 100, 200);
      doc.text(formatFCFA(PV), pageWidth - margin - 2, yPos, { align: "right" });
      doc.setTextColor(0, 0, 0);
      yPos += lineHeight + 3;

      // MB
      doc.setFont("helvetica", "bold");
      doc.text("MB (Marge Brute) = PV - CTD:", margin, yPos);
      doc.setTextColor(MB >= 0 ? 0 : 200, MB >= 0 ? 150 : 0, 0);
      doc.text(formatFCFA(MB), pageWidth - margin - 2, yPos, { align: "right" });
      doc.setTextColor(0, 0, 0);
      yPos += lineHeight;

      // Commission BD
      doc.setFont("helvetica", "normal");
      doc.text(`Taux commission BD: ${bdCommissionRate}%`, margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "bold");
      doc.text(`CBD (Commission BD) = MB x ${bdCommissionRate}%:`, margin, yPos);
      doc.setTextColor(255, 140, 0);
      doc.text(formatFCFA(CBD), pageWidth - margin - 2, yPos, { align: "right" });
      doc.setTextColor(0, 0, 0);
      yPos += lineHeight + 3;

      // MT
      doc.setFont("helvetica", "bold");
      doc.text("MT (Marge TYKA) = MB - CBD:", margin, yPos);
      doc.setTextColor(MT >= 0 ? 0 : 200, MT >= 0 ? 100 : 0, 0);
      doc.text(formatFCFA(MT), pageWidth - margin - 2, yPos, { align: "right" });
      doc.setTextColor(0, 0, 0);
      yPos += lineHeight + 5;

      // Break-even
      doc.setFont("helvetica", "bold");
      doc.text("Prix d'equilibre (minimum):", margin, yPos);
      doc.setTextColor(150, 100, 0);
      doc.text(formatFCFA(breakEvenPrice), pageWidth - margin - 2, yPos, { align: "right" });
      doc.setTextColor(0, 0, 0);
      yPos += lineHeight + 5;

      // Profitability Status
      doc.setFillColor(profitabilityStatus.status === "profitable" ? 200 : profitabilityStatus.status === "loss" ? 255 : 255, 
                       profitabilityStatus.status === "profitable" ? 240 : 240, 
                       profitabilityStatus.status === "profitable" ? 200 : 200);
      doc.rect(margin, yPos - 5, pageWidth - 2 * margin, 10, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`STATUT: ${profitabilityStatus.label}`, pageWidth / 2, yPos, { align: "center" });

      // Footer
      yPos = doc.internal.pageSize.getHeight() - 15;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(`Document genere le ${new Date().toLocaleDateString('fr-FR')} a ${new Date().toLocaleTimeString('fr-FR')}`, 
               pageWidth / 2, yPos, { align: "center" });

      // Save PDF
      doc.save(`estimation_${project.title.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
      
      toast.success("PDF téléchargé avec succès !");
    } catch (error) {
      console.error("Erreur génération PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  const handleSubmit = () => {
    if (!project.title.trim()) {
      toast.error("Veuillez entrer un titre de projet");
      return;
    }
    
    if (project.participants <= 0) {
      toast.error("Le nombre de participants doit être supérieur à 0");
      return;
    }

    const estimation = {
      id: `est_${Date.now()}`,
      project,
      costs,
      calculations: {
        CTD,
        pricePerParticipant,
        PV,
        MB,
        bdCommissionRate,
        CBD,
        MT,
        breakEvenPrice,
        profitabilityStatus: profitabilityStatus.label
      },
      status: "pending",
      submittedAt: new Date().toISOString(),
      submittedBy: localStorage.getItem("tykaAdminEmail") || "Business Developer"
    };
    
    const existingEstimations = JSON.parse(localStorage.getItem("tykaEstimations") || "[]");
    existingEstimations.push(estimation);
    localStorage.setItem("tykaEstimations", JSON.stringify(existingEstimations));
    
    toast.success("Estimation soumise au Pool Management !");
    
    // Reload page to show in history
    window.location.reload();
  };

  const renderCostCategory = (
    title: string,
    icon: string,
    category: keyof Costs,
    bgColor: string
  ) => (
    <Card className={`shadow-md ${bgColor}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {costs[category].map((item) => (
          <div key={item.id} className="flex gap-2 items-start">
            <div className="flex-1 grid grid-cols-2 gap-2">
              <Input
                placeholder="Libellé"
                value={item.label}
                onChange={(e) => updateCostLabel(category, item.id, e.target.value)}
                className="text-sm h-9 bg-white"
              />
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={item.value || ""}
                onChange={(e) => updateCostItem(category, item.id, Number(e.target.value))}
                className="text-sm h-9 bg-white"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-red-500 hover:bg-red-50"
              onClick={() => removeCostItem(category, item.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2 h-8 text-xs"
          onClick={() => addCostItem(category)}
        >
          <Plus className="w-3 h-3 mr-1" />
          Ajouter une ligne
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Calculator className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            Outil d'Estimation de Coûts (Automatisé)
          </CardTitle>
          <CardDescription className="text-sm md:text-base">
            Calculs en temps réel : CTD, PV, MB, CBD, MT - Toutes les valeurs en FCFA (XOF)
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Main Grid: Form + Summary Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Form (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. PROJECT INFORMATION */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
              <CardTitle className="text-lg">📋 Informations Projet</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
              <div className="md:col-span-2">
                <Label htmlFor="project-title" className="font-semibold">Titre du projet *</Label>
                <Input
                  id="project-title"
                  value={project.title}
                  onChange={(e) => setProject(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Formation en entrepreneuriat digital"
                  className="mt-1.5"
                />
              </div>
              
              <div>
                <Label htmlFor="activity-type" className="font-medium">Type d'activité</Label>
                <Input
                  id="activity-type"
                  value={project.activityType}
                  onChange={(e) => setProject(prev => ({ ...prev, activityType: e.target.value }))}
                  placeholder="Ex: Formation, Atelier..."
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="modality" className="font-medium">Modalité *</Label>
                <Select 
                  value={project.modality} 
                  onValueChange={(val: Modality) => setProject(prev => ({ ...prev, modality: val }))}
                >
                  <SelectTrigger id="modality" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">🌐 En ligne</SelectItem>
                    <SelectItem value="physical">🏢 Présentiel</SelectItem>
                    <SelectItem value="hybrid">🔄 Hybride</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date" className="font-medium">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={project.date}
                  onChange={(e) => setProject(prev => ({ ...prev, date: e.target.value }))}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="location" className="font-medium">Localisation</Label>
                <Input
                  id="location"
                  value={project.location}
                  onChange={(e) => setProject(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Ville, pays..."
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="participants" className="font-semibold">Nombre de participants (N) *</Label>
                <Input
                  id="participants"
                  type="number"
                  min="1"
                  value={project.participants || ""}
                  onChange={(e) => setProject(prev => ({ ...prev, participants: Number(e.target.value) }))}
                  className="mt-1.5 font-semibold"
                />
              </div>

              <div>
                <Label htmlFor="duration" className="font-medium">Durée</Label>
                <Input
                  id="duration"
                  value={project.duration}
                  onChange={(e) => setProject(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="Ex: 3 jours"
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>

          {/* 2. COST BREAKDOWN */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">💰 Répartition des Coûts (FCFA)</h2>
            
            {renderCostCategory("A. Coûts Pédagogiques", "📚", "pedagogical", "border-purple-200")}
            {renderCostCategory("B. Logistique", "🚚", "logistics", "border-blue-200")}
            {renderCostCategory("C. Restauration", "🍽️", "catering", "border-green-200")}
            {renderCostCategory("D. Communication", "📢", "communication", "border-orange-200")}
            {renderCostCategory("E. Autres Coûts", "📌", "other", "border-gray-200")}
          </div>

          {/* 3. PRICING SECTION */}
          <Card className="shadow-lg border-2 border-blue-300">
            <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100">
              <CardTitle className="text-lg">💵 Tarification</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Label htmlFor="price-per-participant" className="text-base font-bold">
                Prix par participant (PP) *
              </Label>
              <Input
                id="price-per-participant"
                type="number"
                min="0"
                value={pricePerParticipant || ""}
                onChange={(e) => setPricePerParticipant(Number(e.target.value))}
                className="mt-2 h-12 text-xl font-bold text-center"
                placeholder="0"
              />
              {pricePerParticipant > 0 && (
                <p className="text-center mt-2 text-blue-600 font-semibold">
                  {formatFCFA(pricePerParticipant)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* 4. BD COMMISSION */}
          <Card className="shadow-lg border-2 border-orange-300">
            <CardHeader className="bg-gradient-to-r from-orange-100 to-yellow-100">
              <CardTitle className="text-lg">📊 Commission Business Developer</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label className="text-base font-semibold">
                  Taux de commission BD (TBD): {bdCommissionRate}%
                </Label>
                <Slider
                  value={[bdCommissionRate]}
                  onValueChange={(val) => setBdCommissionRate(val[0])}
                  min={0}
                  max={5}
                  step={0.1}
                  className="mt-3"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>0%</span>
                  <span>5%</span>
                </div>
              </div>

              {MB <= 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <p className="text-sm text-red-800">
                    <span className="font-semibold">Aucune commission :</span> La marge brute est négative ou nulle.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN: Summary Panel (1/3) - STICKY */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            
            {/* Total Costs */}
            <Card className="shadow-xl border-2 border-gray-300">
              <CardHeader className="pb-3 bg-gray-50">
                <CardTitle className="text-sm font-bold text-gray-700">COÛTS TOTAUX</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">CTD (Total Direct)</p>
                  <p className="text-2xl font-bold text-gray-900">{formatFCFA(CTD)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Revenue */}
            <Card className="shadow-xl border-2 border-blue-300">
              <CardHeader className="pb-3 bg-blue-50">
                <CardTitle className="text-sm font-bold text-blue-700">REVENU TOTAL</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">PV = PP × N</p>
                  <p className="text-2xl font-bold text-blue-600">{formatFCFA(PV)}</p>
                </div>
                <div className="text-xs text-gray-600 text-center bg-blue-50 rounded p-2">
                  {formatFCFA(pricePerParticipant)} × {project.participants}
                </div>
              </CardContent>
            </Card>

            {/* Profitability */}
            <Card className={`shadow-xl border-2 ${MB >= 0 ? 'border-green-300' : 'border-red-300'}`}>
              <CardHeader className={`pb-3 ${MB >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <CardTitle className="text-sm font-bold text-gray-700">RENTABILITÉ</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                
                <div>
                  <p className="text-xs text-gray-600 mb-1">Marge Brute (MB)</p>
                  <p className={`text-xl font-bold ${MB >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatFCFA(MB)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">= PV - CTD</p>
                </div>

                <div className="border-t pt-3">
                  <p className="text-xs text-gray-600 mb-1">Commission BD ({bdCommissionRate}%)</p>
                  <p className="text-lg font-semibold text-orange-600">
                    {formatFCFA(CBD)}
                  </p>
                </div>

                <div className="border-t pt-3">
                  <p className="text-xs text-gray-600 mb-1">Marge TYKA (MT)</p>
                  <p className={`text-xl font-bold ${MT >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatFCFA(MT)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">= MB - CBD</p>
                </div>

                <Badge className={`w-full justify-center py-2 text-sm border ${profitabilityStatus.color}`}>
                  {profitabilityStatus.label}
                </Badge>
              </CardContent>
            </Card>

            {/* Break-even */}
            <Card className="shadow-xl border-2 border-yellow-300">
              <CardHeader className="pb-3 bg-yellow-50">
                <CardTitle className="text-sm font-bold text-yellow-800">PRIX D'ÉQUILIBRE</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Prix minimum (CTD ÷ N)</p>
                  <p className="text-xl font-bold text-yellow-700">{formatFCFA(breakEvenPrice)}</p>
                  {project.participants > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Pour éviter les pertes
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-11"
                onClick={handleSubmit}
                disabled={!project.title || project.participants <= 0}
              >
                <Send className="w-4 h-4 mr-2" />
                Soumettre
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-10"
                onClick={handleExportPDF}
                disabled={!project.title}
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}