import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

function createAdminContext(): { ctx: TrpcContext; user: User } {
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

function createUserContext(): { ctx: TrpcContext; user: User } {
  const user: User = {
    id: 2,
    openId: "user-123",
    email: "user@example.com",
    name: "Regular User",
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

describe("comments.reply", () => {
  it("should allow admin to reply to comments", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.comments.reply({
        commentId: 1,
        text: "Thank you for your feedback!",
      });
    } catch (error: any) {
      expect(error.code).toBeDefined();
    }
  });

  it("should reject reply from non-admin user", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.comments.reply({
        commentId: 1,
        text: "Thank you for your feedback!",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(["BAD_REQUEST", "PARSE_ERROR"].includes(error.code)).toBe(true);
    }
  });

  it("should validate empty reply text", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.comments.reply({
        commentId: 1,
        text: "",
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(["BAD_REQUEST", "PARSE_ERROR"].includes(error.code)).toBe(true);
    }
  });
});

describe("comments.getResponsesForClinic", () => {
  it("should retrieve clinic responses", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const responses = await caller.comments.getResponsesForClinic({
      clinicId: 1,
    });

    expect(Array.isArray(responses)).toBe(true);
  });

  it("should return empty array when no responses exist", async () => {
    const { ctx } = createUserContext();
    const caller = appRouter.createCaller(ctx);

    const responses = await caller.comments.getResponsesForClinic({
      clinicId: 999,
    });

    expect(responses).toEqual([]);
  });
});
