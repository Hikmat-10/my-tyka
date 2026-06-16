# 🔌 Guide de Connexion et Test Supabase - TYKA

## ✅ Configuration Supabase Complétée

Votre plateforme TYKA est maintenant connectée à Supabase ! Voici ce qui a été mis en place :

---

## 📊 Architecture de la Base de Données

### Table Principale : `kv_store_6c74deb9`
Utilise un système clé-valeur avec préfixes pour organiser les données :

| Préfixe | Description | Exemple de clé |
|---------|-------------|----------------|
| `member:` | Profils membres | `member:member_1234567890` |
| `ambassador:` | Données ambassadeurs | `ambassador:member_1234567890` |
| `video:` | Catalogue vidéos | `video:1` |
| `watched:` | Historique vidéos vues | `watched:member_123:video_456` |
| `activity:` | Journal d'activités | `activity:member_123:activity_789` |
| `initiative:` | Initiatives proposées | `initiative:initiative_1234567890` |
| `cohort:` | Cohortes de formation | `cohort:cohort_123` |
| `enrollment:` | Inscriptions cohortes | `enrollment:member_123:cohort_456` |

---

## 🚀 API Routes Créées

### **Membres**
- `GET /members` - Liste tous les membres
- `GET /members/:id` - Détails d'un membre
- `POST /members` - Inscription nouveau membre
- `PUT /members/:id` - Mise à jour profil
- `POST /members/:id/validate` - Validation par ambassadeur
- `POST /auth/login` - Connexion membre

### **Vidéos**
- `GET /videos` - Liste toutes les vidéos
- `POST /videos` - Créer une vidéo
- `PUT /videos/:id` - Modifier une vidéo
- `DELETE /videos/:id` - Supprimer une vidéo

### **Historique Vidéos**
- `GET /members/:memberId/watched-videos` - Historique membre
- `POST /members/:memberId/watched-videos` - Ajouter une vue

### **Initiatives**
- `GET /initiatives` - Liste initiatives
- `POST /initiatives` - Créer initiative
- `PUT /initiatives/:id` - Modifier initiative

### **Cohortes**
- `GET /cohorts` - Liste cohortes
- `POST /cohorts/:cohortId/enroll` - S'inscrire
- `GET /members/:memberId/enrollments` - Inscriptions membre

### **Ambassadeurs**
- `GET /ambassadors` - Liste ambassadeurs

### **Statistiques**
- `GET /members/:memberId/stats` - Stats complètes membre
- `GET /members/:memberId/activities` - Journal activités

### **Initialisation**
- `POST /init-default-data` - Charger données par défaut

---

## 🧪 Comment Tester la Connexion

### Option 1 : Page de Test Automatique (Recommandé)

1. **Accédez à la page de test** :
   ```
   https://[votre-url]/test-supabase
   ```

2. **Cliquez sur "Lancer les tests"**

3. **Résultats attendus** :
   - ✅ Health Check
   - ✅ Initialize Default Data
   - ✅ Get All Videos (3 vidéos par défaut)
   - ✅ Get All Members
   - ✅ Get All Ambassadors
   - ✅ Create Test Member
   - ✅ Login Test Member
   - ✅ Get Member Stats
   - ✅ Create Test Video
   - ✅ Add Watched Video

4. **Vérification visuelle** :
   - Chaque test affiche ✅ (succès) ou ❌ (erreur)
   - Badge vert final = "Tous les tests sont passés !"
   - Détails JSON disponibles en cliquant sur "Voir les données"

### Option 2 : Console Développeur

Ouvrez la console et testez directement :

```javascript
// Importer le service
import * as api from './src/app/services/supabaseService';

// Test 1: Health Check
const health = await api.checkHealth();
console.log('Health:', health);

// Test 2: Initialiser les données
const init = await api.initializeDefaultData();
console.log('Init:', init);

// Test 3: Récupérer les vidéos
const videos = await api.getAllVideos();
console.log('Videos:', videos);

// Test 4: Créer un membre
const member = await api.createMember({
  email: 'test@example.com',
  password: 'test123',
  firstName: 'Jean',
  lastName: 'Dupont',
  country: 'France',
  city: 'Paris'
});
console.log('Member:', member);
```

---

## 📋 Tables de la Base de Données

### Table `kv_store_6c74deb9`

**Vue Supabase** : https://supabase.com/dashboard/project/ufeatkxajlhmacydkegz/database/tables

**Structure** :
```sql
CREATE TABLE kv_store_6c74deb9 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
```

**Exemple de données** :
```json
{
  "key": "member:member_1234567890",
  "value": {
    "id": "member_1234567890",
    "email": "marie@example.com",
    "firstName": "Marie",
    "lastName": "Diallo",
    "country": "Sénégal",
    "city": "Dakar",
    "status": "ambassador_potential",
    "ambassadorCode": "MADI8765",
    "validationStatus": "pending_validation",
    "joinedAt": "2026-04-07T10:30:00.000Z"
  }
}
```

