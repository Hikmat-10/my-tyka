# Guide des Fonctionnalités Admin TYKA

## 📋 Vue d'ensemble

Ce document décrit toutes les fonctionnalités administratives implémentées dans la plateforme TYKA, incluant les 4 rôles distincts avec leurs permissions spécifiques.

---

## 🔐 Accès Administration

**URL sécurisée :** `/admin-tyka-secure`

L'espace admin est accessible uniquement via cette URL cachée avec authentification par email/mot de passe.

---

## 👥 Rôles et Permissions

### 1. 💼 BUSINESS DEVELOPER

**Responsabilités :** Estimation de coûts et analyse de demande

#### Fonctionnalités principales :

**📊 Tableau d'Estimation de Coûts (NON AUTOMATISÉ)**
- ✅ **Nouveau design** : Formulaire manuel sans calculs automatiques
- Champs disponibles :
  - Titre du projet / initiative
  - Modalité (En ligne / En salle / Hybride)
  - Nombre de participants
  - Coût salle
  - Coût formateur
  - Coût restauration
  - Coût logistique
  - **✅ Frais de communication** (NOUVEAU)
  - Frais divers
  - Commission TYKA (%)
  - Commission Business Developer (0 à 5%)
  - **Prix par participant** (saisie manuelle libre)

**Fonctionnement :**
- ❌ **Supprimé** : Barre de rentabilité automatique
- ❌ **Supprimé** : Calculs automatiques de résultat
- ✅ **Ajouté** : Saisie libre du prix par participant
- ✅ La commission TYKA est implicite (pas affichée comme calcul)
- ℹ️ Notice : "Mode manuel - Aucun calcul de rentabilité n'est effectué automatiquement"

**Actions disponibles :**
- 📤 **Soumettre au Pool Management** : Envoie l'estimation avec statut "En attente de validation"
- 💾 **Télécharger en PDF** : Export au format texte structuré contenant tous les détails

**Base de Données Membres :**
- Accès aux profils membres avec filtres (genre, éducation, localisation, préférence)
- Permet d'identifier la demande et construire des initiatives pertinentes

---

### 2. 🎓 LEARNING DEVELOPER

**Responsabilités :** Gestion des contenus SAVOIRS

#### Fonctionnalités principales :

**📹 Gestion des Vidéos**
- ✅ **Ajout simplifié** : Formulaire drag & drop
- Champs requis :
  - Titre *
  - Instructeur / Intervenant *
  - Durée *
  - URL vidéo / miniature (optionnel)
  - Type de contenu * (Formation, Masterclass, Expertise, Témoignage)
  - Catégorie * (Art, Science, Culture, Entrepreneuriat, Société, etc.)

**🔄 Synchronisation Automatique**
- ✅ Les vidéos ajoutées apparaissent **automatiquement** dans :
  - Espace SAVOIR
  - Section Explorer
- ✅ Bannière d'information : "Synchronisation automatique : Les vidéos ajoutées ici apparaissent immédiatement dans l'espace SAVOIRS"
- ✅ Toast de confirmation : "Vidéo ajoutée avec succès ! Elle apparaît maintenant dans SAVOIRS → Explorer"

**❌ Supprimé :**
- Bibliothèque média (sections supprimées)
- Zone d'upload générique

---

### 3. 🌍 ADMIN AMBASSADEUR

**Responsabilités :** Activation communautaire et gestion des contacts

#### Fonctionnalités principales :

**👥 Base de Données Membres (CONNECTÉE)**
- ✅ **Connexion directe** au système via `dataService.getAllMembers()`
- Affichage des profils complets :
  - Nom
  - Email (si profil public)
  - Pays
  - Activité
  - Centre d'intérêt
  - Niveau d'éducation
  - Visibilité (Public/Privé)

**🔍 Filtres Avancés :**
- Zone / Pays (dynamique selon les membres)
- Niveau d'éducation (Licence, Master, Doctorat, Autre)
- Visibilité du profil (Public, Privé, Tous)
- Recherche par nom

**📊 Statistiques :**
- Total Membres
- Contacts Publics (exportables)
- Ambassadeurs Actifs

**📤 Export de Contacts :**
- Génération CSV automatique
- Inclut : Nom, Email, Pays, Centre d'intérêt, Activité
- Nom de fichier : `tyka-contacts-YYYY-MM-DD.csv`
- Toast de confirmation avec nombre de contacts exportés

**👑 Ambassadeurs TYKA :**
- Liste des ambassadeurs actifs
- Membres touchés par zone

---

### 4. 🛡️ SUPER ADMIN

**Responsabilités :** Centre de pilotage et validation finale

#### Fonctionnalités principales :

**📊 Dashboard Analytique**
- Stats en temps réel :
  - Total Membres (depuis la base réelle)
  - Cohortes Actives
  - Taux d'Engagement
  - Revenus Totaux

**✅ Validation des Estimations**
- ✅ **Nouveau** : Section dédiée aux estimations soumises par les Business Developers
- Affichage complet :
  - Titre du projet
  - Soumis par (Business Developer)
  - Date de soumission
  - Modalité
  - Prix par participant
- Actions :
  - 👁️ **Voir** : Ouvre un modal avec tous les détails (coûts, commissions, prix)
  - ✅ **Valider** : Approuve l'estimation et envoie notification
  - ❌ **Rejeter** : Refuse l'estimation

