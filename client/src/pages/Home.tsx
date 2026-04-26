import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Search, Star, Phone, Mail } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation } from "wouter";
import { MapView } from "@/components/Map";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null);
  
  // Fetch clinics
  const { data: clinics = [] } = trpc.clinics.list.useQuery();
  const { data: specialties = [] } = trpc.specialties.list.useQuery();
  
  // Search or filter clinics
  let filteredClinics = clinics;
  if (searchQuery) {
    filteredClinics = filteredClinics.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  if (selectedSpecialty) {
    // This would need a more sophisticated filter based on clinic specialties
    // For now, we'll show all clinics
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">Clínicas Próximas</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">{user?.name}</span>
                {user?.role === "admin" && (
                  <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                    Admin
                  </Button>
                )}
                <Button variant="outline" size="sm">Perfil</Button>
              </div>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>Entrar</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Search */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-2">Encontre as Melhores Clínicas</h2>
          <p className="text-blue-100 mb-8">Busque por especialidade ou localização</p>
          
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar clínicas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white text-slate-900 border-0"
              />
            </div>
            <select
              value={selectedSpecialty || ""}
              onChange={(e) => setSelectedSpecialty(e.target.value ? parseInt(e.target.value) : null)}
              className="px-4 py-2 bg-white text-slate-900 rounded-lg border-0 font-medium"
            >
              <option value="">Todas as especialidades</option>
              {specialties.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden shadow-lg h-96 lg:h-[600px]">
              <MapView initialCenter={{ lat: -8.8383, lng: 13.2344 }} initialZoom={12} />
            </Card>
          </div>

          {/* Clinics List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {filteredClinics.length} Clínica{filteredClinics.length !== 1 ? 's' : ''} Encontrada{filteredClinics.length !== 1 ? 's' : ''}
            </h3>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredClinics.map(clinic => (
                <Card key={clinic.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-slate-900">{clinic.name}</h4>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span>{clinic.city}</span>
                    </div>
                    
                    {clinic.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4" />
                        <span>{clinic.phone}</span>
                      </div>
                    )}
                    
                    {clinic.email && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-4 h-4" />
                        <span>{clinic.email}</span>
                      </div>
                    )}
                    
                    {clinic.averageRating && clinic.averageRating > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <div className="flex">
                          {[...Array(5)].map((_, i: number) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.round(clinic.averageRating || 0)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-slate-600">({clinic.totalRatings})</span>
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => navigate(`/clinic/${clinic.id}`)}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
