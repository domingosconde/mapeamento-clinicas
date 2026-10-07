import nodemailer from "nodemailer";
import { ENV } from "./_core/env";

type AppointmentEmail = {
  recipient: string;
  patientName: string;
  clinicId: number;
  appointmentDate: Date;
  startTime: string;
  endTime: string;
  status: string;
};

const isConfigured = () => Boolean(ENV.smtpHost && ENV.smtpUser && ENV.smtpPassword && ENV.smtpFrom);

export function isEmailConfigured() {
  return isConfigured();
}

export async function sendAppointmentEmail(input: AppointmentEmail): Promise<boolean> {
  if (!isConfigured()) return false;

  const transport = nodemailer.createTransport({
    host: ENV.smtpHost,
    port: ENV.smtpPort,
    secure: ENV.smtpPort === 465,
    auth: { user: ENV.smtpUser, pass: ENV.smtpPassword },
  });

  const date = input.appointmentDate.toLocaleDateString("pt-PT");
  await transport.sendMail({
    from: ENV.smtpFrom,
    to: input.recipient,
    subject: `Atualização do seu agendamento — ${input.status}`,
    text: [
      `Olá ${input.patientName},`,
      "",
      `O seu agendamento da clínica ${input.clinicId} está ${input.status}.`,
      `Data: ${date}`,
      `Hora: ${input.startTime} — ${input.endTime}`,
      "",
      "Esta mensagem foi enviada automaticamente pelo sistema Clínicas Próximas.",
    ].join("\n"),
  });
  return true;
}

export function queueAppointmentEmail(input: AppointmentEmail): void {
  void sendAppointmentEmail(input).catch((error) => {
    console.warn("[Email] Appointment notification could not be delivered:", error);
  });
}
