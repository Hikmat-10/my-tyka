# 🔄 Guide des Flux Utilisateurs Automatisés - TYKA

## 🎯 Vue d'ensemble

Ce document décrit les flux utilisateurs automatisés et l'interconnexion entre les différents espaces de la plateforme TYKA pour une expérience fluide et cohérente.

---

## ✅ 1. FLUX D'INSCRIPTION MEMBRE + VALIDATION

### Étape 1 : Inscription Utilisateur

**Action** : L'utilisateur clique sur "Rejoindre la communauté"

**Formulaire d'inscription** (RegisterModal) :
- Prénom*, Nom*, Email*, Mot de passe*
- Activité / Métier
- Pays*, Ville
- WhatsApp, Téléphone
- Bio / Présentation
- Photo de profil (optionnelle)
- Paramètres de confidentialité

### Étape 2 : Confirmation de Création

Après soumission réussie, une **popup de validation** s'affiche automatiquement :

```
┌─────────────────────────────────────┐
│   🎉 Bienvenue sur TYKA !          │
│                                     │
│ ✓ Votre compte a été créé avec    │
│   succès                            │
│                                     │
│ ⏳ En attente de validation        │
│                                     │
│ Votre compte est en cours de       │
│ validation par l'équipe TYKA.      │
│                                     │
│ 📧 Vous recevrez une notification  │
│ par email et WhatsApp dès que      │
│ votre compte sera validé.          │
│                                     │
│        [Compris !]                  │
└─────────────────────────────────────┘
```

### Étape 3 : Ajout Automatique dans la Base Admin

Le membre est automatiquement :
- ✅ Ajouté à `tykaMembers` avec `validationStatus: "pending_validation"`
- ✅ Ajouté à `tykaAmbassadors` avec statut "ambassadeur potentiel"
- ✅ `visibleInTrombinoscope: false` (pas visible publiquement)
- ✅ Code ambassadeur généré automatiquement (ex: `JOHA2456`)

**Structure des données** :
```typescript
{
  id: "member_1712345678901",
  email: "john@example.com",
  firstName: "John",
  lastName: "Hamelinck",
  validationStatus: "pending_validation", // ← Nouveau
  visibleInTrombinoscope: false,          // ← Nouveau
  ambassadorCode: "JOHA2456",
  joinedAt: "2026-04-06T10:30:00.000Z",
  // ... autres champs
}
```

### Étape 4 : Validation par l'Ambassadeur Admin

**Interface Ambassadeur** (à implémenter) :

📋 **Table des membres en attente**

| Avatar | Nom | Pays | Email | Activité | Date | Actions |
|--------|-----|------|-------|----------|------|---------|
| JH | John Hamelinck | France | john@... | Développeur | 06/04/26 | ✅ Valider   ❌ Rejeter |
| AM | Alice Martin | Sénégal | alice@... | Designer | 05/04/26 | ✅ Valider   ❌ Rejeter |

**Filtres** :
- Statut : Tous / En attente / Validés / Rejetés
- Pays : Tous / [Liste dynamique]
- Recherche par nom

**Actions possibles** :
1. **Valider** → `validationStatus: "active"`, `visibleInTrombinoscope: true`
2. **Rejeter** → `validationStatus: "rejected"`, `visibleInTrombinoscope: false`

### Étape 5 : Affichage Automatique dans le Trombinoscope

Après validation :
- ✅ Le membre apparaît automatiquement dans l'**Espace Communauté > Trombinoscope**
- ✅ Fiche complète visible : nom, photo, bio, activité, pays, compétences
- ✅ Informations de contact selon paramètres de confidentialité

**Condition** : `validationStatus === "active"` ET `visibleInTrombinoscope === true`

---

## 🔗 2. FLUX CONNEXION + REJOINDRE UNE COHORTE

### Parcours Utilisateur Optimisé

#### Scénario A : Utilisateur NON connecté

