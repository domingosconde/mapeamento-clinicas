import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

// Mock admin user context
function createAdminContext(): TrpcContext {
  const user: User = {
    id: 1,
    openId: "admin-user-123",
    email: "admin@clinic.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("admin clinic operations", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createAdminContext();
    caller = appRouter.createCaller(ctx);
  });

  describe("clinic data access", () => {
    it("admin should be able to list all clinics", async () => {
      const clinics = await caller.clinics.list();
      expect(Array.isArray(clinics)).toBe(true);
    });

    it("admin should be able to get clinic details", async () => {
      const clinics = await caller.clinics.list();
      if (clinics.length > 0) {
        const clinic = await caller.clinics.getById({ id: clinics[0].id });
        expect(clinic).toBeDefined();
      }
    });

    it("admin should be able to get clinic specialties", async () => {
      const clinics = await caller.clinics.list();
      if (clinics.length > 0) {
        const specialties = await caller.clinics.getSpecialties({
          clinicId: clinics[0].id,
        });
        expect(Array.isArray(specialties)).toBe(true);
      }
    });

    it("admin should be able to view clinic ratings", async () => {
      const clinics = await caller.clinics.list();
      if (clinics.length > 0) {
        const ratings = await caller.ratings.getByClinic({
          clinicId: clinics[0].id,
        });
        expect(Array.isArray(ratings)).toBe(true);
      }
    });

    it("admin should be able to view clinic comments", async () => {
      const clinics = await caller.clinics.list();
      if (clinics.length > 0) {
        const comments = await caller.comments.getByClinic({
          clinicId: clinics[0].id,
        });
        expect(Array.isArray(comments)).toBe(true);
      }
    });
  });
});
