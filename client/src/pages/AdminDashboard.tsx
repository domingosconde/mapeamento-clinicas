import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Settings, LogOut, Star, MessageSquare, Tag, X, Plus, Save, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

type Tab = "info" | "specialties" | "comments";

export default function AdminDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});
  const utils = trpc.useUtils();

  // Form state for clinic info
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

  // Fetch admin's clinic
  const { data: clinic, isLoading: clinicLoading, refetch: refetchClinic } = trpc.clinics.getMyClinic.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  // Fetch specialties
  const { data: allSpecialties = [] } = trpc.specialties.list.useQuery();
  const { data: clinicSpecialties = [], refetch: refetchSpecialties } = trpc.clinics.getSpecialties.useQuery(
    { clinicId: clinic?.id ?? 0 },
    { enabled: !!clinic?.id }
  );

  // Fetch comments and responses
  const { data: clinicComments = [], refetch: refetchComments } = trpc.comments.getByClinic.useQuery(
    { clinicId: clinic?.id ?? 0 },
    { enabled: !!clinic?.id }
  );
  const { data: clinicResponses = [], refetch: refetchResponses } = trpc.comments.getResponsesForClinic.useQuery(
    { clinicId: clinic?.id ?? 0 },
    { enabled: !!clinic?.id }
  );
  const { data: clinicRatings = [] } = trpc.ratings.getByClinic.useQuery(
    { clinicId: clinic?.id ?? 0 },
    { enabled: !!clinic?.id }
  );

  // Populate form when clinic loads
  useEffect(() => {
    if (clinic) {
      setForm({
        name: clinic.name ?? "",
        description: clinic.description ?? "",
        phone: clinic.phone ?? "",
        email: clinic.email ?? "",
        website: clinic.website ?? "",
        address: clinic.address ?? "",
        city: clinic.city ?? "",
        state: clinic.state ?? "",
        zipCode: clinic.zipCode ?? "",
        openingHours: clinic.openingHours ?? "",
      });
    }
  }, [clinic]);

  // Mutations
  const updateClinic = trpc.clinics.update.useMutation({
    onSuccess: () => {
      refetchClinic();
      toast.success("Informações atualizadas com sucesso!");
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const addSpecialty = trpc.clinics.addSpecialty.useMutation({
    onSuccess: () => {
      refetchSpecialties();
      toast.success("Especialidade adicionada!");
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const removeSpecialty = trpc.clinics.removeSpecialty.useMutation({
    onSuccess: () => {
      refetchSpecialties();
      toast.success("Especialidade removida!");
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const replyToComment = trpc.comments.reply.useMutation({
    onSuccess: (_, vars) => {
      refetchResponses();
      setReplyTexts((prev) => ({ ...prev, [vars.commentId]: "" }));
      toast.success("Resposta enviada!");
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  // Derived stats
  const avgRating =
    clinicRatings.length > 0
      ? clinicRatings.reduce((s: number, r: any) => s + r.score, 0) / clinicRatings.length
      : 0;
  const responsesByCommentId = clinicResponses.reduce((acc: Record<number, any[]>, r: any) => {
    if (!acc[r.commentId]) acc[r.commentId] = [];
    acc[r.commentId].push(r);
    return acc;
  }, {});
  const clinicSpecialtyIds = new Set(clinicSpecialties.map((s: any) => s.specialties?.id ?? s.specialtyId));

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

  if (clinicLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-slate-900 mb-3">Nenhuma clínica associada</h2>
          <p className="text-slate-600">Sua conta de admin ainda não está vinculada a uma clínica.</p>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: "info" as Tab, label: "Informações", icon: Settings },
    { id: "specialties" as Tab, label: "Especialidades", icon: Tag },
    { id: "comments" as Tab, label: `Comentários (${clinicComments.length})`, icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">Painel Administrativo</h1>
            <span className="text-sm text-slate-500 hidden sm:inline">— {clinic.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 hidden sm:inline">{user?.name}</span>
            <Button variant="outline" size="sm" onClick={() => logout()} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-5 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {avgRating > 0 ? avgRating.toFixed(1) : "–"}
            </div>
            <p className="text-sm text-slate-500 mt-1">Avaliação Média</p>
            <div className="flex justify-center gap-0.5 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-slate-200"}`} />
              ))}
            </div>
          </Card>
          <Card className="p-5 text-center">
            <div className="text-3xl font-bold text-blue-600">{clinicRatings.length}</div>
            <p className="text-sm text-slate-500 mt-1">Avaliações Recebidas</p>
          </Card>
          <Card className="p-5 text-center">
            <div className="text-3xl font-bold text-blue-600">{clinicComments.length}</div>
            <p className="text-sm text-slate-500 mt-1">Comentários</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar tabs */}
          <div className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeTab === id ? "default" : "ghost"}
                className="w-full justify-start gap-2"
                onClick={() => setActiveTab(id)}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            ))}
          </div>

          {/* Main Panel */}
          <div className="lg:col-span-3">
            {/* --- TAB: Info --- */}
            {activeTab === "info" && (
              <Card className="p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Informações da Clínica</h2>
                  <p className="text-sm text-slate-500">Atualize os dados para que pacientes encontrem informações precisas.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Clínica *</label>
                    <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nome da clínica" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Descreva sua clínica, especialidades e diferenciais..."
                      className="min-h-28"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                      <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+244 900 000 000" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <Input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="contato@clinica.ao" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                    <Input value={form.website} onChange={(e) => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://www.clinica.ao" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
                    <Input value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Rua, número, bairro" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                      <Input value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Luanda" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Província</label>
                      <Input value={form.state} onChange={(e) => setForm(f => ({ ...f, state: e.target.value }))} placeholder="Luanda" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">CEP</label>
                      <Input value={form.zipCode} onChange={(e) => setForm(f => ({ ...f, zipCode: e.target.value }))} placeholder="0000" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Horário de Funcionamento</label>
                    <Textarea
                      value={form.openingHours}
                      onChange={(e) => setForm(f => ({ ...f, openingHours: e.target.value }))}
                      placeholder={'{"Segunda-Sexta": "08:00–18:00", "Sábado": "08:00–12:00", "Domingo": "Fechado"}'}
                      className="min-h-20 font-mono text-sm"
                    />
                    <p className="text-xs text-slate-400 mt-1">Formato JSON recomendado: {`{"Segunda-Sexta": "08:00–18:00"}`}</p>
                  </div>

                  <Button
                    className="w-full gap-2"
                    onClick={() => updateClinic.mutate({ id: clinic.id, ...form })}
                    disabled={updateClinic.isPending}
                  >
                    {updateClinic.isPending ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Salvando...</>
                    ) : (
                      <><Save className="w-4 h-4" /> Salvar Alterações</>
                    )}
                  </Button>
                </div>
              </Card>
            )}

            {/* --- TAB: Specialties --- */}
            {activeTab === "specialties" && (
              <Card className="p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Especialidades</h2>
                  <p className="text-sm text-slate-500">Gerencie as especialidades médicas oferecidas pela sua clínica.</p>
                </div>

                {/* Current specialties */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Especialidades Actuais</h3>
                  {clinicSpecialties.length === 0 ? (
                    <p className="text-sm text-slate-400">Nenhuma especialidade cadastrada.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {clinicSpecialties.map((s: any) => {
                        const spec = s.specialties;
                        return (
                          <span
                            key={spec.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-sm font-medium"
                          >
                            {spec.name}
                            <button
                              onClick={() => removeSpecialty.mutate({ clinicId: clinic.id, specialtyId: spec.id })}
                              className="ml-1 text-blue-400 hover:text-red-500 transition-colors"
                              title="Remover"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Add specialties */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Adicionar Especialidade</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {allSpecialties
                      .filter((s: any) => !clinicSpecialtyIds.has(s.id))
                      .map((s: any) => (
                        <button
                          key={s.id}
                          onClick={() => addSpecialty.mutate({ clinicId: clinic.id, specialtyId: s.id })}
                          disabled={addSpecialty.isPending}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-sm text-slate-700 transition-colors text-left"
                        >
                          <Plus className="w-4 h-4 text-slate-400" />
                          {s.name}
                        </button>
                      ))}
                    {allSpecialties.filter((s: any) => !clinicSpecialtyIds.has(s.id)).length === 0 && (
                      <p className="text-sm text-slate-400">Todas as especialidades já foram adicionadas.</p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* --- TAB: Comments --- */}
            {activeTab === "comments" && (
              <Card className="p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-1">Comentários de Pacientes</h2>
                  <p className="text-sm text-slate-500">Responda aos comentários dos seus pacientes.</p>
                </div>

                {clinicComments.length === 0 ? (
                  <p className="text-center text-slate-400 py-12">Nenhum comentário ainda.</p>
                ) : (
                  <div className="space-y-6">
                    {clinicComments.map((c: any) => {
                      const replies = responsesByCommentId[c.id] || [];
                      const alreadyReplied = replies.length > 0;
                      return (
                        <div key={c.id} className="border border-slate-100 rounded-xl p-5 space-y-4">
                          {/* Comment */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium text-slate-900 text-sm">{c.userName || "Paciente"}</p>
                              <p className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString("pt-BR")}</p>
                            </div>
                          </div>
                          <p className="text-slate-700">{c.text}</p>

                          {/* Existing replies */}
                          {replies.map((r: any) => (
                            <div key={r.id} className="ml-2 p-3 bg-blue-50 border-l-2 border-blue-400 rounded-r-lg">
                              <p className="text-xs font-semibold text-blue-700 mb-1">Sua resposta</p>
                              <p className="text-sm text-slate-700">{r.text}</p>
                            </div>
                          ))}

                          {/* Reply form */}
                          {!alreadyReplied && (
                            <div className="space-y-2">
                              <Textarea
                                placeholder="Escreva sua resposta..."
                                value={replyTexts[c.id] ?? ""}
                                onChange={(e) => setReplyTexts(prev => ({ ...prev, [c.id]: e.target.value }))}
                                className="min-h-20 text-sm"
                              />
                              <Button
                                size="sm"
                                onClick={() =>
                                  replyToComment.mutate({
                                    commentId: c.id,
                                    clinicId: clinic.id,
                                    text: replyTexts[c.id] ?? "",
                                  })
                                }
                                disabled={replyToComment.isPending || !replyTexts[c.id]?.trim()}
                                className="gap-1"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Responder
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
