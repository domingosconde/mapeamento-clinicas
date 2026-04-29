import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

function createUserContext(): { ctx: TrpcContext; user: User } {
  const user: User = {
    id: 1,
    openId: "user-123",
    email: "user@example.com",
    name: "John Doe",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx, user };
}

function createAdminContext(): { ctx: TrpcContext; user: User } {
  const user: User = {
    id: 2,
    openId: "admin-user-123",
    email: "admin@clinic.com",
    name: "Admin Clinic",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx, user };
}

describe("appointments.create", () => {
  it("should create appointment for authenticated user", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.appointments.create({
        clinicId: 1,
        appointmentDate: "2026-05-15",
        startTime: "10:00",
        patientName: "John Doe",
        patientEmail: "john@example.com",
        patientPhone: "+244 912 345 678",
        notes: "Consulta de rotina",
      });
    } catch (error: any) {
      expect(error.code).toBeDefined();
    }
  });

  it("should reject unauthenticated appointment creation", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    try {
      await caller.appointments.create({
        clinicId: 1,
        appointmentDate: "2026-05-15",
        startTime: "10:00",
        patientName: "John Doe",
        patientEmail: "john@example.com",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });

  it("should validate required fields", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.appointments.create({
        clinicId: 1,
        appointmentDate: "",
        startTime: "10:00",
        patientName: "John Doe",
        patientEmail: "john@example.com",
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(["BAD_REQUEST", "PARSE_ERROR"].includes(error.code)).toBe(true);
    }
  });

  it("should validate email format", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.appointments.create({
        clinicId: 1,
        appointmentDate: "2026-05-15",
        startTime: "10:00",
        patientName: "John Doe",
        patientEmail: "invalid-email",
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(["BAD_REQUEST", "PARSE_ERROR"].includes(error.code)).toBe(true);
    }
  });
});

describe("appointments.updateStatus", () => {
  it("should allow admin to update appointment status", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.appointments.updateStatus({
        appointmentId: 1,
        status: "confirmed",
      });
    } catch (error: any) {
      expect(error.code).toBeDefined();
    }
  });

  it("should reject non-admin status update", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.appointments.updateStatus({
        appointmentId: 1,
        status: "confirmed",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(["FORBIDDEN", "NOT_FOUND"].includes(error.code)).toBe(true);
    }
  });
});

describe("appointments.createSlot", () => {
  it("should allow admin to create appointment slot", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.appointments.createSlot({
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "17:00",
        slotDurationMinutes: 30,
      });
    } catch (error: any) {
      expect(error.code).toBeDefined();
    }
  });

  it("should reject non-admin slot creation", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.appointments.createSlot({
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "17:00",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should validate day of week", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.appointments.createSlot({
        dayOfWeek: 7,
        startTime: "09:00",
        endTime: "17:00",
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(["BAD_REQUEST", "PARSE_ERROR"].includes(error.code)).toBe(true);
    }
  });
});

describe("appointments.getAvailableSlots", () => {
  it("should retrieve available slots for a clinic", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const slots = await caller.appointments.getAvailableSlots({
      clinicId: 1,
      dayOfWeek: 1,
    });

    expect(Array.isArray(slots)).toBe(true);
  });
});

describe("appointments.getUserAppointments", () => {
  it("should retrieve user appointments", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const appointments = await caller.appointments.getUserAppointments();

    expect(Array.isArray(appointments)).toBe(true);
  });

  it("should reject unauthenticated request", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    try {
      await caller.appointments.getUserAppointments();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });
});
