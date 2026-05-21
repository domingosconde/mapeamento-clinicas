import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Search, Star, Phone, Mail } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { MapView } from "@/components/Map";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Home() {
  const { user, isAuthenticated } = useAuth({ redirectOnUnauthenticated: false });
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  // Fetch all clinics
  const { data: allClinics = [] } = trpc.clinics.list.useQuery();

  // Compute displayed clinics (only by search query)
  let filteredClinics = allClinics;
  if (searchQuery) {
    filteredClinics = filteredClinics.filter((c: any) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Place markers on the map whenever clinics or map changes
  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    placeMarkers(map, filteredClinics);
  }, []); // eslint-disable-line

  function placeMarkers(map: google.maps.Map, clinicList: any[]) {
    // Clear old markers
    markersRef.current.forEach(m => { m.map = null; });
    markersRef.current = [];

    clinicList.forEach((clinic: any) => {
      if (!clinic.latitude || !clinic.longitude) return;
      const lat = parseFloat(String(clinic.latitude));
      const lng = parseFloat(String(clinic.longitude));
      if (isNaN(lat) || isNaN(lng)) return;

      const pin = document.createElement("div");
      pin.className = "bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg cursor-pointer whitespace-nowrap";
      pin.textContent = clinic.name.length > 20 ? clinic.name.slice(0, 18) + "…" : clinic.name;

      const marker = new window.google!.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat, lng },
        title: clinic.name,
        content: pin,
      });

      marker.addListener("click", () => {
        navigate(`/clinic/${clinic.id}`);
      });

      markersRef.current.push(marker);
    });
  }

  // Re-place markers when filter changes and map is ready
  const handleFilterChange = (newClinics: any[]) => {
    if (mapRef.current) placeMarkers(mapRef.current, newClinics);
  };

  const handleSearchChange = (v: string) => {
    setSearchQuery(v);
    const next = allClinics.filter((c: any) => c.name.toLowerCase().includes(v.toLowerCase()));
    handleFilterChange(next);
  };

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
                  <>
                    <Button variant="outline" size="sm" onClick={() => navigate("/setup")}>
                      Setup
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                      Admin
                    </Button>
                  </>
                )}
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
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
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
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-white text-slate-900 border-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden shadow-lg h-96 lg:h-[600px]">
              <MapView
                initialCenter={{ lat: -8.8383, lng: 13.2344 }}
                initialZoom={12}
                onMapReady={handleMapReady}
              />
            </Card>
          </div>

          {/* Clinics List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {filteredClinics.length} Clínica{filteredClinics.length !== 1 ? "s" : ""} Encontrada{filteredClinics.length !== 1 ? "s" : ""}
            </h3>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredClinics.length === 0 && (
                <p className="text-center text-slate-500 py-12">Nenhuma clínica encontrada.</p>
              )}
              {filteredClinics.map((clinic: any) => (
                <Card
                  key={clinic.id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/clinic/${clinic.id}`)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 justify-between">
                      <h4 className="font-semibold text-slate-900">{clinic.name}</h4>
                      {clinic.isVerified && (
                        <span className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 shrink-0">
                          ✓
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>{clinic.city}</span>
                    </div>

                    {clinic.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span>{clinic.phone}</span>
                      </div>
                    )}

                    {clinic.email && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{clinic.email}</span>
                      </div>
                    )}

                    {clinic.averageRating && clinic.averageRating > 0 ? (
                      <div className="flex items-center gap-1 text-sm">
                        <div className="flex">
                          {[...Array(5)].map((_, i: number) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.round(clinic.averageRating || 0)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-slate-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-slate-600">
                          {Number(clinic.averageRating).toFixed(1)} ({clinic.totalRatings})
                        </span>
                      </div>
                    ) : null}

                    {clinic.isVerified && (
                      <span className="inline-block text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                        ✓ Verificada
                      </span>
                    )}
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
