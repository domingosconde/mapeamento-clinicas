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
  getClinicComments,
  getUserRating,
  getDb,
  getClinicSpecialties,
} from "./db";
import { ratings, comments, type InsertRating, type InsertComment } from "../drizzle/schema";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  clinics: router({
    list: publicProcedure.query(async () => {
      return getAllClinics();
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getClinicById(input.id);
      }),
    
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return searchClinics(input.query);
      }),
    
    bySpecialty: publicProcedure
      .input(z.object({ specialtyId: z.number() }))
      .query(async ({ input }) => {
        return getClinicsBySpecialty(input.specialtyId);
      }),
    
    getSpecialties: publicProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input }) => {
        return getClinicSpecialties(input.clinicId);
      }),
  }),

  specialties: router({
    list: publicProcedure.query(async () => {
      return getAllSpecialties();
    }),
  }),

  ratings: router({
    getByClinic: publicProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input }) => {
        return getClinicRatings(input.clinicId);
      }),
    
    getUserRating: protectedProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input, ctx }) => {
        return getUserRating(input.clinicId, ctx.user.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        clinicId: z.number(),
        score: z.number().min(1).max(5),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const newRating: InsertRating = {
          clinicId: input.clinicId,
          userId: ctx.user.id,
          score: input.score,
        };
        
        const result = await db.insert(ratings).values(newRating);
        return { id: (result as any).insertId, ...newRating };
      }),
  }),

  comments: router({
    getByClinic: publicProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input }) => {
        return getClinicComments(input.clinicId);
      }),
    
    create: protectedProcedure
      .input(z.object({
        clinicId: z.number(),
        text: z.string().min(1).max(1000),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const newComment: InsertComment = {
          clinicId: input.clinicId,
          userId: ctx.user.id,
          text: input.text,
          isApproved: true,
        };
        
        const result = await db.insert(comments).values(newComment);
        return { id: (result as any).insertId, ...newComment };
      }),
  }),
});

export type AppRouter = typeof appRouter;
