import { AdminLayout } from "../../components/admin/AdminLayout";
import {
  TrendingUp, DollarSign, CreditCard, Users, Calendar, Download,
  ArrowUpRight, FileText, CheckCircle, Clock, Search, Filter, X,
  ChevronDown, Printer
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { useState, useEffect, useMemo } from "react";
import {
  getFinancialStats,
  getAllValidatedPayments,
  getAllPendingPayments,
  exportFinancialDataToCSV,
  type FinancialStats,
  type ValidatedPayment
} from "../../services/dataService";
import { toast } from "sonner";
import { motion } from "motion/react";

export default function FinancialDashboard() {
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [validatedPayments, setValidatedPayments] = useState<ValidatedPayment[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<"month" | "year" | "all">("month");
  const [searchMember, setSearchMember] = useState("");
  const [filterCohort, setFilterCohort] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadData();
    const handlePaymentValidated = () => loadData();
    window.addEventListener('tykaPaymentValidated', handlePaymentValidated);
    return () => window.removeEventListener('tykaPaymentValidated', handlePaymentValidated);
  }, []);

  const loadData = () => {
    const financialStats = getFinancialStats();
    setStats(financialStats);
    setValidatedPayments(getAllValidatedPayments());
    setPendingPayments(getAllPendingPayments());
  };

  // Unique cohorts for filter dropdown
  const cohortOptions = useMemo(() => {
    const set = new Map<string, string>();
    validatedPayments.forEach(p => set.set(p.cohortId, p.cohortTitle));
    return Array.from(set.entries()).map(([id, title]) => ({ id, title }));
  }, [validatedPayments]);

  // Filtered payments table
  const filteredPayments = useMemo(() => {
    return validatedPayments.filter(p => {
      if (searchMember && !p.memberName.toLowerCase().includes(searchMember.toLowerCase()) && !p.memberEmail.toLowerCase().includes(searchMember.toLowerCase())) return false;
      if (filterCohort !== "all" && p.cohortId !== filterCohort) return false;
      if (filterDateFrom && new Date(p.validatedAt) < new Date(filterDateFrom)) return false;
      if (filterDateTo && new Date(p.validatedAt) > new Date(filterDateTo + "T23:59:59")) return false;
      // Period filter
      const now = new Date();
      const pDate = new Date(p.validatedAt);
      if (selectedPeriod === "month" && (pDate.getMonth() !== now.getMonth() || pDate.getFullYear() !== now.getFullYear())) return false;
      if (selectedPeriod === "year" && pDate.getFullYear() !== now.getFullYear()) return false;
      return true;
    });
  }, [validatedPayments, searchMember, filterCohort, filterDateFrom, filterDateTo, selectedPeriod]);

  const filteredTotal = filteredPayments.reduce((s, p) => s + p.amount, 0);

  const handleExportCSV = () => {
    try {
      const csvData = exportFinancialDataToCSV();
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `tyka_paiements_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Export CSV réussi");
    } catch {
      toast.error("Impossible d'exporter");
    }
  };

  const handleExportPDF = () => {
    const rows = filteredPayments.map(p =>
      `<tr><td>${p.memberName}</td><td>${p.memberEmail}</td><td>${p.cohortTitle}</td><td>${formatFCFA(p.amount)}</td><td>${new Date(p.validatedAt).toLocaleDateString("fr-FR")}</td><td>Validé</td></tr>`
    ).join("");
    const html = `
      <html><head><title>Paiements TYKA</title>
      <style>body{font-family:sans-serif;padding:20px}h1{color:#1B2A4A}table{width:100%;border-collapse:collapse}th{background:#1B2A4A;color:white;padding:8px;text-align:left}td{padding:8px;border-bottom:1px solid #eee}tfoot td{font-weight:bold;background:#f9f9f9}</style>
      </head><body>
      <h1>Tableau des Paiements — TYKA</h1>
      <p>Généré le ${new Date().toLocaleDateString("fr-FR")} — ${filteredPayments.length} paiements — Total : ${formatFCFA(filteredTotal)}</p>
      <table><thead><tr><th>Membre</th><th>Email</th><th>Cohorte</th><th>Montant</th><th>Date</th><th>Statut</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="3">TOTAL</td><td>${formatFCFA(filteredTotal)}</td><td colspan="2">${filteredPayments.length} paiements</td></tr></tfoot>
      </table></body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); w.print(); }
  };

  const formatFCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + " FCFA";
  };

  const resetFilters = () => { setSearchMember(""); setFilterCohort("all"); setFilterDateFrom(""); setFilterDateTo(""); };

  if (!stats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Chargement des données financières...</p>
        </div>
      </AdminLayout>
    );
  }

  const getRevenueForPeriod = () => {
    switch (selectedPeriod) {
      case "month":
        return stats.monthlyRevenue;
      case "year":
        return stats.yearlyRevenue;
      case "all":
        return stats.totalRevenue;
    }
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case "month":
        return "ce mois";
      case "year":
        return "cette année";
      case "all":
        return "total";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
              Tableau de Bord Financier
            </h1>
            <p className="text-gray-600 mt-1">Suivi du chiffre d'affaires et des paiements TYKA</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportCSV} variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
              <Download className="w-4 h-4 mr-2" />CSV
            </Button>
            <Button onClick={handleExportPDF} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90">
              <Printer className="w-4 h-4 mr-2" />Imprimer / PDF
            </Button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {[
            { value: "month" as const, label: "Ce mois" },
            { value: "year" as const, label: "Cette année" },
            { value: "all" as const, label: "Total" },
          ].map(period => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedPeriod === period.value
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border"
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Chiffre d'affaires {getPeriodLabel()}
                  </CardTitle>
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-emerald-700">
                  {formatFCFA(getRevenueForPeriod())}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs text-emerald-600 font-medium">
                    {stats.totalPayments} paiements validés
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Paiements validés
                  </CardTitle>
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-700">
                  {stats.totalPayments}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Montant moyen : {formatFCFA(stats.averagePaymentAmount)}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    En attente
                  </CardTitle>
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-amber-700">
                  {stats.pendingPayments}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Paiements à valider
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    CA Année en cours
                  </CardTitle>
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-700">
                  {formatFCFA(stats.yearlyRevenue)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date().getFullYear()}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Revenue by Cohort */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              Chiffre d'affaires par Cohorte
            </CardTitle>
            <CardDescription>
              Répartition des revenus par formation
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.revenueByCohort.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                Aucune donnée disponible
              </p>
            ) : (
              <div className="space-y-3">
                {stats.revenueByCohort.map((cohort, index) => (
                  <div
                    key={cohort.cohortId}
                    className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{cohort.cohortTitle}</p>
                      <p className="text-xs text-gray-500">{cohort.count} participant(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-700">{formatFCFA(cohort.amount)}</p>
                      <p className="text-xs text-gray-500">
                        Moyenne : {formatFCFA(cohort.amount / cohort.count)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Table with search/filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Tableau des paiements
                </CardTitle>
                <CardDescription>
                  {filteredPayments.length} paiement{filteredPayments.length > 1 ? "s" : ""} — Total affiché : <strong className="text-emerald-700">{formatFCFA(filteredTotal)}</strong>
                </CardDescription>
              </div>
              <button onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${showFilters ? "bg-blue-50 border-blue-300 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                <Filter className="w-4 h-4" />Filtres {(searchMember || filterCohort !== "all" || filterDateFrom || filterDateTo) ? "●" : ""}
              </button>
            </div>

            {/* Search & Filters */}
            {showFilters && (
              <div className="mt-4 space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                {/* Search member */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={searchMember} onChange={e => setSearchMember(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    placeholder="Rechercher par nom ou email du membre..." />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Filter by cohort */}
                  <select value={filterCohort} onChange={e => setFilterCohort(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white">
                    <option value="all">Toutes les cohortes</option>
                    {cohortOptions.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                  {/* Date from */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Du</label>
                    <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                  </div>
                  {/* Date to */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Au</label>
                    <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
                  </div>
                </div>
                {(searchMember || filterCohort !== "all" || filterDateFrom || filterDateTo) && (
                  <button onClick={resetFilters} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700">
                    <X className="w-3.5 h-3.5" />Réinitialiser les filtres
                  </button>
                )}
              </div>
            )}
          </CardHeader>

          <CardContent>
            {filteredPayments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">Aucun paiement correspondant aux filtres</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Membre</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Cohorte / Initiative</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Date</th>
                      <th className="text-right py-3 px-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Montant</th>
                      <th className="text-center py-3 px-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment, i) => (
                      <tr key={payment.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                        <td className="py-3 px-3">
                          <p className="font-medium text-gray-900">{payment.memberName}</p>
                          <p className="text-xs text-gray-400">{payment.memberEmail}</p>
                        </td>
                        <td className="py-3 px-3">
                          <p className="text-gray-700 font-medium line-clamp-1">{payment.cohortTitle}</p>
                        </td>
                        <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                          {new Date(payment.validatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-700 whitespace-nowrap">
                          {formatFCFA(payment.amount)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge className="bg-emerald-100 text-emerald-700 text-xs border-0">Validé</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-emerald-200 bg-emerald-50">
                      <td className="py-3 px-3 font-bold text-gray-800" colSpan={3}>
                        Total ({filteredPayments.length} paiements)
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-700 text-base">{formatFCFA(filteredTotal)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