---

## 🔄 Migration des Données Actuelles

Actuellement, vos données sont dans **localStorage**. Voici comment migrer :

### Étape 1 : Exporter les données localStorage

```javascript
// Dans la console du navigateur
const exportData = () => {
  const data = {
    members: JSON.parse(localStorage.getItem('tykaMembers') || '[]'),
    videos: JSON.parse(localStorage.getItem('tykaVideos') || '[]'),
    ambassadors: JSON.parse(localStorage.getItem('tykaAmbassadors') || '[]'),
    initiatives: JSON.parse(localStorage.getItem('tykaInitiatives') || '[]'),
    cohorts: JSON.parse(localStorage.getItem('tykaCohorts') || '[]'),
  };
  console.log('Données à migrer:', data);
  return data;
};

const localData = exportData();
```

### Étape 2 : Importer dans Supabase

```javascript
// Importer les vidéos
for (const video of localData.videos) {
  await api.createVideo(video);
}

// Importer les membres
for (const member of localData.members) {
  await api.createMember(member);
}

// etc.
```

---

## 🔐 Sécurité

### Actuellement Implémenté
- ✅ CORS activé pour tous les domaines
- ✅ Authorization Bearer avec `publicAnonKey`
- ✅ Logs des erreurs côté serveur
- ⚠️ Mots de passe en clair (OK pour prototype)

### À Implémenter en Production
- 🔒 Hashing des mots de passe (bcrypt)
- 🔒 JWT tokens pour l'authentification
- 🔒 Rate limiting sur les endpoints sensibles
- 🔒 Validation des données côté serveur
- 🔒 HTTPS obligatoire

---

## 📊 Monitoring

### Vérifier les Logs Supabase

1. Aller sur : https://supabase.com/dashboard/project/ufeatkxajlhmacydkegz/logs/edge-functions
2. Sélectionner la fonction `server`
3. Voir les logs en temps réel

### Vérifier la Base de Données

1. Aller sur : https://supabase.com/dashboard/project/ufeatkxajlhmacydkegz/editor
2. Table : `kv_store_6c74deb9`
3. Exécuter des requêtes SQL :

```sql
-- Compter les membres
SELECT COUNT(*) FROM kv_store_6c74deb9 WHERE key LIKE 'member:%';

-- Voir tous les membres
SELECT * FROM kv_store_6c74deb9 WHERE key LIKE 'member:%';

-- Voir toutes les vidéos
SELECT * FROM kv_store_6c74deb9 WHERE key LIKE 'video:%';
```

---

## 🐛 Dépannage

### Erreur : "Failed to fetch"
**Cause** : Problème de CORS ou serveur Supabase inactif
**Solution** :
1. Vérifier que le serveur Supabase est déployé
2. Vérifier l'URL dans `/utils/supabase/info.tsx`
3. Vérifier que les logs n'affichent pas d'erreur

### Erreur : "Unauthorized"
**Cause** : Clé API incorrecte
**Solution** :
1. Vérifier `publicAnonKey` dans `/utils/supabase/info.tsx`
2. Vérifier que les variables d'environnement Supabase sont configurées

### Aucune donnée retournée
**Cause** : Base de données vide
**Solution** :
1. Lancer `/test-supabase` et cliquer sur "Lancer les tests"
2. Vérifier que "Initialize Default Data" est en succès
3. Vérifier dans le dashboard Supabase que les données sont présentes

---

## ✅ Checklist de Vérification

- [ ] Page `/test-supabase` accessible
- [ ] Test "Health Check" passe ✅
- [ ] Test "Initialize Default Data" passe ✅
- [ ] Au moins 3 vidéos par défaut créées
- [ ] Création d'un membre de test réussie
- [ ] Login après validation fonctionne
- [ ] Statistiques membres calculées
- [ ] Tracking vidéos regardées opérationnel
- [ ] Dashboard Supabase affiche les données

---

## 🎉 Prochaines Étapes

Une fois tous les tests validés :

1. **Migrer les contextes** : Modifier `MemberAuthContext` pour utiliser Supabase API
2. **Migrer dataService** : Remplacer localStorage par Supabase API
3. **Tester l'inscription** : Vérifier le flow complet inscription → validation → connexion
4. **Tester le dashboard membre** : Vérifier que les stats se chargent depuis Supabase
5. **Publier sur Figma Make** : Votre app sera partageable !

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez les logs Supabase Edge Functions
2. Vérifiez la console navigateur (F12)
3. Testez chaque endpoint individuellement avec `/test-supabase`

**Votre infrastructure Supabase est prête ! 🎊**
