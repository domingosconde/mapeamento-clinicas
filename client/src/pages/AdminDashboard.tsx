import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Settings, LogOut, Star, MessageSquare } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { getLoginUrl } from "@/const";

export default function AdminDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [clinicName, setClinicName] = useState("");
  const [clinicDescription, setClinicDescription] = useState("");
  const [clinicPhone, setClinicPhone] = useState("");
  const [clinicEmail, setClinicEmail] = useState("");

  // Check if user is admin
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Acesso Restrito</h2>
          <p className="text-slate-600 mb-6">
            Apenas administradores de clínicas podem acessar esta área.
          </p>
          <Button asChild>
            <a href={getLoginUrl()}>Entrar como Admin</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">Painel Administrativo</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout()}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Navigation */}
          <div className="space-y-2">
            <Button variant="default" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Informações da Clínica
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Star className="w-4 h-4 mr-2" />
              Avaliações
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="w-4 h-4 mr-2" />
              Comentários
            </Button>
          </div>

          {/* Main Panel */}
          <div className="lg:col-span-2 space-y-8">
            {/* Clinic Information Section */}
            <Card className="p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Informações da Clínica
                </h2>
                <p className="text-slate-600">
                  Atualize os dados da sua clínica para que os pacientes encontrem informações precisas
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Nome da Clínica
                  </label>
                  <Input
                    type="text"
                    placeholder="Nome da sua clínica"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Descrição
                  </label>
                  <Textarea
                    placeholder="Descreva sua clínica, especialidades e diferenciais..."
                    value={clinicDescription}
                    onChange={(e) => setClinicDescription(e.target.value)}
                    className="min-h-24"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Telefone
                    </label>
                    <Input
                      type="tel"
                      placeholder="(XX) XXXXX-XXXX"
                      value={clinicPhone}
                      onChange={(e) => setClinicPhone(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="contato@clinica.com"
                      value={clinicEmail}
                      onChange={(e) => setClinicEmail(e.target.value)}
                    />
                  </div>
                </div>

                <Button className="w-full">Salvar Alterações</Button>
              </div>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">4.8</div>
                <p className="text-sm text-slate-600">Avaliação Média</p>
              </Card>

              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">24</div>
                <p className="text-sm text-slate-600">Avaliações Recebidas</p>
              </Card>

              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">12</div>
                <p className="text-sm text-slate-600">Comentários Pendentes</p>
              </Card>
            </div>

            {/* Recent Comments */}
            <Card className="p-8 space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Comentários Recentes</h3>

              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-slate-900">Paciente {i}</p>
                        <p className="text-sm text-slate-600">Há 2 dias</p>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, j: number) => (
                          <Star
                            key={j}
                            className="w-4 h-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 mb-3">
                      Ótima experiência! Equipe muito atenciosa e profissional.
                    </p>
                    <Button variant="outline" size="sm">
                      Responder
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
