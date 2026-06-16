# 📚 Documentation API TYKA - Supabase Backend

## 🌐 Base URL
```
https://ufeatkxajlhmacydkegz.supabase.co/functions/v1/make-server-6c74deb9
```

## 🔑 Authentification
Toutes les requêtes doivent inclure le header :
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📍 Endpoints

### 🏥 Health Check

#### `GET /health`
Vérifie que le serveur est opérationnel.

**Réponse :**
```json
{
  "status": "ok",
  "timestamp": "2026-04-07T10:30:00.000Z"
}
```

---

### 👥 Members

#### `GET /members`
Récupère tous les membres.

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": "member_1234567890",
      "email": "marie@example.com",
      "firstName": "Marie",
      "lastName": "Diallo",
      "country": "Sénégal",
      "city": "Dakar",
      "status": "ambassador_potential",
      "ambassadorCode": "MADI8765",
      "validationStatus": "pending_validation",
      "joinedAt": "2026-04-07T10:30:00.000Z",
      "visibleInTrombinoscope": false
    }
  ]
}
```

#### `GET /members/:id`
Récupère un membre par ID.

**Paramètres :**
- `id` (string) - ID du membre

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "member_1234567890",
    "email": "marie@example.com",
    "firstName": "Marie",
    "lastName": "Diallo",
    ...
  }
}
```

#### `POST /members`
Crée un nouveau membre (inscription).

**Body :**
```json
{
  "email": "marie@example.com",
  "password": "securePassword123",
  "firstName": "Marie",
  "lastName": "Diallo",
  "country": "Sénégal",
  "city": "Dakar",
  "phone": "+221 77 123 45 67",
  "whatsapp": "+221 77 123 45 67",
  "bio": "Passionnée d'entrepreneuriat social",
  "interests": ["entrepreneuriat", "éducation"],
  "activity": "Consultante",
  "privacySettings": {
    "showEmail": false,
    "showWhatsApp": true,
    "showPhone": false
  }
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "member_1234567890",
    "email": "marie@example.com",
    "firstName": "Marie",
    "lastName": "Diallo",
    "ambassadorCode": "MADI8765",
    "validationStatus": "pending_validation",
    "joinedAt": "2026-04-07T10:30:00.000Z"
  }
}
```

**Erreurs :**
```json
{
  "success": false,
  "error": "Email already exists"
}
```

#### `PUT /members/:id`
Met à jour un membre.

**Body :**
```json
{
  "bio": "Nouvelle biographie",
  "skills": [
    { "name": "Leadership", "level": 4 },
    { "name": "Gestion de projet", "level": 3 }
  ]
}
```

#### `POST /members/:id/validate`
Valide ou rejette un membre (pour ambassadeurs).

**Body :**
```json
{
  "status": "active"  // ou "rejected"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "member_1234567890",
    "validationStatus": "active",
    "validatedAt": "2026-04-07T10:30:00.000Z",
    "visibleInTrombinoscope": true
  }
}
```

---

### 🔐 Authentication

#### `POST /auth/login`
Connexion d'un membre.

**Body :**
```json
{
  "email": "marie@example.com",
  "password": "securePassword123"
}
```

**Réponse Succès :**
```json
{
  "success": true,
  "data": {
    "id": "member_1234567890",
    "email": "marie@example.com",
    "firstName": "Marie",
    "lastName": "Diallo",
    ...
  }
}
```

**Réponse Erreur (compte en attente) :**
```json
{
  "success": false,
  "error": "Your account is pending validation by an ambassador"
}
```

**Réponse Erreur (compte rejeté) :**
```json
{
  "success": false,
  "error": "Your membership application was rejected"
}
```

---

### 🎥 Videos

#### `GET /videos`
Récupère toutes les vidéos.

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Introduction à l'entrepreneuriat social",
      "instructor": "Amina Diallo",
      "duration": "42 min",
      "thumbnail": "https://...",
      "type": "formation",
      "category": "entrepreneuriat",
      "createdAt": "2026-04-07T10:30:00.000Z"
    }
  ]
}
```

#### `POST /videos`
Crée une nouvelle vidéo.

**Body :**
```json
{
  "title": "Nouvelle formation",
  "instructor": "Jean Dupont",
  "duration": "30 min",
  "thumbnail": "https://...",
  "type": "formation",
  "category": "leadership"
}
```

#### `PUT /videos/:id`
Met à jour une vidéo.

#### `DELETE /videos/:id`
Supprime une vidéo.

---

### 📺 Watched Videos

#### `GET /members/:memberId/watched-videos`
Récupère l'historique des vidéos regardées par un membre.

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": "watched_1234567890",
      "videoId": "1",
      "memberId": "member_1234567890",
      "videoTitle": "Introduction à l'entrepreneuriat social",
      "videoThumbnail": "https://...",
      "videoInstructor": "Amina Diallo",
      "videoDuration": "42 min",
      "watchedAt": "2026-04-07T10:30:00.000Z"
    }
  ]
}
```

#### `POST /members/:memberId/watched-videos`
Ajoute une vidéo à l'historique d'un membre.

**Body :**
```json
{
  "videoId": "1",
  "videoTitle": "Introduction à l'entrepreneuriat social",
  "videoThumbnail": "https://...",
  "videoInstructor": "Amina Diallo",
  "videoDuration": "42 min"
}
```

---

### 💡 Initiatives

#### `GET /initiatives`
Récupère toutes les initiatives.

#### `POST /initiatives`
Crée une nouvelle initiative.

