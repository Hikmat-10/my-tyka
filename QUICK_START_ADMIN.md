# 🚀 Guide de Démarrage Rapide - Admin TYKA

## 🔐 Accès Administration

**URL** : `https://votresite.com/admin-tyka-secure`

**Identifiants de test** :
- Business Developer : `business@tyka.com`
- Learning Developer : `learning@tyka.com`
- Ambassador Admin : `ambassador@tyka.com`
- Super Admin : `super@tyka.com`

---

## 💼 Business Developer - En 3 étapes

### 1️⃣ **Créer une Estimation**

```
📊 Tableau d'Estimation de Coûts
↓
Remplir les champs :
  - Titre du projet
  - Modalité (En ligne/Salle/Hybride)
  - Nombre de participants
  - Tous les coûts
  - Prix par participant (MANUEL)
↓
Bouton "Soumettre au Pool Management"
```

### 2️⃣ **Exporter en PDF**

```
Cliquer sur "Télécharger en PDF"
↓
Un fichier .txt structuré se télécharge
↓
Contient tous les détails de l'estimation
```

### 3️⃣ **Voir l'Historique**

```
Section "Historique des Estimations"
↓
Badges de statut :
  ✅ Approuvé
  ⏳ En attente
  ❌ Rejeté
```

**💡 Astuce** : La commission TYKA est implicite, vous n'avez pas besoin de calculer la rentabilité !

---

## 🎓 Learning Developer - En 2 étapes

### 1️⃣ **Ajouter une Vidéo**

```
Bouton "Ajouter une Vidéo"
↓
Remplir le formulaire :
  - Titre *
  - Instructeur *
  - Durée *
  - URL vidéo (optionnel)
  - Type de contenu *
  - Catégorie *
↓
Bouton "Ajouter"
↓
✅ Toast : "Vidéo ajoutée ! Elle apparaît dans SAVOIRS → Explorer"
```

### 2️⃣ **Vérifier la Synchronisation**

```
Aller sur l'espace membre → SAVOIRS → Explorer
↓
Votre vidéo apparaît automatiquement !
```

**💡 Astuce** : La bibliothèque média a été supprimée pour simplifier le workflow !

---

## 🌍 Admin Ambassadeur - En 3 étapes

### 1️⃣ **Filtrer les Membres**

```
Section "Base de Données Membres"
↓
Filtres disponibles :
  - Zone / Pays
  - Niveau d'éducation
  - Visibilité du profil
  - Recherche par nom
```

### 2️⃣ **Exporter les Contacts**

```
Bouton "Exporter Contacts (X)"
↓
Fichier CSV téléchargé :
  tyka-contacts-2026-04-03.csv
↓
Colonnes : Nom, Email, Pays, Intérêts, Activité
```

### 3️⃣ **Animer la Communauté**

```
Identifier les membres actifs
↓
Contacter via WhatsApp / Email
↓
Organiser des événements par zone
```

**💡 Astuce** : Seuls les profils publics sont exportables (respect de la vie privée) !

---

## 🛡️ Super Admin - En 3 étapes

### 1️⃣ **Valider une Estimation**

```
Section "Estimations de Coûts en Attente"
↓
Cliquer "Voir" pour ouvrir le détail
↓
Modal s'ouvre avec :
  - Projet complet
  - Tous les coûts ligne par ligne
  - Commissions
  - Prix final
↓
Cliquer "Valider" ou "Rejeter"
```

### 2️⃣ **Valider une Initiative**

```
Section "Initiatives en Attente de Validation"
↓
Voir le titre, organisateur, date, catégorie
↓
Cliquer "Valider" ou "Rejeter"
```

### 3️⃣ **Monitorer la Plateforme**

```
Dashboard avec 4 stats clés :
  - Total Membres (réel)
  - Cohortes Actives
  - Taux d'Engagement
  - Revenus Totaux
↓
Journal d'Activité :
  - Actions de tous les admins
  - Traçabilité complète
```

**💡 Astuce** : Le modal de détail d'estimation est scrollable sur mobile !

---

## 🔄 Workflow Complet - Exemple

### Scénario : Formation "Design Thinking"

