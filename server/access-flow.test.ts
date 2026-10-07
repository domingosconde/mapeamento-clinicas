import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

function contextFor(user: User | null): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const patient: User = {
  id: 41,
  openId: "flow-patient",
  email: "patient@example.com",
  name: "Paciente de Teste",
  loginMethod: "manus",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

const admin: User = { ...patient, id: 42, openId: "flow-admin", role: "admin" };

describe("visitor -> patient -> admin access flow", () => {
  it("allows a visitor to resolve auth state without exposing private data", async () => {
    const visitor = appRouter.createCaller(contextFor(null));
    await expect(visitor.auth.me()).resolves.toBeNull();
    await expect(visitor.clinics.getById({ id: 1 })).resolves.toBeDefined();
    await expect(visitor.appointments.getUserAppointments()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("keeps clinic appointment management outside the patient role", async () => {
    const caller = appRouter.createCaller(contextFor(patient));
    await expect(caller.appointments.getUserAppointments()).resolves.toBeDefined();
    await expect(caller.appointments.getClinicAppointments({ clinicId: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.comments.getForModeration({ clinicId: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("recognizes the administrator role before clinic management checks", async () => {
    const caller = appRouter.createCaller(contextFor(admin));
    await expect(caller.appointments.getClinicAppointments({ clinicId: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.clinics.uploadPhoto({ clinicId: 1, fileName: "test.png", contentType: "image/png", base64: "aGVsbG8=" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