```
┌────────────────────────────────────┐
│   Page Cohorte                     │
│                                    │
│   Formation React Avancé           │
│   Prix: 50 000 FCFA               │
│   15 places restantes              │
│                                    │
│   [Rejoindre la cohorte] ← CLIC   │
└────────────────────────────────────┘
             ↓
┌────────────────────────────────────┐
│   Modal d'Authentification         │
│                                    │
│   Pour rejoindre cette formation:  │
│                                    │
│   • Se connecter                   │
│   • Créer un compte                │
│                                    │
│   [Se connecter]  [S'inscrire]    │
└────────────────────────────────────┘
             ↓
   Connexion réussie
             ↓
┌────────────────────────────────────┐
│   Retour automatique vers          │
│   la cohorte sélectionnée          │
└────────────────────────────────────┘
             ↓
┌────────────────────────────────────┐
│   Formulaire d'Inscription         │
│                                    │
│   Nom: [Auto-rempli]              │
│   WhatsApp: [À saisir]            │
│                                    │
│   Message: Vous serez contacté    │
│   pour finaliser votre inscription │
│                                    │
│   [Confirmer mon inscription]      │
└────────────────────────────────────┘
             ↓
   ✅ Inscription enregistrée
```

#### Scénario B : Utilisateur CONNECTÉ

```
┌────────────────────────────────────┐
│   [Rejoindre la cohorte] ← CLIC   │
└────────────────────────────────────┘
             ↓
┌────────────────────────────────────┐
│   Formulaire Simplifié             │
│                                    │
│   Nom: John Hamelinck             │
│   WhatsApp: [+33 6...]            │
│                                    │
│   [Confirmer]                      │
└────────────────────────────────────┘
```

### Implémentation Technique

**CohortAuthModal** (existant) :
- Vérifie si l'utilisateur est connecté
- Si NON → Affiche options de connexion/inscription
- Si OUI → Affiche formulaire simplifié
- **Gère la redirection automatique** vers la cohorte après connexion

**Stockage du contexte** :
```typescript
// Avant redirection vers login
sessionStorage.setItem('returnToCohort', cohortId);

// Après connexion réussie
const returnTo = sessionStorage.getItem('returnToCohort');
if (returnTo) {
  navigate(`/co-creer?cohort=${returnTo}`);
  sessionStorage.removeItem('returnToCohort');
}
```

---

## 🎥 3. LEARNING DEVELOPER → ESPACE SAVOIRS

### Publication Automatique des Vidéos

#### Interface Learning Developer

**Formulaire d'ajout de vidéo** :
```
┌──────────────────────────────────────┐
│  Ajouter une Nouvelle Vidéo          │
├──────────────────────────────────────┤
│  Titre*: [_____________________]     │
│  Description: [________________]      │
│  URL YouTube*: [________________]     │
│  Catégorie*: [▼ Entrepreneuriat]     │
│  Type*: [▼ Formation]                 │
│  Durée: [_______]                     │
│  Instructeur*: [________________]     │
│                                       │
│  [Annuler]    [Publier la vidéo]     │
└──────────────────────────────────────┘
```

#### Automatisation

Dès validation du formulaire :

1. **Stockage dans `tykaVideos`** (localStorage)
```typescript
{
  id: "video_1712345678901_abc",
  title: "Introduction à React",
  instructor: "Sophie Laurent",
  duration: "42 min",
  thumbnail: "auto-generated from YouTube",
  type: "formation",
  category: "science",
  url: "https://youtube.com/watch?v=...",
  createdAt: "2026-04-06T10:30:00.000Z"
}
```

2. **Publication immédiate dans l'Espace SAVOIRS**
   - Aucune validation manuelle requise
   - Affichage automatique dans la grille de vidéos
   - Filtrable par catégorie

3. **Synchronisation en temps réel**
   - Utilise `subscribeToVideos()` pour écouter les changements
   - Mise à jour automatique de l'interface

#### Lecture Immersive

**Au clic sur une vidéo dans SAVOIRS** :

