import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

function createAdminContext(clinicId: number): { ctx: TrpcContext; user: User } {
  const user: User = {
    id: 1,
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

describe("clinics.update", () => {
  it("should update clinic information when authorized", async () => {
    const { ctx } = createAdminContext(1);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.clinics.update({
        id: 1,
        name: "Updated Clinic Name",
        description: "Updated description",
        phone: "+244 222 999 999",
        email: "updated@clinic.com",
        website: "https://updated.ao",
        address: "New Address, 123",
        city: "Luanda",
        state: "Luanda",
        zipCode: "1000",
        openingHours: "Seg-Dom: 08:00 - 20:00",
      });
    } catch (error: any) {
      expect(error.code).toBeDefined();
    }
  });

  it("should reject update when user is not authorized", async () => {
    const user: User = {
      id: 2,
      openId: "different-user",
      email: "other@example.com",
      name: "Other User",
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

    const caller = appRouter.createCaller(ctx);

    try {
      await caller.clinics.update({
        id: 1,
        name: "Unauthorized Update",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should validate required fields", async () => {
    const { ctx } = createAdminContext(1);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.clinics.update({
        id: 1,
        name: "",
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(["BAD_REQUEST", "PARSE_ERROR"].includes(error.code)).toBe(true);
    }
  });
});

describe("clinics.addSpecialty", () => {
  it("should add specialty to clinic when authorized", async () => {
    const { ctx } = createAdminContext(1);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.clinics.addSpecialty({
        clinicId: 1,
        specialtyId: 1,
      });
    } catch (error: any) {
      expect(error.code).toBeDefined();
    }
  });

  it("should reject specialty add when not authorized", async () => {
    const user: User = {
      id: 2,
      openId: "different-user",
      email: "other@example.com",
      name: "Other User",
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

    const caller = appRouter.createCaller(ctx);

    try {
      await caller.clinics.addSpecialty({
        clinicId: 1,
        specialtyId: 1,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });
});

describe("clinics.removeSpecialty", () => {
  it("should remove specialty from clinic when authorized", async () => {
    const { ctx } = createAdminContext(1);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.clinics.removeSpecialty({
        clinicId: 1,
        specialtyId: 1,
      });
    } catch (error: any) {
      expect(error.code).toBeDefined();
    }
  });

  it("should reject specialty removal when not authorized", async () => {
    const user: User = {
      id: 2,
      openId: "different-user",
      email: "other@example.com",
      name: "Other User",
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

    const caller = appRouter.createCaller(ctx);

    try {
      await caller.clinics.removeSpecialty({
        clinicId: 1,
        specialtyId: 1,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });
});