**Body :**
```json
{
  "title": "Atelier Design Thinking",
  "description": "Atelier collaboratif...",
  "category": "formation",
  "startDate": "2026-05-15",
  "endDate": "2026-05-17",
  "location": "Dakar, Sénégal",
  "modality": "hybrid",
  "organizer": "Marie Diallo",
  "organizerId": "member_1234567890",
  "status": "pending"
}
```

#### `PUT /initiatives/:id`
Met à jour une initiative.

---

### 🎓 Cohorts

#### `GET /cohorts`
Récupère toutes les cohortes.

#### `POST /cohorts/:cohortId/enroll`
Inscrit un membre à une cohorte.

**Body :**
```json
{
  "memberId": "member_1234567890"
}
```

#### `GET /members/:memberId/enrollments`
Récupère les inscriptions d'un membre.

---

### 📊 Activities

#### `GET /members/:memberId/activities`
Récupère le journal d'activités d'un membre.

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": "activity_1234567890",
      "memberId": "member_1234567890",
      "type": "video_watched",
      "title": "Introduction à l'entrepreneuriat social",
      "description": "Vidéo regardée : Introduction à l'entrepreneuriat social par Amina Diallo",
      "timestamp": "2026-04-07T10:30:00.000Z"
    }
  ]
}
```

---

### 🏆 Ambassadors

#### `GET /ambassadors`
Récupère tous les ambassadeurs.

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": "member_1234567890",
      "firstName": "Marie",
      "lastName": "Diallo",
      "email": "marie@example.com",
      "whatsapp": "+221 77 123 45 67",
      "country": "Sénégal",
      "city": "Dakar",
      "status": "ambassador_potential",
      "validationStatus": "active",
      "ambassadorCode": "MADI8765",
      "joinedAt": "2026-04-07T10:30:00.000Z",
      "referredMembers": 0
    }
  ]
}
```

---

### 📈 Statistics

#### `GET /members/:memberId/stats`
Récupère les statistiques d'un membre.

**Réponse :**
```json
{
  "success": true,
  "data": {
    "totalVideosWatched": 5,
    "totalCohortsJoined": 2,
    "totalActivities": 12,
    "lastActivity": "2026-04-07T10:30:00.000Z"
  }
}
```

---

### 🔧 Initialization

#### `POST /init-default-data`
Initialise les données par défaut (vidéos).

**Réponse :**
```json
{
  "success": true,
  "message": "Default data initialized"
}
```

Ou si déjà initialisé :
```json
{
  "success": true,
  "message": "Data already initialized"
}
```

---

## 🗂️ Structure des Données

### Member
```typescript
{
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  whatsapp?: string;
  country: string;
  city?: string;
  bio?: string;
  interests?: string[];
  profileImage?: string;
  activity?: string;
  status: "member" | "ambassador_potential" | "ambassador_active";
  ambassadorCode?: string;
  joinedAt: string;
  emailConfirmed: boolean;
  validationStatus?: "pending_validation" | "active" | "rejected";
  visibleInTrombinoscope?: boolean;
  skills?: { name: string; level: number }[];
  privacySettings?: {
    showEmail: boolean;
    showWhatsApp: boolean;
    showPhone: boolean;
  };
}
```

### Video
```typescript
{
  id: string;
  title: string;
  instructor: string;
  duration: string;
  thumbnail: string;
  type: string;
  category: string;
  createdAt?: string;
}
```

### Initiative
```typescript
{
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate?: string;
  location: string;
  modality: "online" | "in-person" | "hybrid";
  organizer: string;
  organizerId: string;
  status: "draft" | "pending" | "approved" | "rejected";
  createdAt: string;
  image?: string;
}
```

---

## ❗ Codes d'Erreur

| Code | Description |
|------|-------------|
| 200 | Succès |
| 400 | Mauvaise requête (email existe, champs manquants) |
| 401 | Non authentifié (login incorrect) |
| 403 | Accès refusé (compte en attente ou rejeté) |
| 404 | Ressource non trouvée |
| 500 | Erreur serveur |

---

## 🔄 Flow d'Inscription Complet

1. **Inscription** : `POST /members`
   - Crée le membre avec `validationStatus: "pending_validation"`
   - Crée l'ambassadeur correspondant
   - Génère un `ambassadorCode` unique

2. **Tentative de connexion** : `POST /auth/login`
   - Bloque si `validationStatus === "pending_validation"`
   - Renvoie erreur 403

3. **Validation par ambassadeur** : `POST /members/:id/validate`
   - Ambassadeur change le statut en `"active"` ou `"rejected"`
   - Met à jour `visibleInTrombinoscope`

4. **Connexion réussie** : `POST /auth/login`
   - Membre peut se connecter
   - Accès au dashboard

---

## 🎯 Utilisation Frontend

```typescript
import * as api from './services/supabaseService';

// Inscription
const result = await api.createMember({
  email: 'marie@example.com',
  password: 'password123',
  firstName: 'Marie',
  lastName: 'Diallo',
  country: 'Sénégal',
  city: 'Dakar'
});

// Connexion
const loginResult = await api.login('marie@example.com', 'password123');

// Récupérer vidéos
const videos = await api.getAllVideos();

// Marquer vidéo comme vue
await api.addWatchedVideo(memberId, {
  videoId: '1',
  videoTitle: 'Introduction...',
  videoThumbnail: 'https://...',
  videoInstructor: 'Amina Diallo',
  videoDuration: '42 min'
});
```

---

## 📦 Service Frontend Complet

Le fichier `/src/app/services/supabaseService.ts` contient toutes les fonctions d'API prêtes à l'emploi :

- ✅ Gestion automatique des headers
- ✅ Gestion des erreurs
- ✅ Types TypeScript complets
- ✅ Promesses async/await
- ✅ Format de réponse unifié

---

**Documentation complète - TYKA Platform API v1.0**
