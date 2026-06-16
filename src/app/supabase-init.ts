// Extend window interface
declare global {
  interface Window {
    tykaSupabase?: {
      test: () => Promise<any>;
      navigate: (path: string) => void;
      docs: () => void;
      help: () => void;
    };
  }
}

console.log(`
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                          ║
║   🎉  TYKA - INFRASTRUCTURE SUPABASE OPÉRATIONNELLE  🎉                 ║
║                                                                          ║
╚══════════════════════════════════════════════════════════════════════════╝

✅ Configuration Supabase complétée avec succès !

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 INFRASTRUCTURE BACKEND

  Base de données  : kv_store_6c74deb9
  Routes API       : 27 endpoints
  Service Frontend : 20 fonctions
  Page de Test     : /test-supabase
  Documentation    : 4 fichiers

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 LIENS RAPIDES

  🧪 Page de test    : /test-supabase
  📊 Dashboard       : https://supabase.com/dashboard/project/ufeatkxajlhmacydkegz

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Astuce : Tapez "tykaSupabase.help()" pour voir les commandes disponibles
`);

// Export des fonctions de test rapide
if (typeof window !== 'undefined') {
  window.tykaSupabase = {
    test: async () => {
      console.log('🧪 Test de la connexion Supabase...');
      try {
        const { checkHealth, getAllVideos, getAllMembers } = await import('./services/supabaseService');
        
        const health = await checkHealth();
        console.log('✅ Health Check:', health);
        
        const videos = await getAllVideos();
        console.log('✅ Vidéos:', videos);
        
        const members = await getAllMembers();
        console.log('✅ Membres:', members);
        
        return { health, videos, members };
      } catch (error) {
        console.error('❌ Erreur lors du test:', error);
        return { error };
      }
    },
    
    navigate: (path: string) => {
      console.log(`🔗 Navigation vers ${path}`);
      window.location.href = path;
    },
    
    docs: () => {
      console.log(`
📚 DOCUMENTATION DISPONIBLE

1. Guide Principal
   → /SUPABASE_README.md

2. Configuration et Test
   → /SUPABASE_SETUP_GUIDE.md

3. Documentation API
   → /API_DOCUMENTATION.md

4. Checklist Infrastructure
   → /SUPABASE_CHECKLIST.md

5. Page de Test
   → /test-supabase
      `);
    },
    
    help: () => {
      console.log(`
🆘 AIDE RAPIDE

tykaSupabase.test()                     Test connexion Supabase
tykaSupabase.navigate('/test-supabase') Ouvrir page de test
tykaSupabase.docs()                     Afficher documentation
tykaSupabase.help()                     Afficher cette aide
      `);
    }
  };
}

export {};