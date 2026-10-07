import express, { type Express, type Request, type Response } from "express";
import Stripe from "stripe";
import { ENV } from "./_core/env";
import { getAppointmentById, updateAppointmentPayment } from "./db";

const stripe = ENV.stripeSecretKey ? new Stripe(ENV.stripeSecretKey) : null;

export function isPaymentsConfigured() {
  return Boolean(stripe && ENV.appointmentFeeCents > 0);
}

function getSafeOrigin(origin: string) {
  const parsed = new URL(origin);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error("Origin must use HTTP or HTTPS.");
  return parsed.origin;
}

export async function createAppointmentCheckoutSession(input: {
  appointmentId: number;
  userId: number;
  origin: string;
}) {
  if (!stripe || ENV.appointmentFeeCents <= 0) {
    throw new Error("Pagamentos online não estão configurados para este projeto.");
  }

  const appointment = await getAppointmentById(input.appointmentId);
  if (!appointment || appointment.userId !== input.userId) {
    throw new Error("Agendamento não encontrado.");
  }

  const origin = getSafeOrigin(input.origin);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: appointment.patientEmail,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: ENV.stripeCurrency,
        unit_amount: ENV.appointmentFeeCents,
        product_data: { name: `Taxa de agendamento — Clínica ${appointment.clinicId}` },
      },
    }],
    metadata: { appointmentId: String(appointment.id), userId: String(input.userId) },
    success_url: `${origin}/appointments?payment=success&appointmentId=${appointment.id}`,
    cancel_url: `${origin}/appointments?payment=cancelled&appointmentId=${appointment.id}`,
  });

  await updateAppointmentPayment(appointment.id, "pending", session.id);
  return { url: session.url, sessionId: session.id, amountCents: ENV.appointmentFeeCents };
}

export function registerStripeWebhook(app: Express) {
  app.post("/api/payments/stripe/webhook", express.raw({ type: "application/json" }), async (req: Request, res: Response) => {
    if (!stripe || !ENV.stripeWebhookSecret) {
      res.status(503).json({ error: "Webhook de pagamentos não configurado." });
      return;
    }

    const signature = req.header("stripe-signature");
    if (!signature) {
      res.status(400).json({ error: "Assinatura Stripe ausente." });
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, ENV.stripeWebhookSecret);
    } catch {
      res.status(400).json({ error: "Assinatura Stripe inválida." });
      return;
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const appointmentId = Number(session.metadata?.appointmentId);
    if (Number.isInteger(appointmentId) && appointmentId > 0) {
      if (event.type === "checkout.session.completed") {
        await updateAppointmentPayment(appointmentId, "paid", session.id);
      } else if (event.type === "checkout.session.async_payment_failed" || event.type === "checkout.session.expired") {
        await updateAppointmentPayment(appointmentId, "failed", session.id);
      }
    }

    res.json({ received: true });
  });
}
