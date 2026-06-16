# 💰 Guide de l'Outil d'Estimation de Coûts - TYKA Business Developer

## 🎯 Vue d'ensemble

L'outil d'estimation de coûts est une fonctionnalité **entièrement automatisée** conçue pour les Business Developers de TYKA. Il permet de calculer automatiquement la rentabilité d'une initiative ou d'un projet en temps réel avec des **calculs précis et transparents**.

Toutes les valeurs sont en **FCFA (XOF)**.

---

## ✨ Fonctionnalités Principales

### 🟦 1. INFORMATIONS DU PROJET

**Section complète** permettant de définir :

- **Titre du projet / initiative*** (obligatoire)
  - Exemple : "Formation en entrepreneuriat digital"
  
- **Type d'activité**
  - Exemple : "Formation", "Atelier", "Conférence"
  
- **Modalité*** (dropdown)
  - 🌐 **En ligne**
  - 🏢 **Présentiel**
  - 🔄 **Hybride**

- **Date** (sélecteur de date)

- **Localisation**
  - Exemple : "Dakar, Sénégal"

- **Nombre de participants (N)*** (obligatoire)
  - Utilisé dans les calculs automatiques

- **Durée**
  - Exemple : "3 jours"

---

## 💰 2. RÉPARTITION DES COÛTS (5 CATÉGORIES)

Chaque catégorie est **éditable en ligne** avec possibilité d'**ajouter/supprimer des lignes** dynamiquement.

### A. Coûts Pédagogiques 📚
- Formateur
- Assistant
- Création de contenu
- Impression
- *+ Ajouter une ligne*

### B. Logistique 🚚
- Location de salle
- Transport
- Carburant
- Location vidéoprojecteur
- Système audio
- Internet
- *+ Ajouter une ligne*

### C. Restauration 🍽️
- Pause café
- Déjeuner
- Eau
- *+ Ajouter une ligne*

### D. Communication 📢
- Visuels
- Publicité réseaux sociaux
- Téléphone / suivi
- Couverture médiatique
- *+ Ajouter une ligne*

### E. Autres Coûts 📌
- Frais administratifs
- Divers
- *+ Ajouter une ligne*

**UX** : Chaque ligne affiche un champ pour le libellé et un champ pour la valeur en FCFA, avec un bouton de suppression.

---

## 📊 3. CALCULS AUTOMATIQUES EN TEMPS RÉEL

### **CALCULATION 1 - CTD (Coûts Totaux Directs)**
```
CTD = Somme de TOUS les coûts de toutes les catégories
```
Affichage : Panneau sticky à droite, gris

---

### **CALCULATION 2 - PV (Revenu Total)**
```
PV = PP × N
```
Où :
- **PP** = Prix par participant (saisi manuellement)
- **N** = Nombre de participants

Affichage : Panneau sticky, bleu

---

### **CALCULATION 3 - MB (Marge Brute)**
```
MB = PV - CTD
```

Affichage : Vert si positif, rouge si négatif

---

### **CALCULATION 4 - CBD (Commission Business Developer)**
```
CBD = MB × TBD   (si MB > 0)
CBD = 0          (si MB ≤ 0)
```

Où :
- **TBD** = Taux de commission BD (0% à 5%, ajustable par slider)

⚠️ **Règle critique** : Aucune commission si marge brute négative ou nulle

Affichage : Orange

---

### **CALCULATION 5 - MT (Marge TYKA)**
```
MT = MB - CBD
```

Affichage : Vert foncé si positif, rouge si négatif

---

### **CALCULATION 6 - Statut de Rentabilité**

Assignation automatique :

| Condition | Statut | Badge |
|-----------|--------|-------|
| MB < 0 | 🔴 Perte | Rouge |
| MT ≤ 0 ou MT/PV < 10% | 🟠 Marge faible | Orange |
| MT > 0 et MT/PV ≥ 10% | 🟢 Rentable | Vert |

---

### **CALCULATION 7 - Prix d'Équilibre (Break-even)**
```
PP_min = CTD ÷ N
```

Affiche le **prix minimum par participant** pour éviter les pertes.