```
┌─────────────────────────────────────────────┐
│  ✕                                          │
│                                             │
│  ┌─────────────────────────────────┐       │
│  │                                 │       │
│  │      LECTEUR VIDÉO YOUTUBE      │       │
│  │          (16:9 ratio)           │       │
│  │                                 │       │
│  └─────────────────────────────────┘       │
│                                             │
│  Introduction à React                       │
│  Par Sophie Laurent • 42 min               │
│                                             │
│  Description de la vidéo...                 │
│                                             │
│  🔗 Partager  📋 Copier le lien            │
└─────────────────────────────────────────────┘
```

**Composant VideoModal** :
- Modal plein écran (ou large)
- Player YouTube intégré
- Informations complètes
- Boutons de partage social
- Fermeture avec ESC ou ✕

---

## 📊 4. STATUTS DYNAMIQUES & WORKFLOW

### Statuts des Membres

| Statut | Valeur | Description | Visible Trombinoscope |
|--------|--------|-------------|----------------------|
| 🟡 En attente | `pending_validation` | Nouveau compte créé | ❌ Non |
| 🟢 Actif | `active` | Compte validé par admin | ✅ Oui |
| 🔴 Rejeté | `rejected` | Compte refusé | ❌ Non |

### Statuts des Cohortes

| Statut | Valeur | Description | Actions |
|--------|--------|-------------|---------|
| 🟢 Ouvert | `open` | Inscriptions ouvertes | Rejoindre |
| 🟡 En cours | `in_progress` | Formation commencée | Voir détails |
| 🔴 Clôturé | `closed` | Inscriptions fermées | Liste d'attente |

### Statuts des Initiatives

| Statut | Valeur | Description | Workflow |
|--------|--------|-------------|----------|
| 📝 Brouillon | `draft` | En cours de création | Édition |
| ⏳ En attente | `pending` | Soumis, en révision | Validation Admin |
| ✅ Approuvé | `approved` | Validé et visible | Publié |
| ❌ Rejeté | `rejected` | Refusé | Feedback |

### Workflow de Validation (Membres)

```
     Inscription
         ↓
   pending_validation ←─┐
         ↓               │
   Ambassadeur Admin    │
         ↓               │
      Décision          │
      /     \           │
Valider   Rejeter      │
   ↓         ↓          │
active   rejected      │
   ↓                    │
Visible dans          │
Trombinoscope         │
                       │
(Peut être réévalué)──┘
```

---

## 🎨 5. DESIGN & UX/UI

### Principes de Design

✅ **Simplicité** : Interfaces épurées, actions claires  
✅ **Cohérence** : Même palette de couleurs, mêmes patterns  
✅ **Fluidité** : Transitions animées, pas de blocages  
✅ **Feedback** : Toast notifications, confirmations visuelles  
✅ **Ergonomie** : Boutons visibles, labels explicites  

### Palette de Couleurs TYKA

- **Primary** : Gradient orange-ambre `from-amber-500 to-orange-500`
- **Success** : Vert `text-green-600`, `bg-green-50`
- **Warning** : Jaune-ambre `text-amber-600`, `bg-amber-50`
- **Error** : Rouge `text-red-600`, `bg-red-50`
- **Info** : Bleu `text-blue-600`, `bg-blue-50`
- **Neutral** : Gris `text-gray-600`, `bg-gray-50`

### Composants Réutilisables

1. **Badges de Statut**
```tsx
<Badge variant="success">✅ Validé</Badge>
<Badge variant="warning">⏳ En attente</Badge>
<Badge variant="destructive">❌ Rejeté</Badge>
```

2. **Cards Informationnelles**
```tsx
<Card className="border-l-4 border-l-blue-500">
  <CardContent>
    <!-- Contenu -->
  </CardContent>
</Card>
```

3. **Modals de Confirmation**
```tsx
<Dialog>
  <DialogContent>
    <CheckCircle className="animate-pulse" />
    <DialogTitle>Action confirmée</DialogTitle>
    <DialogDescription>...</DialogDescription>
  </DialogContent>
</Dialog>
```

