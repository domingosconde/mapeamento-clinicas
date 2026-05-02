import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Settings, Plus, Users, Building2 } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Setup() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"clinics" | "admins">("clinics");
  const [clinicForm, setClinicForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    website: "",
    latitude: "",
    longitude: "",
    openingHours: "",
  });

  const [adminEmail, setAdminEmail] = useState("");

  // Mutations
  const createClinic = trpc.system.createClinic.useMutation({
    onSuccess: () => {
      toast.success("Clínica criada com sucesso!");
      setClinicForm({
        name: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        phone: "",
        email: "",
        website: "",
        latitude: "",
        longitude: "",
        openingHours: "",
      });
    },
    onError: (e: any) => toast.error(`Erro: ${e.message}`),
  });

  const promoteAdmin = trpc.system.promoteToAdmin.useMutation({
    onSuccess: () => {
      toast.success("Usuário promovido a admin!");
      setAdminEmail("");
    },
    onError: (e: any) => toast.error(`Erro: ${e.message}`),
  });

  const handleCreateClinic = async () => {
    if (!clinicForm.name || !clinicForm.address) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const lat = parseFloat(clinicForm.latitude);
    const lng = parseFloat(clinicForm.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Latitude e longitude devem ser números válidos");
      return;
    }

    await createClinic.mutateAsync({
      name: clinicForm.name,
      address: clinicForm.address,
      city: clinicForm.city,
      state: clinicForm.state,
      zipCode: clinicForm.zipCode,
      phone: clinicForm.phone,
      email: clinicForm.email,
      website: clinicForm.website,
      latitude: lat.toString(),
      longitude: lng.toString(),
      openingHours: clinicForm.openingHours,
    });
  };

  const handlePromoteAdmin = async () => {
    if (!adminEmail) {
      toast.error("Digite um email válido");
      return;
    }

    await promoteAdmin.mutateAsync({ email: adminEmail });
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Acesso Restrito</h2>
          <p className="text-slate-600 mb-6">Apenas administradores podem acessar esta área de setup.</p>
          <Button asChild>
            <a href={getLoginUrl()}>Entrar como Admin</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">Setup do Sistema</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("clinics")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "clinics"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Clínicas
          </button>
          <button
            onClick={() => setActiveTab("admins")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "admins"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            Administradores
          </button>
        </div>

        {/* Clinics Tab */}
        {activeTab === "clinics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Adicionar Nova Clínica
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nome da Clínica *
                  </label>
                  <Input
                    placeholder="Ex: Clínica Central"
                    value={clinicForm.name}
                    onChange={(e) =>
                      setClinicForm({ ...clinicForm, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Endereço *
                  </label>
                  <Input
                    placeholder="Ex: Rua Principal, 123"
                    value={clinicForm.address}
                    onChange={(e) =>
                      setClinicForm({ ...clinicForm, address: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Cidade
                    </label>
                    <Input
                      placeholder="Ex: São Paulo"
                      value={clinicForm.city}
                      onChange={(e) =>
                        setClinicForm({ ...clinicForm, city: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Estado
                    </label>
                    <Input
                      placeholder="Ex: SP"
                      value={clinicForm.state}
                      onChange={(e) =>
                        setClinicForm({ ...clinicForm, state: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    CEP
                  </label>
                  <Input
                    placeholder="Ex: 01310-100"
                    value={clinicForm.zipCode}
                    onChange={(e) =>
                      setClinicForm({ ...clinicForm, zipCode: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Telefone
                  </label>
                  <Input
                    placeholder="Ex: (11) 3000-0000"
                    value={clinicForm.phone}
                    onChange={(e) =>
                      setClinicForm({ ...clinicForm, phone: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <Input
                    placeholder="Ex: contato@clinica.com"
                    value={clinicForm.email}
                    onChange={(e) =>
                      setClinicForm({ ...clinicForm, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Website
                  </label>
                  <Input
                    placeholder="Ex: www.clinica.com"
                    value={clinicForm.website}
                    onChange={(e) =>
                      setClinicForm({ ...clinicForm, website: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Latitude *
                    </label>
                    <Input
                      placeholder="Ex: -23.5505"
                      value={clinicForm.latitude}
                      onChange={(e) =>
                        setClinicForm({ ...clinicForm, latitude: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Longitude *
                    </label>
                    <Input
                      placeholder="Ex: -46.6333"
                      value={clinicForm.longitude}
                      onChange={(e) =>
                        setClinicForm({ ...clinicForm, longitude: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Horários de Funcionamento (JSON)
                  </label>
                  <Textarea
                    placeholder='Ex: {"monday": "09:00-18:00", "tuesday": "09:00-18:00"}'
                    value={clinicForm.openingHours}
                    onChange={(e) =>
                      setClinicForm({ ...clinicForm, openingHours: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleCreateClinic}
                  disabled={createClinic.isPending}
                  className="w-full"
                >
                  {createClinic.isPending ? "Criando..." : "Criar Clínica"}
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-blue-50">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Instruções</h3>
              <div className="space-y-3 text-sm text-slate-700">
                <p>
                  <strong>Latitude e Longitude:</strong> Use coordenadas decimais. Você pode obter
                  coordenadas em{" "}
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Google Maps
                  </a>
                  .
                </p>
                <p>
                  <strong>Horários:</strong> Use formato JSON com dias da semana em inglês (monday,
                  tuesday, etc.) e horários em formato HH:MM-HH:MM.
                </p>
                <p>
                  <strong>Exemplo de Coordenadas:</strong>
                  <br />
                  Latitude: -23.5505
                  <br />
                  Longitude: -46.6333
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Admins Tab */}
        {activeTab === "admins" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Promover Usuário a Admin
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email do Usuário *
                  </label>
                  <Input
                    placeholder="Ex: usuario@email.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                  />
                </div>

                <p className="text-sm text-slate-600">
                  O usuário deve fazer login pelo menos uma vez antes de ser promovido a admin.
                </p>

                <Button
                  onClick={handlePromoteAdmin}
                  disabled={promoteAdmin.isPending}
                  className="w-full"
                >
                  {promoteAdmin.isPending ? "Promovendo..." : "Promover a Admin"}
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-green-50">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Informações</h3>
              <div className="space-y-3 text-sm text-slate-700">
                <p>
                  <strong>Proprietário Automático:</strong> O proprietário do projeto se torna
                  automaticamente admin na primeira autenticação.
                </p>
                <p>
                  <strong>Admins Adicionais:</strong> Use esta página para promover outros usuários
                  a administradores.
                </p>
                <p>
                  <strong>Permissões de Admin:</strong>
                  <ul className="list-disc list-inside mt-2">
                    <li>Acessar dashboard administrativo</li>
                    <li>Criar e editar clínicas</li>
                    <li>Gerenciar especialidades</li>
                    <li>Responder comentários</li>
                    <li>Gerenciar agendamentos</li>
                  </ul>
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