Affichage : Jaune, avec mention "Pour éviter les pertes"

---

## 🎨 Interface Utilisateur

### Layout Principal : Grid 3 colonnes (lg:grid-cols-3)

#### **Colonne Gauche (2/3) - Formulaire**
1. Informations Projet (Card)
2. Répartition des Coûts (5 Cards éditables)
3. Tarification (Card avec input PP)
4. Commission BD (Card avec slider 0-5%)

#### **Colonne Droite (1/3) - Panneau de Résumé STICKY**
1. **Coûts Totaux** (gris)
   - CTD
2. **Revenu Total** (bleu)
   - PV = PP × N
3. **Rentabilité** (vert/rouge)
   - MB (Marge Brute)
   - CBD (Commission BD)
   - MT (Marge TYKA)
   - Badge de statut
4. **Prix d'Équilibre** (jaune)
   - Break-even price
5. **Boutons d'action**
   - Soumettre (gradient bleu-violet)
   - Export PDF (outline)

---

## 📄 Export PDF

Le fichier texte téléchargé contient :

### 📋 Informations Projet
- Titre
- Type d'activité
- Modalité
- Date
- Localisation
- Nombre de participants
- Durée

### 💰 Détail des Coûts
- Section A : Coûts Pédagogiques (liste avec valeurs)
- Section B : Coûts Logistiques (liste avec valeurs)
- Section C : Restauration (liste avec valeurs)
- Section D : Communication (liste avec valeurs)
- Section E : Autres Coûts (liste avec valeurs)

### 📊 Calculs Automatiques
- CTD (Coûts Totaux Directs)
- PP (Prix par participant)
- PV (Revenu Total)
- MB (Marge Brute)
- Taux commission BD
- CBD (Commission BD)
- MT (Marge TYKA)
- Prix d'équilibre
- Statut de rentabilité

Date et heure de génération

---

## 🔄 Workflow de Soumission

1. **Remplir le formulaire**
   - Titre obligatoire
   - Nombre de participants > 0
   - Saisir les coûts
   - Définir le prix par participant

2. **Vérification en temps réel**
   - Tous les calculs s'actualisent automatiquement
   - Visualisation instantanée de la rentabilité

3. **Soumettre au Pool Management**
   - Validation des champs obligatoires
   - Sauvegarde dans `localStorage` sous `"tykaEstimations"`
   - Status : "pending" (en attente de validation)
   - Rechargement de la page pour afficher dans l'historique

4. **Export PDF** (optionnel)
   - Téléchargement d'un fichier texte formaté
   - Nom : `estimation_[titre]_[timestamp].txt`

---

## 📚 Historique des Estimations

Affiché sous l'outil, avec pour chaque estimation :

### Card d'historique affiche :
- **Header** : Titre + Badge statut (En attente / Approuvé / Rejeté)
- **Grille 4 colonnes** :
  - Modalité
  - Participants
  - Coûts totaux (CTD)
  - Prix / participant (PP)
- **Grille 4 colonnes (2e ligne)** :
  - Revenu total (PV)
  - Marge brute (MB)
  - Commission BD (CBD)
  - Marge TYKA (MT)
- **Footer** : Date/heure de soumission + Statut de rentabilité

**Design** : Gradient gris-bleu, hover effet, bordures colorées selon statut

---

## 🎯 Validation des Champs

### Règles obligatoires :
- ✅ Titre du projet doit être renseigné
- ✅ Nombre de participants doit être > 0

### Règles optionnelles mais recommandées :
- Prix par participant (PP)
- Au moins un coût saisi

### Messages d'erreur :
- "Veuillez entrer un titre de projet"
- "Le nombre de participants doit être supérieur à 0"

---

## 🎨 Design System

### Code couleur des calculs :
- **Gris** : Coûts totaux (CTD)
- **Bleu** : Revenu (PV), Prix par participant
- **Vert** : Marges positives (MB, MT)
- **Rouge** : Marges négatives, pertes
- **Orange** : Commissions (CBD)
- **Jaune** : Prix d'équilibre

