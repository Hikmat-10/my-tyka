# Évolutions prioritaires de la plateforme TYKA – Version de stabilisation et amélioration UX

## 1. Synchronisation automatique entre validation des membres et espace Communauté

### Fonctionnement attendu

Lorsqu'un administrateur Ambassadeur valide l'inscription d'un membre :

* le membre est automatiquement ajouté à l'espace **Communauté** ;
* son profil devient visible dans le trombinoscope ;
* aucune intervention supplémentaire du Super Admin n'est requise.

### Paramètre de confidentialité utilisateur

Ajouter dans l'espace personnel du membre une option :

**Visibilité dans la communauté**

☐ Afficher mon profil dans la communauté TYKA

☐ Masquer mon profil dans la communauté TYKA

Par défaut :

* profil visible après validation de l'inscription ;
* le membre peut modifier ce choix à tout moment.

Si l'option est désactivée :

* le profil disparaît automatiquement du trombinoscope ;
* les informations restent conservées dans la base de données.

---

## 2. Simplification des profils dans l'espace Communauté

Supprimer l'affichage des statuts :

* Apprenant
* Contributeur
* Ambassadeur

Dans les cartes profils, afficher uniquement :

* Photo
* Nom et prénom
* Fonction ou métier
* Organisation
* Ville/Pays
* Biographie courte
* Domaines d'expertise
* Réseaux sociaux
* Bouton Contacter

Objectif :

Créer une communauté plus inclusive et éviter la hiérarchisation visuelle des membres.

---

## 3. Refonte du rapport TYKA Compass

### Amélioration graphique

Créer un rapport professionnel au format PDF et écran.

Le rapport doit intégrer :

* Logo TYKA en couverture
* Couleurs officielles TYKA
* Numéro ou identifiant du rapport
* Date du diagnostic

### Nouvelle structure

#### Page 1

Couverture

* Logo TYKA
* Nom du bénéficiaire
* Date
* Titre :
  "Rapport d'orientation et de développement personnalisé"

#### Page 2

Synthèse générale

* Score global TYKA
* Graphique radar
* Résumé exécutif

#### Page 3

Développement personnel

* Forces
* Points d'amélioration
* Recommandations

#### Page 4

Développement professionnel

* Diagnostic
* Opportunités
* Risques

#### Page 5

Plan d'action personnalisé

Actions prioritaires :

* 30 jours
* 90 jours
* 6 mois

#### Page 6

Recommandations TYKA

* Formations
* Cohortes
* Experts
* Ressources numériques

Ajouter une mise en page moderne avec icônes, graphiques et indicateurs visuels.

---

## 4. Activation du partage des contenus Explorer

Pour chaque vidéo, podcast ou contenu publié dans Explorer :

Ajouter un bouton :

**Partager**

Au clic :

* WhatsApp
* Facebook

Le partage doit générer automatiquement :

* le titre du contenu ;
* un aperçu visuel ;
* le lien direct vers la ressource TYKA.

---

## 5. Renforcement de l'architecture technique et des bases de données

Effectuer une vérification complète de l'architecture de la plateforme.

### Objectifs

Garantir que toute future mise à jour n'altère jamais :

* les cohortes existantes ;
* les inscriptions ;
* les paiements ;
* les vidéos ;
* les podcasts ;
* les ressources ;
* les profils membres ;
* les diagnostics TYKA Compass.

### Exigences techniques

* séparation Front-End / Back-End ;
* migrations sécurisées ;
* sauvegardes automatiques ;
* versionnement des bases ;
* restauration rapide en cas d'erreur ;
* contrôle d'intégrité des données.

### Synchronisation

Vérifier que toutes les bases sont synchronisées entre :

* Administration principale ;
* Ambassadeurs ;
* Learning Developers ;
* Business Developers ;
* Espace utilisateur.

Aucune donnée ne doit être visible dans un espace et absente dans un autre lorsqu'elle est validée.

---

## 6. Gestion de la montée en charge

Vérifier que la plateforme supporte :

* plusieurs dizaines de connexions simultanées ;
* plusieurs centaines d'apprenants connectés en même temps ;
* consultations simultanées des vidéos ;
* inscriptions simultanées aux cohortes.

Mettre en place :

* gestion des sessions ;
* optimisation des requêtes ;
* cache ;
* monitoring des performances.

---

## 7. Création de cohortes – Image de couverture

Dans le formulaire de création de cohorte :

Ajouter un champ :

**Image de couverture**

Fonctionnalités :

* téléchargement image ;
* aperçu instantané ;
* recadrage automatique ;
* formats JPG, PNG, WEBP.

L'image est affichée :

* dans le catalogue des cohortes ;
* sur la page de détail ;
* dans les résultats de recherche.

---

## 8. Gestion des partenaires

Dans le module Administrateur → Partenaires :

Ajouter un champ :

**Logo du partenaire**

Fonctionnalités :

* téléchargement ;
* aperçu ;
* modification ;
* suppression.

Le logo doit apparaître :

* sur la fiche partenaire ;
* sur les cohortes associées ;
* sur les formations associées ;
* dans la mention :
  "Propulsé par [Logo partenaire]".

---

## 9. Vérification finale avant déploiement

Effectuer un audit complet de cohérence afin de vérifier :

* cohérence des rôles utilisateurs ;
* cohérence des permissions ;
* cohérence des bases de données ;
* cohérence des inscriptions ;
* cohérence des paiements ;
* cohérence des cohortes ;
* cohérence du LMS ;
* cohérence de TYKA Compass ;
* cohérence de l'espace Communauté ;
* cohérence de l'espace Explorer.

Objectif final :

Une plateforme TYKA stable, évolutive, sécurisée, synchronisée et prête à accueillir un grand nombre d'utilisateurs sans perte de données.
