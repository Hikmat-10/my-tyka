# 🚀 Guide des Fonctionnalités de Partage Social - TYKA

## 🎯 Vue d'ensemble

Le système de partage social permet aux utilisateurs de TYKA de partager facilement les vidéos de l'espace SAVOIRS et les cohortes de formation sur WhatsApp et Facebook, ou de copier le lien pour un partage personnalisé.

**Objectif** : Transformer chaque utilisateur en ambassadeur de la plateforme pour augmenter la visibilité et faciliter le recrutement.

---

## ✨ Fonctionnalités Principales

### 📚 1. PARTAGE DES VIDÉOS (Espace SAVOIRS)

#### Position du bouton
- **Sur chaque vidéo** : Coin supérieur droit (overlay)
- **Icône** : Share2 (lucide-react)
- **Visibilité** : Apparaît au survol (hover) sur desktop, toujours visible sur mobile
- **Design** : Bouton rond blanc avec backdrop blur et ombre légère

#### Fonctionnalités
Au clic sur le bouton de partage :

1. **Modal de partage s'ouvre** avec :
   - Aperçu de la vidéo (thumbnail, titre, description)
   - Message pré-rempli personnalisable
   - 3 options de partage

2. **Options de partage disponibles** :
   - 🟢 **WhatsApp** (couleur officielle #25D366)
   - 🔵 **Facebook** (couleur officielle #1877F2)
   - 📋 **Copier le lien**

#### Message automatique pour vidéos
```
🎬 Découvre cette formation sur TYKA : [Titre de la vidéo]

[Description de la vidéo]

👉 Regarde maintenant : [URL]
```

#### Liens générés
- **WhatsApp** : `https://wa.me/?text={message_encodé}`
- **Facebook** : `https://www.facebook.com/sharer/sharer.php?u={URL}&quote={message}`
- **URL vidéo** : `{origin}/savoirs?video={videoId}`

---

### 🎓 2. PARTAGE DES COHORTES (Formations)

#### Position des boutons
1. **Coin supérieur droit** de la card (sur le header gradient)
2. **Bouton secondaire** à côté du bouton "Rejoindre la cohorte"

#### Fonctionnalités
Au clic sur le bouton de partage :

1. **Modal de partage s'ouvre** avec :
   - Aperçu de la cohorte :
     - Titre
     - Description
     - Prix (badge vert)
     - Places restantes (badge bleu)
     - Modalité (En ligne / En salle / Hybride)
     - Date limite
   - Message pré-rempli personnalisable
   - 3 options de partage

#### Message automatique pour cohortes
```
🚀 Nouvelle formation disponible sur TYKA

📌 [Titre de la cohorte]
💰 [Prix] FCFA
📍 [Modalité]
📅 Date limite : [Deadline]
🎯 [X] places restantes

👉 Inscris-toi ici : [URL]
```

#### Liens générés
- **WhatsApp** : `https://wa.me/?text={message_encodé}`
- **Facebook** : `https://www.facebook.com/sharer/sharer.php?u={URL}&quote={message}`
- **URL cohorte** : `{origin}/co-creer?cohort={cohortId}`

---

## 🎨 Design UI/UX

### Boutons de partage sur les cards

#### VideoCard (SAVOIRS)
```tsx
// Coin supérieur droit, overlay sur la vidéo
<motion.button
  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm"
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.9 }}
>
  <Share2 className="w-4 h-4 text-gray-700" />
</motion.button>
```

#### CohorteCard (CO-CRÉER)
```tsx
// 1. Sur le header (coin supérieur droit)
<motion.button
  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20"
>
  <Share2 className="w-4 h-4 text-white" />
</motion.button>

// 2. Bouton secondaire (bas de la card)
<motion.button
  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
>
  <Share2 className="w-5 h-5" />
</motion.button>
```

### Modal de partage

#### Structure
1. **Header** :
   - Icône Share2 (orange)
   - Titre : "Partager cette vidéo" / "Partager cette formation"
   - Description : "Invite ta communauté à découvrir ce contenu TYKA"

2. **Aperçu du contenu** :
   - Card avec gradient orange-purple
   - Thumbnail (si disponible)
   - Titre
   - Description
   - Badges (prix, places) pour les cohortes

3. **Message personnalisable** :
   - Label : "💬 Personnalise ton message (optionnel)"
   - Textarea avec message pré-rempli
   - 6 lignes de hauteur
   - Info : "Ce message sera partagé avec le lien"

4. **Boutons de partage** :
   - **WhatsApp** : Vert #25D366, icône officielle SVG
   - **Facebook** : Bleu #1877F2, icône officielle SVG
   - **Copier le lien** : Outline, avec feedback "Lien copié ✓"

5. **Affichage du lien** :
   - Fond gris clair
   - Police monospace
   - Texte en petit
   - Break-all pour éviter le débordement

#### Animations
- Hover sur boutons : `scale-[1.02]`
- Active (clic) : `scale-95`
- Transition fluide

#### Mobile-friendly
- Max-width : 500px
- Max-height : 90vh
- Scroll vertical si nécessaire
- Boutons larges (h-12) pour faciliter le tap

---

## 📊 Tracking & Analytics

### Système de tracking automatique

Chaque partage est enregistré dans `localStorage` sous la clé `"tykaShares"` avec :

```typescript
{
  id: "share_1234567890",
  type: "video" | "cohort",
  contentId: "abc123",
  contentTitle: "Titre du contenu",
  platform: "WhatsApp" | "Facebook" | "Copier le lien",
  timestamp: "2026-04-04T12:34:56.789Z"
}
```

### Composant ShareAnalytics

Affiche les statistiques de partage :

1. **Total des partages** (grand chiffre bleu)
2. **Par plateforme** :
   - WhatsApp (vert)
   - Facebook (bleu)
   - Lien copié (gris)
3. **Par type de contenu** :
   - Vidéos (orange)
   - Cohortes (violet)
4. **Partages récents** (liste des 10 derniers)

#### Mise à jour en temps réel
- Écoute l'événement personnalisé `'tykaShareAdded'`
- Écoute les changements du localStorage
- Auto-refresh des statistiques

#### Intégration
Le composant `ShareAnalytics` peut être ajouté :
- Dans le Dashboard membre
- Dans l'espace Admin (Super Admin)
- Sur une page dédiée "Impact"

---

## 🔗 Gestion des URLs

### Format des URLs de partage

#### Vidéos
```
https://tyka.com/savoirs?video=video123
```

#### Cohortes
```
https://tyka.com/co-creer?cohort=cohort456
```

### Deep linking mobile

#### WhatsApp
- Desktop : Ouvre WhatsApp Web
- Mobile : Ouvre l'app WhatsApp directement
- Format : `https://wa.me/?text={message}`

#### Facebook
- Ouvre dans un nouvel onglet (600x400)
- Mobile : Ouvre l'app Facebook si installée
- Format : `https://www.facebook.com/sharer/sharer.php?u={url}`

---

## ✅ UX & Feedback Utilisateur

### Notifications Toast (Sonner)

#### Succès - Partage
```typescript
toast.success("Partagé sur WhatsApp !", {
  description: "Merci de faire rayonner TYKA 🌟"
});
```

#### Succès - Copie de lien
```typescript
toast.success("Lien copié !", {
  description: "Le lien a été copié dans le presse-papier"
});
```

#### Erreur
```typescript
toast.error("Erreur lors de la copie du lien");
```

### Feedback visuel

1. **Bouton "Copier le lien"** :
   - État normal : Icône Copy
   - État copié : Icône Check (vert) + texte "Lien copié !"
   - Reset après 3 secondes

2. **Bouton de partage sur card** :
   - Hover : Scale 1.1
   - Active : Scale 0.9
   - Transition spring fluide

---

## 🛠️ Intégration Technique

### Fichiers créés

1. **`/src/app/components/ShareModal.tsx`**
   - Modal réutilisable pour vidéos et cohortes
   - Gestion des partages et du tracking
   - Messages personnalisables

2. **`/src/app/components/ShareAnalytics.tsx`**
   - Composant d'analytics
   - Statistiques en temps réel
   - Visualisation des données

3. **Modifications dans `VideoCard.tsx`**
   - Ajout du bouton de partage (coin supérieur droit)
   - Import et intégration du ShareModal

4. **Modifications dans `CohorteCard.tsx`**
   - Ajout de 2 boutons de partage
   - Import et intégration du ShareModal

### Props du ShareModal

```typescript
interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "video" | "cohort";
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
```

### Événements personnalisés

```typescript
// Déclenché après chaque partage
window.dispatchEvent(new Event('tykaShareAdded'));

// Écoute dans ShareAnalytics
window.addEventListener('tykaShareAdded', handleShareEvent);
```

---

## 📱 Responsive Design

### Mobile (< 640px)
- Modal pleine largeur (max-w-[95vw])
- Boutons larges (h-12) pour faciliter le tap
- Textarea réduit à 5 lignes
- Bouton de partage toujours visible sur les cards

### Tablet (640px - 1024px)
- Modal 500px de largeur
- Grid adaptatif pour les stats
- Boutons de taille standard

### Desktop (> 1024px)
- Modal 500px centrée
- Bouton de partage visible au hover uniquement (vidéos)
- Animations fluides

---

## 🔥 Bonnes Pratiques d'Utilisation

### Pour les utilisateurs

1. **Personnaliser le message** :
   - Ajouter un contexte personnel
   - Expliquer pourquoi le contenu est intéressant
   - Mentionner des amis spécifiques

2. **Choisir la bonne plateforme** :
   - WhatsApp : Partage direct avec contacts proches
   - Facebook : Diffusion large sur le réseau
   - Copier le lien : Partage sur d'autres plateformes (LinkedIn, Twitter, email)

3. **Timing optimal** :
   - Partager immédiatement après avoir apprécié un contenu
   - Partager avant la date limite pour les cohortes
   - Relancer quand il reste peu de places

### Pour l'équipe TYKA

1. **Surveiller les analytics** :
   - Identifier les contenus les plus partagés
   - Comprendre quelles plateformes sont préférées
   - Ajuster la stratégie de contenu

2. **Encourager le partage** :
   - Gamification (badges, points)
   - Récompenses pour les super-partageurs
   - Mettre en avant les ambassadeurs actifs

3. **Optimiser les messages** :
   - Tester différentes formulations
   - Utiliser des emojis pertinents
   - Inclure des calls-to-action clairs

---

## 🎯 Impact Attendu

### Métriques de succès

1. **Visibilité** :
   - Augmentation du trafic organique
   - Nouveaux utilisateurs via les partages
   - Portée virale sur les réseaux sociaux

2. **Engagement** :
   - Nombre de partages par utilisateur
   - Taux de conversion (partages → inscriptions)
   - Fidélisation des ambassadeurs

3. **Recrutement** :
   - Remplissage plus rapide des cohortes
   - Réduction du coût d'acquisition
   - Effet réseau amplifié

---

## 🚀 Évolutions Futures

### Phase 2 (À implémenter)

1. **Nouvelles plateformes** :
   - [ ] LinkedIn (pour contenu professionnel)
   - [ ] Twitter/X (pour threads)
   - [ ] Telegram (pour groupes)
   - [ ] Email (via mailto:)

2. **Gamification** :
   - [ ] Badge "Super Partageur" (10+ partages)
   - [ ] Badge "Ambassadeur Viral" (50+ partages)
   - [ ] Leaderboard des top partageurs
   - [ ] Récompenses (accès premium, réductions)

3. **Analytics avancées** :
   - [ ] Graphiques d'évolution temporelle
   - [ ] Heatmap des partages par heure/jour
   - [ ] Analyse de l'impact (clics, inscriptions)
   - [ ] Export des données en CSV

4. **Personnalisation** :
   - [ ] Templates de messages prédéfinis
   - [ ] Générateur de visuels pour réseaux sociaux
   - [ ] QR codes pour partage en présentiel
   - [ ] Stories Instagram/Facebook

5. **Social proof** :
   - [ ] "X personnes ont partagé ce contenu"
   - [ ] Affichage des partages récents en temps réel
   - [ ] Témoignages de partageurs actifs

---

## 📞 Support & Feedback

### Bugs ou suggestions ?

Contactez l'équipe technique TYKA pour :
- Signaler un problème
- Proposer une amélioration
- Demander une nouvelle fonctionnalité
- Partager des retours utilisateurs

---

**Version** : 1.0  
**Date** : Avril 2026  
**Auteur** : Équipe TYKA  
**Statut** : ✅ Production Ready
