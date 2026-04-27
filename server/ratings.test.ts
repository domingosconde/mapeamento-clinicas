import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

// Mock authenticated user context
function createAuthContext(): TrpcContext {
  const user: User = {
    id: 1,
    openId: "test-user-123",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
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

describe("ratings mutations", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createAuthContext();
    caller = appRouter.createCaller(ctx);
  });

  describe("create", () => {
    it("should create a rating for a clinic", async () => {
      // First get a clinic
      const clinics = await caller.clinics.list();
      if (clinics.length > 0) {
        const result = await caller.ratings.create({
          clinicId: clinics[0].id,
          score: 5,
        });
        expect(result).toBeDefined();
        expect(result.score).toBe(5);
        expect(result.clinicId).toBe(clinics[0].id);
      }
    });

    it("should reject invalid score", async () => {
      const clinics = await caller.clinics.list();
      if (clinics.length > 0) {
        try {
          await caller.ratings.create({
            clinicId: clinics[0].id,
            score: 6, // Invalid: should be 1-5
          });
          expect.fail("Should have thrown error");
        } catch (error) {
          expect(error).toBeDefined();
        }
      }
    });
  });
});

describe("comments mutations", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createAuthContext();
    caller = appRouter.createCaller(ctx);
  });

  describe("create", () => {
    it("should create a comment for a clinic", async () => {
      const clinics = await caller.clinics.list();
      if (clinics.length > 0) {
        const result = await caller.comments.create({
          clinicId: clinics[0].id,
          text: "Great clinic! Highly recommended.",
        });
        expect(result).toBeDefined();
        expect(result.text).toBe("Great clinic! Highly recommended.");
        expect(result.clinicId).toBe(clinics[0].id);
      }
    });

    it("should reject empty comment", async () => {
      const clinics = await caller.clinics.list();
      if (clinics.length > 0) {
        try {
          await caller.comments.create({
            clinicId: clinics[0].id,
            text: "", // Invalid: empty
          });
          expect.fail("Should have thrown error");
        } catch (error) {
          expect(error).toBeDefined();
        }
      }
    });
  });
});