### Bordures des Cards :
- `border-purple-200` : Pédagogique
- `border-blue-200` : Logistique
- `border-green-200` : Restauration
- `border-orange-200` : Communication
- `border-gray-200` : Autres

### Dégradés :
- Header : `from-blue-50 to-purple-50`
- Bouton principal : `from-blue-600 to-purple-600`
- Sections : `from-indigo-50 to-blue-50`

---

## 📱 Responsive Design

- **Mobile** : 1 colonne, panneau de résumé en dessous
- **Tablet** : 2 colonnes dans les grids
- **Desktop (lg)** : 3 colonnes, panneau sticky à droite

---

## 🔧 Intégration Technique

### Fichiers
- `/src/app/components/admin/CostEstimationTool.tsx` - Composant principal
- `/src/app/pages/admin/BusinessDevDashboard.tsx` - Page d'intégration avec historique

### État React
```typescript
interface ProjectInfo {
  title: string;
  activityType: string;
  modality: "online" | "physical" | "hybrid";
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
```

### LocalStorage
- **Clé** : `"tykaEstimations"`
- **Structure** :
```json
{
  "id": "est_1234567890",
  "project": { ... },
  "costs": { ... },
  "calculations": {
    "CTD": 500000,
    "pricePerParticipant": 50000,
    "PV": 750000,
    "MB": 250000,
    "bdCommissionRate": 2.5,
    "CBD": 6250,
    "MT": 243750,
    "breakEvenPrice": 33333,
    "profitabilityStatus": "🟢 Rentable"
  },
  "status": "pending",
  "submittedAt": "2026-04-04T...",
  "submittedBy": "email@example.com"
}
```

---

## 🔒 Règles Métier Critiques

### ⚠️ IMPORTANT - Conditions de calcul

1. **N doit être > 0**
   - Sinon, désactivation des calculs et du bouton Soumettre

2. **PP doit être ≥ 0**
   - Pas de prix négatif

3. **Commission BD = 0 si MB ≤ 0**
   - Règle absolue : pas de commission sur une perte

4. **Tous les coûts sont en FCFA**
   - Formatage avec séparateurs de milliers
   - Exemple : 150 000 FCFA

5. **Calculs read-only**
   - Aucune saisie manuelle autorisée pour :
     - CTD, PV, MB, CBD, MT
   - Seuls les coûts et PP sont éditables

---

## ✅ Cas d'Usage Exemples

### Exemple 1 : Formation Rentable

**Données saisies :**
- 20 participants
- CTD = 400 000 FCFA
- PP = 30 000 FCFA

**Résultats automatiques :**
- PV = 600 000 FCFA
- MB = 200 000 FCFA
- CBD (2.5%) = 5 000 FCFA
- MT = 195 000 FCFA
- Statut : 🟢 Rentable
- Break-even = 20 000 FCFA

---

### Exemple 2 : Projet Non Rentable

**Données saisies :**
- 10 participants
- CTD = 500 000 FCFA
- PP = 40 000 FCFA

**Résultats automatiques :**
- PV = 400 000 FCFA
- MB = -100 000 FCFA
- CBD = 0 FCFA (car MB < 0)
- MT = -100 000 FCFA
- Statut : 🔴 Perte
- Break-even = 50 000 FCFA
- ⚠️ Alerte : "Aucune commission : La marge brute est négative ou nulle."

---

## 🚀 Avantages de cette Approche

✅ **Transparence totale** : Toutes les formules sont visibles et explicites  
✅ **Temps réel** : Calculs instantanés à chaque modification  
✅ **Pas d'erreurs manuelles** : Calculs automatiques garantis  
✅ **Flexibilité** : Ajout/suppression de lignes de coûts dynamique  
✅ **Ergonomie** : Panneau de résumé sticky toujours visible  
✅ **Validation** : Règles métier appliquées automatiquement  
✅ **Export** : Document complet avec tous les détails  

---

## 📞 Support

Pour toute question ou suggestion d'amélioration, contactez l'équipe technique TYKA.

---

**Version** : 2.0 (Automatisée)  
**Date** : Avril 2026  
**Auteur** : Équipe TYKA
