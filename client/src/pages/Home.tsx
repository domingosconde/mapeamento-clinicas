import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleUserRound,
  HeartHandshake,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Search,
  SearchX,
  ShieldCheck,
  Star,
} from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { MapView } from "@/components/Map";
import { useAuth } from "@/_core/hooks/useAuth";
import { searchClinicsByName } from "@/lib/clinicSearch";

export default function Home() {
  const { user, isAuthenticated } = useAuth({ redirectOnUnauthenticated: false });
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  const {
    data: allClinics = [],
    isLoading,
    isError,
  } = trpc.clinics.list.useQuery();

  const filteredClinics = useMemo(
    () => searchClinicsByName(allClinics, searchQuery),
    [allClinics, searchQuery],
  );

  const verifiedCount = useMemo(
    () => allClinics.filter((clinic: any) => clinic.isVerified).length,
    [allClinics],
  );

  const placeMarkers = useCallback(
    (map: google.maps.Map, clinicList: any[]) => {
      markersRef.current.forEach((marker) => {
        marker.map = null;
      });
      markersRef.current = [];

      clinicList.forEach((clinic: any) => {
        if (!clinic.latitude || !clinic.longitude) return;

        const lat = parseFloat(String(clinic.latitude));
        const lng = parseFloat(String(clinic.longitude));
        if (Number.isNaN(lat) || Number.isNaN(lng)) return;

        const pin = document.createElement("div");
        pin.className = [
          "flex items-center gap-1 rounded-full border-2 border-white px-2.5 py-1 text-[11px] font-bold text-white shadow-[0_8px_20px_rgba(24,88,91,0.28)] transition-transform hover:scale-105",
          clinic.isVerified ? "bg-emerald-600" : "bg-primary",
        ].join(" ");
        pin.textContent = clinic.isVerified ? `✓ ${clinic.name}` : clinic.name;

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
    },
    [navigate],
  );

  const handleMapReady = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      placeMarkers(map, filteredClinics);
    },
    [filteredClinics, placeMarkers],
  );

  useEffect(() => {
    if (mapRef.current) {
      placeMarkers(mapRef.current, filteredClinics);
    }
  }, [filteredClinics, placeMarkers]);

  return (
    <div className="app-shell min-h-screen overflow-x-hidden">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/85 backdrop-blur-xl">
        <div className="container flex min-h-[76px] items-center justify-between gap-4">
          <a
            href="/"
            className="flex items-center gap-3 rounded-xl outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Clínicas Próximas — página inicial"
          >
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(43,157,158,0.24)]">
              <HeartHandshake className="size-5" aria-hidden="true" />
            </span>
            <span className="hidden sm:block">
              <span className="display-font block text-sm font-semibold text-foreground">
                Clínicas Próximas
              </span>
              <span className="block text-xs text-muted-foreground">
                Cuidados de confiança
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex" aria-label="Navegação principal">
            <a className="transition-colors hover:text-foreground" href="#explorar">
              Explorar clínicas
            </a>
            <a className="transition-colors hover:text-foreground" href="#como-funciona">
              Como funciona
            </a>
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 rounded-full border border-border/70 bg-white/70 px-3 py-2 text-sm text-muted-foreground sm:flex">
                  <CircleUserRound className="size-4 text-primary" aria-hidden="true" />
                  <span className="max-w-[150px] truncate">{user?.name}</span>
                </div>
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
              <Button asChild className="rounded-full px-5 shadow-[0_8px_18px_rgba(43,157,158,0.2)]">
                <a href={getLoginUrl()}>Entrar</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-white/80">
          <div className="pointer-events-none absolute -right-24 top-10 size-72 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -left-32 bottom-0 size-96 rounded-full bg-amber-200/20 blur-3xl" aria-hidden="true" />

          <div className="container relative grid gap-12 py-14 sm:py-20 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:gap-16 lg:py-24">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
                <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
                Uma rede mais simples para cuidar de si
              </div>

              <h1 className="display-font max-w-2xl text-4xl font-semibold leading-[1.08] text-foreground sm:text-5xl lg:text-6xl">
                Encontre o cuidado certo, com mais confiança.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                Pesquise clínicas, compare informações essenciais e escolha o próximo passo com clareza — tudo num só lugar.
              </p>

              <div className="surface-card mt-9 max-w-2xl rounded-3xl p-2.5 sm:p-3">
                <label htmlFor="clinic-search" className="sr-only">
                  Pesquisar clínica por nome
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-primary" aria-hidden="true" />
                    <Input
                      id="clinic-search"
                      type="search"
                      placeholder="Pesquisar pelo nome da clínica"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="h-14 rounded-2xl border-0 bg-muted/60 pl-12 text-base shadow-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                  <Button
                    type="button"
                    className="h-14 rounded-2xl px-6 text-sm font-semibold shadow-[0_8px_20px_rgba(43,157,158,0.22)]"
                    onClick={() => document.getElementById("explorar")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    Explorar
                    <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />
                  Clínicas verificadas em destaque
                </span>
                <span className="inline-flex items-center gap-2">
                  <Navigation className="size-4 text-primary" aria-hidden="true" />
                  Informações num só lugar
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[520px] lg:justify-self-end">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-primary/10 blur-2xl" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[2.25rem] border border-white/90 bg-gradient-to-br from-primary via-teal-500 to-teal-700 p-5 shadow-[0_26px_70px_rgba(29,112,114,0.24)] sm:p-7">
                <div className="mb-16 flex items-center justify-between text-primary-foreground/85">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em]">Mapa de confiança</span>
                  <MapPin className="size-5" aria-hidden="true" />
                </div>
                <div className="relative mx-auto flex aspect-square max-w-[300px] items-center justify-center rounded-full border border-white/20 bg-white/10">
                  <div className="absolute size-[74%] rounded-full border border-dashed border-white/35" />
                  <div className="absolute size-[45%] rounded-full border border-white/25" />
                  <div className="relative flex size-20 items-center justify-center rounded-3xl bg-white text-primary shadow-2xl sm:size-24">
                    <HeartHandshake className="size-9 sm:size-11" aria-hidden="true" />
                  </div>
                  <span className="absolute left-[18%] top-[27%] size-3 rounded-full bg-emerald-300 shadow-[0_0_0_7px_rgba(167,243,208,0.18)]" />
                  <span className="absolute right-[20%] top-[39%] size-3 rounded-full bg-amber-200 shadow-[0_0_0_7px_rgba(253,230,138,0.18)]" />
                  <span className="absolute bottom-[25%] left-[30%] size-3 rounded-full bg-white shadow-[0_0_0_7px_rgba(255,255,255,0.18)]" />
                </div>
                <div className="mt-8 rounded-2xl border border-white/15 bg-black/10 p-4 text-primary-foreground backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-primary-foreground/70">Presença na rede</p>
                      <p className="mt-1 text-2xl font-semibold">{allClinics.length || "—"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-primary-foreground/70">Verificadas</p>
                      <p className="mt-1 text-2xl font-semibold">{verifiedCount || "—"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="explorar" className="container scroll-mt-24 py-14 sm:py-20">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-primary">Explorar clínicas</p>
              <h2 className="display-font text-2xl font-semibold text-foreground sm:text-3xl">
                Encontre uma clínica perto de si
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Use a pesquisa por nome ou navegue pelo mapa. A lista permanece disponível mesmo quando o mapa está temporariamente indisponível.
              </p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-semibold text-secondary-foreground">
              <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
              {isLoading ? "A carregar" : `${filteredClinics.length} resultado${filteredClinics.length === 1 ? "" : "s"}`}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)] lg:items-start">
            <div className="surface-card relative min-h-[420px] overflow-hidden rounded-[2rem] p-2 sm:min-h-[620px] sm:p-3">
              <div className="relative h-[420px] overflow-hidden rounded-[1.5rem] bg-muted sm:h-[620px]">
                <MapView
                  className="h-full"
                  initialCenter={{ lat: -8.8383, lng: 13.2344 }}
                  initialZoom={12}
                  onMapReady={handleMapReady}
                />
                <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/90 bg-white/90 px-3 py-2 text-xs font-semibold text-secondary-foreground shadow-lg backdrop-blur sm:left-5 sm:top-5">
                  <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
                  Verificadas em destaque
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="display-font text-base font-semibold text-foreground">Resultados</h3>
                <span className="text-xs text-muted-foreground">Atualizados online</span>
              </div>

              {isError && (
                <Card className="rounded-2xl border-rose-200 bg-rose-50/70 p-5 text-sm text-rose-900">
                  Não foi possível carregar a lista de clínicas agora. Atualize a página e tente novamente.
                </Card>
              )}

              {isLoading && (
                <div className="space-y-3" aria-label="A carregar clínicas" aria-busy="true">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-36 animate-pulse rounded-2xl border border-border/60 bg-white/70" />
                  ))}
                </div>
              )}

              {!isLoading && !isError && filteredClinics.length === 0 && (
                <Card className="rounded-2xl border-dashed bg-white/65 p-8 text-center">
                  <SearchX className="mx-auto size-8 text-primary/70" aria-hidden="true" />
                  <p className="mt-4 font-semibold text-foreground">Nenhuma clínica encontrada</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Tente pesquisar com outro nome ou limpe a pesquisa para ver toda a rede.
                  </p>
                  <Button variant="outline" className="mt-5 rounded-full" onClick={() => setSearchQuery("")}>
                    Limpar pesquisa
                  </Button>
                </Card>
              )}

              {!isLoading && filteredClinics.map((clinic: any) => (
                <Card key={clinic.id} className="group rounded-2xl border-white/80 bg-white/85 p-2 shadow-[0_10px_32px_rgba(29,80,82,0.07)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(29,80,82,0.13)]">
                  <button
                    type="button"
                    className="w-full rounded-xl p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:p-4"
                    onClick={() => navigate(`/clinic/${clinic.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="truncate font-semibold text-foreground">{clinic.name}</h4>
                          {clinic.isVerified && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                              <CheckCircle2 className="size-3" aria-hidden="true" />
                              Verificada
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
                          <span className="truncate">{clinic.city || "Localização não informada"}</span>
                        </div>
                      </div>
                      <ArrowRight className="mt-1 size-4 shrink-0 text-primary transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </div>

                    <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
                      {clinic.phone && (
                        <span className="flex items-center gap-2 truncate">
                          <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                          {clinic.phone}
                        </span>
                      )}
                      {clinic.email && (
                        <span className="flex items-center gap-2 truncate">
                          <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                          {clinic.email}
                        </span>
                      )}
                    </div>

                    {clinic.averageRating && clinic.averageRating > 0 ? (
                      <div className="mt-4 flex items-center gap-2 border-t border-border/60 pt-3 text-xs">
                        <span className="flex items-center gap-0.5" aria-label={`Avaliação ${Number(clinic.averageRating).toFixed(1)} de 5`}>
                          {[...Array(5)].map((_, index: number) => (
                            <Star
                              key={index}
                              className={`size-3.5 ${index < Math.round(clinic.averageRating || 0) ? "fill-amber-400 text-amber-400" : "text-border"}`}
                              aria-hidden="true"
                            />
                          ))}
                        </span>
                        <span className="font-semibold text-foreground">{Number(clinic.averageRating).toFixed(1)}</span>
                        <span className="text-muted-foreground">({clinic.totalRatings || 0} avaliações)</span>
                      </div>
                    ) : (
                      <div className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                        Ainda sem avaliações
                      </div>
                    )}
                  </button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="como-funciona" className="border-y border-white/80 bg-white/55">
          <div className="container py-14 sm:py-20">
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-primary">Como funciona</p>
              <h2 className="display-font text-2xl font-semibold text-foreground sm:text-3xl">Uma experiência pensada para reduzir dúvidas.</h2>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { icon: Search, title: "Pesquise", text: "Encontre uma clínica pelo nome, sem filtros desnecessários." },
                { icon: Navigation, title: "Compare", text: "Veja localização, contactos, avaliações e verificação." },
                { icon: CalendarDays, title: "Avance", text: "Abra o perfil e agende quando estiver pronto." },
              ].map(({ icon: Icon, title, text }, index) => (
                <Card key={title} className="rounded-2xl border-white/80 bg-white/80 p-5 shadow-none">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <p className="mt-5 text-base font-semibold text-foreground">0{index + 1}. {title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="container flex flex-col gap-3 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>Clínicas Próximas · Informação clara para decisões de saúde.</p>
        <p className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-primary" aria-hidden="true" /> Acesso público sem login obrigatório</p>
      </footer>
    </div>
  );
}
