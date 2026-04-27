import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getAllClinics,
  getClinicById,
  searchClinics,
  getClinicsBySpecialty,
  getAllSpecialties,
  getClinicRatings,
  getClinicCommentsWithUser,
  getUserRating,
  getDb,
  getClinicSpecialties,
  getClinicByAdminId,
  updateClinic,
  recalculateClinicRating,
  createClinicResponseRecord,
  getClinicResponsesForClinic,
  addClinicSpecialty,
  removeClinicSpecialty,
} from "./db";
import { ratings, comments, type InsertRating, type InsertComment } from "../drizzle/schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  clinics: router({
    list: publicProcedure.query(async () => getAllClinics()),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => getClinicById(input.id)),

    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => searchClinics(input.query)),

    bySpecialty: publicProcedure
      .input(z.object({ specialtyId: z.number() }))
      .query(async ({ input }) => getClinicsBySpecialty(input.specialtyId)),

    getSpecialties: publicProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input }) => getClinicSpecialties(input.clinicId)),

    // Admin: get the clinic managed by the current user
    getMyClinic: protectedProcedure.query(async ({ ctx }) =>
      getClinicByAdminId(ctx.user.id)
    ),

    // Admin: update clinic info
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().max(5000).optional(),
        phone: z.string().max(20).optional().nullable(),
        email: z.string().max(320).optional().nullable(),
        website: z.string().max(500).optional().nullable(),
        address: z.string().max(500).optional(),
        city: z.string().max(100).optional(),
        state: z.string().max(50).optional(),
        zipCode: z.string().max(20).optional().nullable(),
        openingHours: z.string().max(2000).optional().nullable(),
      }))
      .mutation(async ({ input, ctx }) => {
        const clinic = await getClinicByAdminId(ctx.user.id);
        if (!clinic || clinic.id !== input.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Não é o admin desta clínica" });
        }
        const { id, ...data } = input;
        return updateClinic(id, data);
      }),

    // Admin: add specialty to own clinic
    addSpecialty: protectedProcedure
      .input(z.object({ clinicId: z.number(), specialtyId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const clinic = await getClinicByAdminId(ctx.user.id);
        if (!clinic || clinic.id !== input.clinicId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Não é o admin desta clínica" });
        }
        return addClinicSpecialty(input.clinicId, input.specialtyId);
      }),

    // Admin: remove specialty from own clinic
    removeSpecialty: protectedProcedure
      .input(z.object({ clinicId: z.number(), specialtyId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const clinic = await getClinicByAdminId(ctx.user.id);
        if (!clinic || clinic.id !== input.clinicId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Não é o admin desta clínica" });
        }
        return removeClinicSpecialty(input.clinicId, input.specialtyId);
      }),
  }),

  specialties: router({
    list: publicProcedure.query(async () => getAllSpecialties()),
  }),

  ratings: router({
    getByClinic: publicProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input }) => getClinicRatings(input.clinicId)),

    getUserRating: protectedProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input, ctx }) => getUserRating(input.clinicId, ctx.user.id)),

    create: protectedProcedure
      .input(z.object({
        clinicId: z.number(),
        score: z.number().int().min(1).max(5),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        // Upsert: one rating per user per clinic
        const existing = await getUserRating(input.clinicId, ctx.user.id);
        if (existing) {
          await db
            .update(ratings)
            .set({ score: input.score, updatedAt: new Date() })
            .where(and(eq(ratings.clinicId, input.clinicId), eq(ratings.userId, ctx.user.id)));
        } else {
          const newRating: InsertRating = {
            clinicId: input.clinicId,
            userId: ctx.user.id,
            score: input.score,
          };
          await db.insert(ratings).values(newRating);
        }

        // Recalculate aggregate on clinic row
        await recalculateClinicRating(input.clinicId);

        return { success: true, clinicId: input.clinicId, score: input.score };
      }),
  }),

  comments: router({
    getByClinic: publicProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input }) => getClinicCommentsWithUser(input.clinicId)),

    create: protectedProcedure
      .input(z.object({
        clinicId: z.number(),
        text: z.string().min(1).max(1000),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        const newComment: InsertComment = {
          clinicId: input.clinicId,
          userId: ctx.user.id,
          text: input.text,
          isApproved: true,
        };

        const result = await db.insert(comments).values(newComment);
        return { id: (result as any).insertId, ...newComment };
      }),

    // Admin: reply to a comment on their own clinic
    reply: protectedProcedure
      .input(z.object({
        commentId: z.number(),
        clinicId: z.number(),
        text: z.string().min(1).max(2000),
      }))
      .mutation(async ({ input, ctx }) => {
        const clinic = await getClinicByAdminId(ctx.user.id);
        if (!clinic || clinic.id !== input.clinicId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Não é o admin desta clínica" });
        }
        return createClinicResponseRecord({
          commentId: input.commentId,
          clinicId: input.clinicId,
          text: input.text,
        });
      }),

    // Get all responses for a clinic
    getResponsesForClinic: publicProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input }) => getClinicResponsesForClinic(input.clinicId)),
  }),
});

export type AppRouter = typeof appRouter;
