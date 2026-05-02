import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, publicProcedure, router } from "./trpc";
import { getDb } from "../db";
import { clinics, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),

  createClinic: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "name is required"),
        address: z.string().min(1, "address is required"),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        website: z.string().optional(),
        latitude: z.string(),
        longitude: z.string(),
        openingHours: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const lat = parseFloat(input.latitude);
      const lng = parseFloat(input.longitude);

      if (isNaN(lat) || isNaN(lng)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid latitude or longitude",
        });
      }

      await db.insert(clinics).values({
        name: input.name,
        address: input.address,
        city: input.city || "",
        state: input.state || "",
        zipCode: input.zipCode,
        phone: input.phone,
        email: input.email,
        website: input.website,
        latitude: lat.toString(),
        longitude: lng.toString(),
        openingHours: input.openingHours,
        adminUserId: ctx.user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { success: true };
    }),

  promoteToAdmin: adminProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Find user by email
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (userResult.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const targetUser = userResult[0];

      // Update user role to admin
      await db
        .update(users)
        .set({ role: "admin", updatedAt: new Date() })
        .where(eq(users.id, targetUser.id));

      return { success: true };
    }),
});
