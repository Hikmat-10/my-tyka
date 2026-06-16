import { useNavigate } from "react-router";
import { Play, Users, Lightbulb } from "lucide-react";
import { Header } from "../components/Header";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      <Header />
      
      <main className="container mx-auto px-6 py-16">
        <div className="text-center mb-16 mt-8">
<h1 className="text-5xl font-bold text-gray-900 mb-4">
            Bienvenue sur <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TYKA</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto"><span className="font-bold">Apprendre, partager, créer de la valeur</span> </p>
          <p className="text-lg text-gray-500 mt-2"><span className="font-bold italic">Territoires · Humanités · Organisations</span></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Savoirs Button */}
          <button
            onClick={() => navigate("/explorer")}
            className="group relative bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Play className="w-10 h-10" fill="currentColor" />
              </div>
              
              <h2 className="text-3xl font-bold mb-4">Explorer</h2>
              <p className="text-blue-100">
                Explorer vidéos, podcast, mooc
              </p>
            </div>

            <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-500" />
          </button>

          {/* Communauté TYKA Button */}
          <button
            onClick={() => navigate("/communaute")}
            className="group relative bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
          >
            <div className="relative z-10 flex flex-col items-center">
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10" />
              </div>
              
              <h2 className="text-3xl font-bold mb-4">Communauté TYKA</h2>
              <p className="text-orange-100">Connecter</p>
            </div>

            <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-500" />
          </button>

          {/* Initiatives Button */}
          <button
            onClick={() => navigate("/co-creer")}
            className="group relative bg-gradient-to-br from-green-600 to-green-700 rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Lightbulb className="w-10 h-10" />
              </div>
              
              <h2 className="text-3xl font-bold mb-4">Créer</h2>
              <p className="text-green-100">Apprendre et proposer des défis collaboratifs</p>
            </div>

            <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-500" />
          </button>
        </div>

        {/* Additional info section */}
        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-8 bg-white/70 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-lg border border-white/50">
            <div>
              <div className="text-3xl font-bold text-blue-600">500+</div>
              <div className="text-sm text-gray-600">Membres actifs</div>
            </div>
            <div className="w-px h-12 bg-gray-300" />
            <div>
              <div className="text-3xl font-bold text-orange-600">120+</div>
              <div className="text-sm text-gray-600">Contenus</div>
            </div>
            <div className="w-px h-12 bg-gray-300" />
            <div>
              <div className="text-3xl font-bold text-green-600">45+</div>
              <div className="text-sm text-gray-600">Thèmes</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}