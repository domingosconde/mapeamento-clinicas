import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Users, Stethoscope, Lock } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Welcome() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900">Clínicas Próximas</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-slate-900 mb-4">
            Encontre as Melhores Clínicas
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Busque, avalie e agende consultas com os melhores profissionais de saúde
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Visitor Option */}
          <Card className="p-8 border-2 border-slate-200 hover:border-blue-400 transition-colors">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-100 p-4 rounded-full">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3 text-center">
              Visitante
            </h3>
            <p className="text-slate-600 text-center mb-6">
              Explore clínicas, veja avaliações e comentários sem criar conta
            </p>
            <div className="space-y-2 mb-8 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Ver mapa interativo
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Buscar por especialidade
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Ver perfis e avaliações
              </p>
              <p className="flex items-center gap-2">
                <span className="text-gray-400">✗</span> Deixar avaliações
              </p>
              <p className="flex items-center gap-2">
                <span className="text-gray-400">✗</span> Agendar consultas
              </p>
            </div>
            <Button
              onClick={() => navigate("/")}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Continuar como Visitante
            </Button>
          </Card>

          {/* Patient Option */}
          <Card className="p-8 border-2 border-slate-200 hover:border-green-400 transition-colors">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3 text-center">
              Paciente
            </h3>
            <p className="text-slate-600 text-center mb-6">
              Crie conta para avaliar, comentar e agendar consultas
            </p>
            <div className="space-y-2 mb-8 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Tudo do visitante
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Deixar avaliações
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Deixar comentários
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Agendar consultas
              </p>
              <p className="flex items-center gap-2">
                <span className="text-gray-400">✗</span> Gerenciar clínica
              </p>
            </div>
            <Button
              asChild
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <a href={getLoginUrl()}>Entrar como Paciente</a>
            </Button>
          </Card>

          {/* Admin Option */}
          <Card className="p-8 border-2 border-slate-200 hover:border-purple-400 transition-colors">
            <div className="flex justify-center mb-6">
              <div className="bg-purple-100 p-4 rounded-full">
                <Stethoscope className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3 text-center">
              Administrador
            </h3>
            <p className="text-slate-600 text-center mb-6">
              Gerencie sua clínica, agendamentos e especialidades
            </p>
            <div className="space-y-2 mb-8 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Tudo do paciente
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Dashboard admin
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Criar clínicas
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Gerenciar agendamentos
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-600">✓</span> Verificar clínicas
              </p>
            </div>
            <Button
              asChild
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <a href={getLoginUrl()}>Entrar como Admin</a>
            </Button>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="p-8 bg-blue-50 border-blue-200">
          <div className="flex gap-4">
            <Lock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-slate-900 mb-2">Segurança e Privacidade</h4>
              <p className="text-slate-600">
                Seus dados são protegidos com segurança de nível empresarial. Usamos autenticação OAuth segura
                e não compartilhamos suas informações com terceiros.
              </p>
            </div>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-16 py-8 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-600">
          <p>© 2026 Clínicas Próximas. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