```
JOUR 1 - Business Developer
  ├─ Crée estimation
  ├─ Titre : "Formation Design Thinking"
  ├─ 15 participants
  ├─ Prix/participant : 25 000 FCFA
  ├─ Soumet au Pool Management
  └─ Statut : ⏳ En attente

JOUR 2 - Super Admin
  ├─ Reçoit notification visuelle
  ├─ Ouvre le modal de détail
  ├─ Vérifie tous les coûts
  ├─ Valide l'estimation
  └─ ✅ Notification envoyée

JOUR 3 - Business Developer
  ├─ Voit dans l'historique
  └─ Badge : ✅ Approuvé
```

---

## 📋 Checklist de Vérification

### Business Developer
- [ ] Je peux créer une estimation
- [ ] Je peux saisir librement le prix par participant
- [ ] Je peux exporter en PDF
- [ ] Je vois l'historique avec les statuts

### Learning Developer
- [ ] Je peux ajouter une vidéo
- [ ] La vidéo apparaît dans Explorer
- [ ] Je peux supprimer une vidéo
- [ ] Plus de bibliothèque média (simplifié)

### Ambassadeur
- [ ] Je vois les vrais membres (pas mock data)
- [ ] Je peux filtrer par pays
- [ ] Je peux exporter en CSV
- [ ] Seuls les profils publics sont exportables

### Super Admin
- [ ] Je vois les estimations en attente
- [ ] Je peux ouvrir le modal détaillé
- [ ] Je peux valider/rejeter
- [ ] Les stats affichent les vraies données

---

## 🆘 Résolution de Problèmes

### ❌ **Problème** : L'historique des estimations est vide

**Solution** :
1. Créer une nouvelle estimation
2. Cliquer sur "Soumettre au Pool Management"
3. Vérifier que localStorage contient `tykaEstimations`

---

### ❌ **Problème** : Les vidéos n'apparaissent pas dans Explorer

**Solution** :
1. Vérifier que la vidéo a bien été ajoutée (toast de confirmation)
2. Rafraîchir la page Explorer
3. Vérifier localStorage `tykaVideos`

---

### ❌ **Problème** : Aucun membre dans la base Ambassadeur

**Solution** :
1. Au moins un membre doit être inscrit sur la plateforme
2. Aller sur la page d'inscription membre
3. S'inscrire avec un profil public
4. Retourner sur l'Admin Ambassadeur

---

### ❌ **Problème** : Le Super Admin ne voit aucune estimation

**Solution** :
1. Se connecter en tant que Business Developer
2. Créer et soumettre une estimation
3. Se reconnecter en Super Admin
4. La section "Estimations en Attente" doit apparaître

---

## 🎯 Bonnes Pratiques

### **Business Developer**
✅ Vérifier tous les coûts avant soumission  
✅ Saisir un prix réaliste et compétitif  
✅ Exporter en PDF pour archivage  
✅ Consulter la base membres avant de créer une initiative  

### **Learning Developer**
✅ Remplir tous les champs obligatoires  
✅ Utiliser des URLs YouTube valides  
✅ Choisir la catégorie appropriée  
✅ Tester l'affichage dans Explorer après ajout  

### **Ambassadeur**
✅ Respecter la vie privée (seuls profils publics exportables)  
✅ Filtrer par zone avant export  
✅ Mettre à jour régulièrement les contacts  
✅ Animer les membres de manière ciblée  

### **Super Admin**
✅ Lire tous les détails avant validation  
✅ Valider/rejeter rapidement (48h max)  
✅ Monitorer les statistiques régulièrement  
✅ Consulter le journal d'activité  

---

## 📞 Support

**Questions ?** Contactez l'équipe technique :
- Email : tech@tyka.com
- Documentation : `/ADMIN_FEATURES_GUIDE.md`
- Changelog : `/CHANGELOG_ADMIN_2.0.md`

---

## 🎉 Félicitations !

Vous êtes maintenant prêt à utiliser le système administratif TYKA v2.0 !

**Rappel** : Toutes les données sont stockées en localStorage pour cette version. Une intégration backend permettra une persistance permanente dans les prochaines versions.

---

_Guide créé le 3 avril 2026 - TYKA Platform_
