import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Settings, LogOut, Star, MessageSquare, Tag, X, Plus, Save } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
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

type Tab = "info" | "specialties" | "comments" | "appointments";

export default function AdminDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const utils = trpc.useUtils();
  const { data: myClinic, isLoading: isClinicLoading } = trpc.clinics.getMine.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });
  const clinicId = myClinic?.id ?? 0;
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});

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

  // Fetch data
  const { data: allSpecialties = [] } = trpc.specialties.list.useQuery();
  const clinicComments: any[] = [];
  const { data: clinicRatings = [] } = trpc.ratings.getByClinic.useQuery(
    { clinicId: 1 }
  );
  const appointments: any[] = [];

  // Mutations
  const updateClinic = trpc.clinics.update.useMutation({
    onSuccess: () => {
      toast.success("Informações atualizadas com sucesso!");
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
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
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const updateAppointmentStatus = trpc.appointments.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status do agendamento atualizado!");
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

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
          {(["info", "specialties", "comments", "appointments"] as Tab[]).map((tab) => (
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
                        <p className="text-slate-700">{c.text}</p>
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
                <h2 className="text-xl font-semibold text-slate-900">Agendamentos</h2>
                <div className="space-y-3">
                  {appointments.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">Nenhum agendamento</p>
                  ) : (
                    appointments.map((a: any) => (
                      <div key={a.id} className="border border-slate-100 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{a.patientName}</p>
                            <p className="text-sm text-slate-600">{new Date(a.appointmentDate).toLocaleDateString("pt-BR")} às {a.appointmentTime}</p>
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
