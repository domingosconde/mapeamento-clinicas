import { beforeAll, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

vi.mock("./storage", () => ({
  storagePut: vi.fn(async () => ({
    key: "clinics/test/photo.png",
    url: "/manus-storage/clinics/test/photo.png",
  })),
}));

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
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("clinics.uploadPhoto", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    caller = appRouter.createCaller(createAdminContext());
  });

  it("rejects unsupported MIME types", async () => {
    await expect(
      caller.clinics.uploadPhoto({
        clinicId: 1,
        fileName: "clinic.gif",
        contentType: "image/gif" as "image/png",
        base64: "cA==",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects payloads above the declared base64 limit", async () => {
    await expect(
      caller.clinics.uploadPhoto({
        clinicId: 1,
        fileName: "clinic.png",
        contentType: "image/png",
        base64: "a".repeat(7_000_001),
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("returns the persisted photo URL for an authorized clinic admin", async () => {
    const clinic = await caller.clinics.getMine();
    if (!clinic) return;

    const result = await caller.clinics.uploadPhoto({
      clinicId: clinic.id,
      fileName: "clinic.png",
      contentType: "image/png",
      base64: "cGxhY2Vob2xkZXI=",
    });

    expect(result).toEqual({
      success: true,
      photoUrl: "/manus-storage/clinics/test/photo.png",
    });
  });
});
