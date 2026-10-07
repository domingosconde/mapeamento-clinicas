import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const context: TrpcContext = {
  user: {
    id: 51,
    openId: "payment-test",
    name: "Paciente",
    email: "patient@example.com",
    loginMethod: "test",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
};

describe("appointment payments", () => {
  it("exposes a safe disabled configuration when Stripe is not configured", async () => {
    const caller = appRouter.createCaller(context);
    await expect(caller.appointments.getPaymentConfig()).resolves.toMatchObject({ enabled: false, amountCents: 0 });
  });

  it("does not start checkout without server-side payment configuration", async () => {
    const caller = appRouter.createCaller(context);
    await expect(caller.appointments.createCheckout({ appointmentId: 1, origin: "https://example.com" })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });
});
