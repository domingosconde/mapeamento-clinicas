import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { LogOut, Star, MessageSquare, Plus, Save, CheckCircle2, EyeOff, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { queryCache } from "@/lib/queryCache";
import { useEffect, useState } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import PhotoUploader from "@/components/PhotoUploader";

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.split(",", 2)[1] ?? result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Não foi possível ler a imagem."));
    reader.readAsDataURL(file);
  });

type Tab = "info" | "specialties" | "professionals" | "comments" | "appointments";

export default function AdminDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const utils = trpc.useUtils();
  const { data: myClinic, isLoading: isClinicLoading } = trpc.clinics.getMine.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
    ...queryCache.privateDetail,
  });
  const clinicId = myClinic?.id ?? 0;
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});
  const [professionalForm, setProfessionalForm] = useState({ name: "", specialty: "", bio: "", licenseNumber: "" });

  const [form, setForm] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    openingHours: "",
  });

  useEffect(() => {
    if (!myClinic) return;
    setForm({
      name: myClinic.name ?? "",
      description: myClinic.description ?? "",
      phone: myClinic.phone ?? "",
      email: myClinic.email ?? "",
      website: myClinic.website ?? "",
      address: myClinic.address ?? "",
      city: myClinic.city ?? "",
      state: myClinic.state ?? "",
      zipCode: myClinic.zipCode ?? "",
      openingHours: myClinic.openingHours ?? "",
    });
  }, [myClinic]);

  // Fetch data
  const { data: allSpecialties = [] } = trpc.specialties.list.useQuery(undefined, queryCache.publicList);
  const { data: professionals = [] } = trpc.professionals.getByClinic.useQuery(
    { clinicId },
    { enabled: clinicId > 0, ...queryCache.privateList },
  );
  const { data: clinicComments = [], refetch: refetchComments } = trpc.comments.getForModeration.useQuery(
    { clinicId },
    { enabled: clinicId > 0, ...queryCache.privateList },
  );
  const { data: clinicRatings = [] } = trpc.ratings.getByClinic.useQuery(
    { clinicId },
    { enabled: clinicId > 0, ...queryCache.publicList },
  );
  const appointmentsQuery = trpc.appointments.getClinicAppointments.useQuery(
    { clinicId },
    { enabled: clinicId > 0, ...queryCache.privateList },
  );
  const appointments = appointmentsQuery.data ?? [];

  // Mutations
  const updateClinic = trpc.clinics.update.useMutation({
    onSuccess: () => {
      toast.success("Informações atualizadas com sucesso!");
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const createProfessional = trpc.professionals.create.useMutation({
    onSuccess: () => {
      toast.success("Profissional adicionado com sucesso!");
      setProfessionalForm({ name: "", specialty: "", bio: "", licenseNumber: "" });
      utils.professionals.getByClinic.invalidate({ clinicId });
    },
    onError: (e) => toast.error(`Erro ao adicionar profissional: ${e.message}`),
  });

  const uploadPhoto = trpc.clinics.uploadPhoto.useMutation({
    onSuccess: async () => {
      await utils.clinics.getMine.invalidate();
      toast.success("Foto da clínica atualizada com sucesso!");
    },
    onError: (e) => toast.error(`Erro ao enviar foto: ${e.message}`),
  });

  const handlePhotoUpload = async (file: File) => {
    const base64 = await fileToBase64(file);
    if (!clinicId) {
      throw new Error("A sua clínica ainda não está configurada.");
    }
    await uploadPhoto.mutateAsync({
      clinicId,
      fileName: file.name,
      contentType: file.type as "image/jpeg" | "image/png" | "image/webp",
      base64,
    });
  };

  const replyToComment = trpc.comments.reply.useMutation({
    onSuccess: () => {
      toast.success("Resposta enviada com sucesso!");
      setReplyTexts({});
      refetchComments();
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const setCommentApproval = trpc.comments.setApproval.useMutation({
    onSuccess: ({ isApproved }) => {
      toast.success(isApproved ? "Comentário aprovado." : "Comentário ocultado.");
      refetchComments();
      utils.comments.getByClinic.invalidate({ clinicId });
    },
    onError: (e) => toast.error(`Erro ao moderar comentário: ${e.message}`),
  });

  const updateAppointmentStatus = trpc.appointments.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status do agendamento atualizado!");
      appointmentsQuery.refetch();
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const sendReminders = trpc.appointments.sendReminders.useMutation({
    onSuccess: ({ sent }) => toast.success(sent ? `${sent} lembrete(s) processado(s).` : "Não há consultas próximas para lembrar."),
    onError: (e) => toast.error(`Erro ao processar lembretes: ${e.message}`),
  });

  const downloadAppointmentsReport = () => {
    const headers = ["Paciente", "Email", "Data", "Início", "Fim", "Estado"];
    const rows = appointments.map((appointment: any) => [
      appointment.patientName,
      appointment.patientEmail,
      new Date(appointment.appointmentDate).toLocaleDateString("pt-PT"),
      appointment.startTime,
      appointment.endTime,
      appointment.status,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    link.download = `agendamentos-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Acesso Restrito</h2>
          <p className="text-slate-600 mb-6">Apenas administradores de clínicas podem acessar esta área.</p>
          <Button asChild><a href={getLoginUrl()}>Entrar como Admin</a></Button>
        </Card>
      </div>
    );
  }

  const avgRating = clinicRatings.length > 0
    ? clinicRatings.reduce((s: number, r: any) => s + r.score, 0) / clinicRatings.length
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard Administrativo</h1>
            <p className="text-sm text-slate-600">Gerencie sua clínica</p>
          </div>
          <Button variant="outline" size="sm" onClick={logout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-200">
          {(["info", "specialties", "professionals", "comments", "appointments"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab === "info" && "Informações"}
              {tab === "specialties" && "Especialidades"}
              {tab === "professionals" && "Profissionais"}
              {tab === "comments" && "Comentários"}
              {tab === "appointments" && "Agendamentos"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "info" && (
              <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold text-slate-900">Informações da Clínica</h2>
                <div className="space-y-3">
                  <Input placeholder="Nome" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
                  <Textarea placeholder="Descrição" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
                  <Input placeholder="Telefone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
                  <Input placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
                  <Input placeholder="Website" value={form.website} onChange={(e) => setForm({...form, website: e.target.value})} />
                  <Input placeholder="Endereço" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input placeholder="Cidade" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} />
                    <Input placeholder="Estado" value={form.state} onChange={(e) => setForm({...form, state: e.target.value})} />
                  </div>
                  <Input placeholder="CEP" value={form.zipCode} onChange={(e) => setForm({...form, zipCode: e.target.value})} />
                  <Textarea placeholder="Horários de funcionamento (JSON)" value={form.openingHours} onChange={(e) => setForm({...form, openingHours: e.target.value})} />
                  {myClinic && <PhotoUploader onUpload={handlePhotoUpload} isLoading={uploadPhoto.isPending} preview={myClinic.photoUrl ?? undefined} />}
                  <Button onClick={() => updateClinic.mutate({ id: clinicId, ...form })} disabled={isClinicLoading || !clinicId} className="w-full gap-2">
                    <Save className="w-4 h-4" />
                    Salvar Informações
                  </Button>
                </div>
              </Card>
            )}

            {activeTab === "specialties" && (
              <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold text-slate-900">Especialidades</h2>
                <div className="space-y-2">
                  {allSpecialties.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-700">{s.name}</span>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Plus className="w-3.5 h-3.5" />
                        Adicionar
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === "professionals" && (
              <Card className="space-y-5 p-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Profissionais de saúde</h2>
                  <p className="mt-1 text-sm text-slate-600">Adicione os profissionais que os pacientes podem conhecer e avaliar.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Nome completo" value={professionalForm.name} onChange={(e) => setProfessionalForm({ ...professionalForm, name: e.target.value })} />
                  <Input placeholder="Especialidade" value={professionalForm.specialty} onChange={(e) => setProfessionalForm({ ...professionalForm, specialty: e.target.value })} />
                  <Input placeholder="Número de licença (opcional)" value={professionalForm.licenseNumber} onChange={(e) => setProfessionalForm({ ...professionalForm, licenseNumber: e.target.value })} />
                  <Textarea placeholder="Biografia curta (opcional)" value={professionalForm.bio} onChange={(e) => setProfessionalForm({ ...professionalForm, bio: e.target.value })} className="sm:col-span-2" />
                </div>
                <Button
                  className="gap-2"
                  onClick={() => createProfessional.mutate({ clinicId, ...professionalForm })}
                  disabled={createProfessional.isPending || !clinicId || professionalForm.name.trim().length < 2 || professionalForm.specialty.trim().length < 2}
                >
                  <Plus className="h-4 w-4" /> Adicionar profissional
                </Button>
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  {professionals.length === 0 ? <p className="text-sm text-slate-500">Ainda não existem profissionais registados.</p> : professionals.map((professional: any) => (
                    <div key={professional.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                      <div>
                        <p className="font-medium text-slate-900">{professional.name}</p>
                        <p className="text-sm text-slate-500">{professional.specialty}</p>
                      </div>
                      <span className="text-sm font-semibold text-slate-600">{professional.totalRatings ?? 0} avaliações</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === "comments" && (
              <Card className="p-6 space-y-4">
                <h2 className="text-xl font-semibold text-slate-900">Comentários e Avaliações</h2>
                <div className="space-y-4">
                  {clinicComments.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">Nenhum comentário ainda</p>
                  ) : (
                    clinicComments.map((c: any) => (
                      <div key={c.id} className="border border-slate-100 rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{c.userName || "Paciente"}</p>
                            <p className="text-sm text-slate-500">{new Date(c.createdAt).toLocaleDateString("pt-BR")}</p>
                          </div>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-slate-700">{c.text}</p>
                          <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${c.isApproved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                            {c.isApproved ? "Publicado" : "Pendente"}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1"
                          onClick={() => setCommentApproval.mutate({ commentId: c.id, isApproved: !c.isApproved })}
                          disabled={setCommentApproval.isPending}
                        >
                          {c.isApproved ? <EyeOff className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          {c.isApproved ? "Ocultar" : "Aprovar"}
                        </Button>
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Escreva sua resposta..."
                            value={replyTexts[c.id] ?? ""}
                            onChange={(e) => setReplyTexts(prev => ({...prev, [c.id]: e.target.value}))}
                            className="min-h-20 text-sm"
                          />
                          <Button
                            size="sm"
                            onClick={() => replyToComment.mutate({commentId: c.id, text: replyTexts[c.id] ?? ""})}
                            disabled={replyToComment.isPending}
                            className="gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Responder
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            )}

            {activeTab === "appointments" && (
              <Card className="p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-slate-900">Agendamentos</h2>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => sendReminders.mutate({ clinicId })} disabled={sendReminders.isPending || !clinicId}>
                      Processar lembretes
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1" onClick={downloadAppointmentsReport} disabled={appointments.length === 0}>
                      <Download className="w-3.5 h-3.5" /> Exportar CSV
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  {appointments.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">Nenhum agendamento</p>
                  ) : (
                    appointments.map((a: any) => (
                      <div key={a.id} className="border border-slate-100 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{a.patientName}</p>
                            <p className="text-sm text-slate-600">{new Date(a.appointmentDate).toLocaleDateString("pt-PT")} às {a.startTime} — {a.endTime}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            a.status === "confirmed" ? "bg-green-100 text-green-700" :
                            a.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {a.status}
                          </span>
                        </div>
                        {a.status === "pending" && (
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" onClick={() => updateAppointmentStatus.mutate({appointmentId: a.id, status: "confirmed"})}>
                              Confirmar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => updateAppointmentStatus.mutate({appointmentId: a.id, status: "cancelled"})}>
                              Cancelar
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold text-slate-900">Estatísticas</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Avaliação Média</p>
                  <p className="text-2xl font-bold text-slate-900">{avgRating.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total de Avaliações</p>
                  <p className="text-2xl font-bold text-slate-900">{clinicRatings.length}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Comentários</p>
                  <p className="text-2xl font-bold text-slate-900">{clinicComments.length}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Agendamentos</p>
                  <p className="text-2xl font-bold text-slate-900">{appointments.length}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
