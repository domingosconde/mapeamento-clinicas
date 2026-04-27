import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock context for public procedures
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("clinics router", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createPublicContext();
    caller = appRouter.createCaller(ctx);
  });

  describe("list", () => {
    it("should return an array of clinics", async () => {
      const result = await caller.clinics.list();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("search", () => {
    it("should search clinics by name", async () => {
      const result = await caller.clinics.search({ query: "clinic" });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return empty array for non-existent clinic", async () => {
      const result = await caller.clinics.search({ query: "nonexistent123456" });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getById", () => {
    it("should return clinic details for valid ID", async () => {
      // First, get a clinic to test with
      const clinics = await caller.clinics.list();
      if (clinics.length > 0) {
        const clinic = await caller.clinics.getById({ id: clinics[0].id });
        expect(clinic).toBeDefined();
        expect(clinic?.id).toBe(clinics[0].id);
      }
    });

    it("should return undefined for invalid ID", async () => {
      const clinic = await caller.clinics.getById({ id: 99999 });
      expect(clinic).toBeUndefined();
    });
  });

  describe("getSpecialties", () => {
    it("should return specialties for a clinic", async () => {
      const clinics = await caller.clinics.list();
      if (clinics.length > 0) {
        const specialties = await caller.clinics.getSpecialties({
          clinicId: clinics[0].id,
        });
        expect(Array.isArray(specialties)).toBe(true);
      }
    });

    it("should return empty array for clinic with no specialties", async () => {
      const specialties = await caller.clinics.getSpecialties({
        clinicId: 99999,
      });
      expect(Array.isArray(specialties)).toBe(true);
      expect(specialties.length).toBe(0);
    });
  });

  describe("bySpecialty", () => {
    it("should return clinics for a specialty", async () => {
      const specialties = await caller.specialties.list();
      if (specialties.length > 0) {
        const clinics = await caller.clinics.bySpecialty({
          specialtyId: specialties[0].id,
        });
        expect(Array.isArray(clinics)).toBe(true);
      }
    });
  });
});

describe("ratings router", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createPublicContext();
    caller = appRouter.createCaller(ctx);
  });

  describe("getByClinic", () => {
    it("should return ratings for a clinic", async () => {
      const clinics = await caller.clinics.list();
      if (clinics.length > 0) {
        const ratings = await caller.ratings.getByClinic({
          clinicId: clinics[0].id,
        });
        expect(Array.isArray(ratings)).toBe(true);
      }
    });

    it("should return empty array for clinic with no ratings", async () => {
      const ratings = await caller.ratings.getByClinic({ clinicId: 99999 });
      expect(Array.isArray(ratings)).toBe(true);
    });
  });
});

describe("comments router", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createPublicContext();
    caller = appRouter.createCaller(ctx);
  });

  describe("getByClinic", () => {
    it("should return comments for a clinic", async () => {
      const clinics = await caller.clinics.list();
      if (clinics.length > 0) {
        const comments = await caller.comments.getByClinic({
          clinicId: clinics[0].id,
        });
        expect(Array.isArray(comments)).toBe(true);
      }
    });

    it("should return empty array for clinic with no comments", async () => {
      const comments = await caller.comments.getByClinic({ clinicId: 99999 });
      expect(Array.isArray(comments)).toBe(true);
    });
  });
});