### Micro-animations

- **Hover** : `scale-105` sur les cartes
- **Active** : `scale-95` sur les boutons
- **Loading** : `animate-pulse` sur les icônes
- **Success** : `animate-bounce` ou confettis
- **Transitions** : `transition-all duration-300`

---

## 🔧 6. INTÉGRATION TECHNIQUE

### Architecture des Données

```
localStorage
├── tykaMembers (tableau)
│   ├── id, email, firstName, lastName
│   ├── validationStatus: "pending_validation" | "active" | "rejected"
│   ├── visibleInTrombinoscope: boolean
│   └── ambassadorCode, joinedAt, ...
│
├── tykaAmbassadors (tableau)
│   └── (synchronisé avec tykaMembers)
│
├── tykaVideos (tableau)
│   ├── id, title, instructor, duration
│   ├── type, category, thumbnail
│   └── url, createdAt
│
├── tykaCohorts (tableau)
│   └── status: "open" | "in_progress" | "closed"
│
└── tykaInitiatives (tableau)
    └── status: "draft" | "pending" | "approved" | "rejected"
```

### Événements Personnalisés

```typescript
// Déclenché après validation d'un membre
window.dispatchEvent(new Event('tykaMemberValidated'));

// Déclenché après ajout d'une vidéo
window.dispatchEvent(new Event('tykaVideoAdded'));

// Déclenché après partage social
window.dispatchEvent(new Event('tykaShareAdded'));

// Écoute
window.addEventListener('tykaMemberValidated', () => {
  // Recharger la liste des membres
});
```

### Fonctions utilitaires (dataService.ts)

```typescript
// Membres
getAllMembers(): Member[]
getMembersByStatus(status): Member[]
validateMember(memberId, status): boolean

// Vidéos
getVideos(): Video[]
addVideo(video): Video
subscribeToVideos(callback): () => void

// Initiatives
getInitiatives(): Initiative[]
updateInitiative(id, updates): boolean
```

---

## ✅ 7. CHECKLIST D'IMPLÉMENTATION

### Phase 1 : Validation des Membres ✅

- [x] Ajout champs `validationStatus` et `visibleInTrombinoscope`
- [x] Popup de confirmation après inscription
- [x] Statut initial : `pending_validation`
- [ ] Interface de validation dans AmbassadorDashboard
- [ ] Boutons Valider / Rejeter
- [ ] Mise à jour automatique du Trombinoscope

### Phase 2 : Flux Cohorte ⏳

- [x] CohortAuthModal existant
- [ ] Stockage du contexte de navigation
- [ ] Redirection automatique après login
- [ ] Formulaire simplifié si connecté
- [ ] Message de confirmation d'inscription

### Phase 3 : Publication Vidéos ⏳

- [x] Formulaire Learning Developer
- [x] Stockage dans tykaVideos
- [x] Affichage automatique dans SAVOIRS
- [ ] VideoModal lecture immersive
- [ ] Intégration YouTube player

### Phase 4 : UX Polish ⏳

- [ ] Animations et transitions
- [ ] Toast notifications cohérentes
- [ ] Messages d'erreur explicites
- [ ] États de chargement
- [ ] Responsive mobile optimisé

---

## 📞 Support & Évolutions

### Prochaines Étapes

1. **Notifications Email/WhatsApp**
   - Envoyer notification après validation
   - Templates de messages personnalisés

2. **Dashboard Ambassadeur Complet**
   - Statistiques de validation
   - Historique des actions
   - Filtres avancés

3. **Gestion des Rôles**
   - Permissions granulaires
   - Workflow d'approbation multi-niveaux

4. **Analytics**
   - Temps moyen de validation
   - Taux d'acceptation
   - Origine des inscriptions

---

**Version** : 1.0  
**Date** : Avril 2026  
**Auteur** : Équipe TYKA  
**Statut** : 🚧 En cours d'implémentation
