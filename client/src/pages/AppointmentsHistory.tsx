import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarDays, Clock3, HeartHandshake, LogIn, MapPin, ShieldCheck } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

const statusLabels: Record<string, string> = {
  pending: "A aguardar confirmação",
  confirmed: "Confirmada",
  completed: "Concluída",
  cancelled: "Cancelada",
  "no-show": "Não compareceu",
};

const statusClasses: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800",
  confirmed: "bg-emerald-50 text-emerald-800",
  completed: "bg-sky-50 text-sky-800",
  cancelled: "bg-rose-50 text-rose-800",
  "no-show": "bg-slate-100 text-slate-700",
};

export default function AppointmentsHistory() {
  const { isAuthenticated, loading } = useAuth({ redirectOnUnauthenticated: false });
  const [, navigate] = useLocation();
  const appointmentsQuery = trpc.appointments.getUserAppointments.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">A verificar o seu acesso…</div>;
  }

  if (!isAuthenticated) {
    return (
      <main className="app-shell flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md rounded-3xl border-white/80 bg-white/90 p-8 text-center shadow-[0_18px_50px_rgba(29,80,82,0.1)]">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LogIn className="size-6" aria-hidden="true" />
          </span>
          <h1 className="display-font mt-6 text-2xl font-semibold text-foreground">Entre para consultar os seus agendamentos</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">O seu histórico é privado e só fica disponível depois da autenticação.</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild className="rounded-full"><a href={getLoginUrl("/appointments")}>Entrar</a></Button>
            <Button variant="outline" className="rounded-full" onClick={() => navigate("/")}>Voltar à pesquisa</Button>
          </div>
        </Card>
      </main>
    );
  }

  const appointments = appointmentsQuery.data ?? [];

  return (
    <main className="app-shell min-h-screen">
      <header className="border-b border-white/80 bg-white/85 backdrop-blur-xl">
        <div className="container flex min-h-[76px] items-center justify-between gap-4">
          <button type="button" onClick={() => navigate("/")} className="flex items-center gap-3 rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><HeartHandshake className="size-5" aria-hidden="true" /></span>
            <span className="hidden sm:block"><span className="display-font block text-sm font-semibold text-foreground">Clínicas Próximas</span><span className="block text-xs text-muted-foreground">Cuidados de confiança</span></span>
          </button>
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate("/")}>Explorar clínicas</Button>
        </div>
      </header>

      <div className="container py-12 sm:py-16">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-secondary-foreground"><ShieldCheck className="size-4 text-primary" aria-hidden="true" /> Histórico privado</div>
          <h1 className="display-font text-3xl font-semibold text-foreground sm:text-4xl">Os seus agendamentos</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">Acompanhe pedidos, confirmações e consultas concluídas num só lugar.</p>
        </div>

        {appointmentsQuery.isLoading && <div className="mt-8 space-y-4" aria-busy="true" aria-label="A carregar agendamentos">{[1, 2].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl border border-border/60 bg-white/70" />)}</div>}
        {appointmentsQuery.isError && <Card role="alert" className="mt-8 rounded-2xl border-rose-200 bg-rose-50/80 p-5 text-sm text-rose-900">Não foi possível carregar os seus agendamentos. Atualize a página e tente novamente.</Card>}
        {!appointmentsQuery.isLoading && !appointmentsQuery.isError && appointments.length === 0 && (
          <Card className="mt-8 rounded-3xl border-dashed bg-white/70 p-10 text-center"><CalendarDays className="mx-auto size-10 text-primary/70" aria-hidden="true" /><h2 className="mt-4 font-semibold text-foreground">Ainda não tem agendamentos</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">Explore as clínicas disponíveis e escolha uma data para marcar a sua primeira consulta.</p><Button className="mt-6 rounded-full" onClick={() => navigate("/")}>Encontrar uma clínica</Button></Card>
        )}

        <div className="mt-8 grid gap-4">
          {appointments.map((appointment: any) => (
            <Card key={appointment.id} className="rounded-2xl border-white/80 bg-white/90 p-5 shadow-[0_12px_34px_rgba(29,80,82,0.07)] sm:p-6">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-foreground">Consulta #{appointment.id}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[appointment.status] ?? statusClasses.pending}`}>{statusLabels[appointment.status] ?? appointment.status}</span></div>
                  <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 sm:gap-x-8"><span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-primary" aria-hidden="true" />{new Date(appointment.appointmentDate).toLocaleDateString("pt-PT")}</span><span className="inline-flex items-center gap-2"><Clock3 className="size-4 text-primary" aria-hidden="true" />{appointment.startTime} — {appointment.endTime}</span></div>
                </div>
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => navigate(`/clinic/${appointment.clinicId}`)}><MapPin className="mr-2 size-4" aria-hidden="true" />Ver clínica</Button>
              </div>
              {appointment.notes && <p className="mt-5 border-t border-border/60 pt-4 text-sm leading-6 text-muted-foreground">{appointment.notes}</p>}
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