**📋 Modal de Détails d'Estimation**
- Vue structurée avec :
  - Informations projet (titre, modalité, participants)
  - Détail des coûts ligne par ligne
  - Commissions (TYKA + BD)
  - Prix final par participant
- Actions : Annuler, Rejeter, Valider

**🔄 Validation des Initiatives**
- Liste des initiatives en attente
- Possibilité de valider ou rejeter

**📜 Journal d'Activité**
- Actions récentes de tous les administrateurs
- Traçabilité complète

**🎯 Gestion RBAC**
- Accès total à tous les comptes utilisateurs
- Tous les projets / initiatives
- Toutes les données membres
- Contrôle des rôles et permissions

---

## 🔄 Workflow de Validation (Nouveau)

### Processus d'Estimation de Coûts :

1. **Business Developer** :
   - Remplit le tableau d'estimation
   - Saisit manuellement le prix par participant
   - Clique sur "Soumettre au Pool Management"
   - Statut : "En attente de validation"

2. **Super Admin** :
   - Reçoit la notification (visuelle dans le dashboard)
   - Voit l'estimation dans la section "Estimations de Coûts en Attente"
   - Peut cliquer sur "Voir" pour ouvrir le modal détaillé
   - Décide : ✅ Valider ou ❌ Rejeter

3. **Si validé** :
   - Toast de confirmation : "Estimation validée ! Notification envoyée."
   - L'estimation disparaît de la liste des attentes
   - Statut changé en "approved" dans localStorage

4. **Si rejeté** :
   - Toast : "Estimation rejetée"
   - L'estimation disparaît de la liste
   - Statut changé en "rejected"

---

## 🎨 Design & UX

**Style global :**
- Moderne, épuré (inspiré de Notion / Stripe dashboard)
- Couleurs cohérentes avec l'identité TYKA
- Navigation fluide entre sections
- Icônes simples et expressives

**Responsive :**
- Toutes les interfaces s'adaptent au mobile
- Grilles flexibles (grid cols-1 md:cols-2 lg:cols-3)
- Modals avec scroll automatique sur mobile

**Interactions :**
- Hover states sur les cards
- Transitions douces
- Toast notifications (sonner)
- Badges de statut colorés
- Micro-animations sur les actions

---

## 💾 Persistance des Données

**LocalStorage utilisé pour :**
- `tykaVideos` : Vidéos ajoutées par Learning Developer
- `tykaMembers` : Base complète des membres inscrits
- `tykaInitiatives` : Initiatives proposées
- `tykaEstimations` : Estimations soumises par Business Developers
- `tykaAdminEmail` : Email de l'admin connecté

**DataService centralisé :**
- `/src/app/services/dataService.ts`
- Fonctions disponibles :
  - `getVideos()`, `addVideo()`, `deleteVideo()`, `updateVideo()`
  - `getInitiatives()`, `addInitiative()`, `updateInitiative()`
  - `getAllMembers()`
  - `subscribeToVideos()` : Écoute des changements en temps réel

---

## 🚀 Points Techniques

**Technologies :**
- React 18.3.1
- TypeScript
- React Router 7.13.0
- Tailwind CSS 4.1.12
- Radix UI components
- Motion (Framer Motion)
- Sonner (toasts)
- Lucide React (icons)

**Architecture :**
- `/src/app/pages/admin/` : Pages admin par rôle
- `/src/app/components/admin/` : Composants partagés
- `/src/app/services/` : Logique métier centralisée
- `/src/app/contexts/` : Contextes d'authentification

**Sécurité :**
- URL cachée `/admin-tyka-secure`
- Contexte d'authentification (`AdminAuthContext`)
- Vérification des rôles avant affichage
- Pas d'accès public aux routes admin

---

## 📝 Checklist de Conformité

✅ Business Developer :
- [x] Formulaire NON automatisé
- [x] Champ "Frais de communication" ajouté
- [x] Saisie manuelle du prix par participant
- [x] Suppression barre de rentabilité
- [x] Suppression calcul automatique de résultat
- [x] Bouton "Soumettre au Pool Management"
- [x] Export PDF fonctionnel

✅ Learning Developer :
- [x] Bibliothèque média supprimée
- [x] Zone d'upload supprimée
- [x] Upload simple de vidéos
- [x] Synchronisation automatique avec SAVOIRS

✅ Admin Ambassadeur :
- [x] Connexion base de données membres réelle
- [x] Filtres par zone/pays
- [x] Export CSV fonctionnel
- [x] Affichage profils complets

✅ Super Admin :
- [x] Dashboard avec stats réelles
- [x] Validation des estimations
- [x] Modal détaillé d'estimation
- [x] Validation/rejet des initiatives
- [x] Journal d'activité
- [x] Accès RBAC complet

---

## 🎯 Prochaines Étapes Possibles

**Améliorations futures (optionnelles) :**
- [ ] Export PDF professionnel pour les estimations (avec template)
- [ ] Notifications push/email lors de validations
- [ ] Dashboard analytics avancé (graphiques avec recharts)
- [ ] Gestion des rôles directement depuis l'interface Super Admin
- [ ] Historique complet des modifications (audit trail)
- [ ] API REST pour intégration backend
- [ ] Tests unitaires et E2E

---

**Date de création :** 3 avril 2026  
**Version :** 2.0.0  
**Plateforme :** TYKA - Territoires, Humanités, Organisations
