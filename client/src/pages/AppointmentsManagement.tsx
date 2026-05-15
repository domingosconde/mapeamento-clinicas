import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Calendar, Clock, User, Mail, Phone } from "lucide-react";

export default function AppointmentsManagement() {
  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const appointmentsQuery = trpc.appointments.getClinicAppointments.useQuery(
    { clinicId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  const updateStatusMutation = trpc.appointments.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!");
      appointmentsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });

  const handleStatusUpdate = (appointmentId: number, status: string) => {
    updateStatusMutation.mutate({
      appointmentId,
      status: status as any,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no-show":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "confirmed":
        return "Confirmado";
      case "completed":
        return "Concluído";
      case "cancelled":
        return "Cancelado";
      case "no-show":
        return "Não Compareceu";
      default:
        return status;
    }
  };

  if (appointmentsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  const appointments = appointmentsQuery.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gerenciamento de Agendamentos</h2>
        <p className="text-gray-600">
          {appointments.length} agendamento(s) total
        </p>
      </div>

      {appointments.length === 0 ? (
        <Card className="p-8 text-center">
          <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Nenhum agendamento ainda</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment: any) => (
            <Card key={appointment.id} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column - Patient Info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {appointment.patientName}
                      </h3>
                      <Badge className={getStatusColor(appointment.status)}>
                        {getStatusLabel(appointment.status)}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{appointment.patientEmail}</span>
                    </div>
                    {appointment.patientPhone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{appointment.patientPhone}</span>
                      </div>
                    )}
                  </div>

                  {appointment.notes && (
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <p className="font-semibold text-gray-700 mb-1">
                        Observações:
                      </p>
                      <p className="text-gray-600">{appointment.notes}</p>
                    </div>
                  )}
                </div>

                {/* Right Column - Date/Time and Actions */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="w-4 h-4" />
                    <span className="font-semibold">
                      {new Date(appointment.appointmentDate).toLocaleDateString(
                        "pt-BR"
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4" />
                    <span>
                      {appointment.startTime} - {appointment.endTime}
                    </span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {appointment.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleStatusUpdate(appointment.id, "confirmed")
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleStatusUpdate(appointment.id, "cancelled")
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          Cancelar
                        </Button>
                      </>
                    )}

                    {appointment.status === "confirmed" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleStatusUpdate(appointment.id, "completed")
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          Marcar como Concluído
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleStatusUpdate(appointment.id, "no-show")
                          }
                          disabled={updateStatusMutation.isPending}
                        >
                          Não Compareceu
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
