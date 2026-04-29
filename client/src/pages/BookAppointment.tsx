import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useParams } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function BookAppointment() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const clinicId = id ? parseInt(id) : 0;

  const [formData, setFormData] = useState({
    appointmentDate: "",
    startTime: "",
    patientName: user?.name || "",
    patientEmail: user?.email || "",
    patientPhone: "",
    notes: "",
  });

  const clinicQuery = trpc.clinics.getById.useQuery({ id: clinicId });
  const createAppointmentMutation = trpc.appointments.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Você precisa estar autenticado para agendar");
      return;
    }

    if (!formData.appointmentDate || !formData.startTime) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    const endTime = new Date(`2000-01-01T${formData.startTime}`);
    endTime.setMinutes(endTime.getMinutes() + 30);
    const endTimeStr = endTime.toTimeString().slice(0, 5);

    try {
      await createAppointmentMutation.mutateAsync({
        clinicId,
        appointmentDate: formData.appointmentDate,
        startTime: formData.startTime,
        endTime: endTimeStr,
        patientName: formData.patientName,
        patientEmail: formData.patientEmail,
        patientPhone: formData.patientPhone,
        notes: formData.notes,
      });

      toast.success("Agendamento realizado com sucesso!");
      setFormData({
        appointmentDate: "",
        startTime: "",
        patientName: user?.name || "",
        patientEmail: user?.email || "",
        patientPhone: "",
        notes: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Erro ao agendar consulta");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Agendamento de Consulta</h2>
          <p className="text-gray-600 mb-6">
            Você precisa estar autenticado para agendar uma consulta.
          </p>
          <Button className="w-full">Fazer Login</Button>
        </Card>
      </div>
    );
  }

  if (clinicQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  const clinic = clinicQuery.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-2">Agendar Consulta</h1>
          {clinic && (
            <p className="text-gray-600 mb-8">
              Clínica: <span className="font-semibold">{clinic.name}</span>
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Data da Consulta *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) =>
                    setFormData({ ...formData, appointmentDate: e.target.value })
                  }
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="time">Horário *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  required
                  className="mt-2"
                />
              </div>
            </div>

            {/* Patient Info */}
            <div>
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                type="text"
                value={formData.patientName}
                onChange={(e) =>
                  setFormData({ ...formData, patientName: e.target.value })
                }
                required
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.patientEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, patientEmail: e.target.value })
                  }
                  required
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.patientPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, patientPhone: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Motivo da Consulta / Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Descreva brevemente o motivo da sua consulta..."
                className="mt-2 min-h-32"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={createAppointmentMutation.isPending}
                className="flex-1"
              >
                {createAppointmentMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Agendando...
                  </>
                ) : (
                  "Agendar Consulta"
                )}
              </Button>
              <Button type="button" variant="outline" className="flex-1">
                Cancelar
              </Button>
            </div>
          </form>

          <p className="text-sm text-gray-500 mt-6">
            * Campos obrigatórios. Você receberá uma confirmação por email após o agendamento.
          </p>
        </Card>
      </div>
    </div>
  );
}
