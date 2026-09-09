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
  createAppointment,
  getClinicAppointments,
  getUserAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  getAvailableSlots,
  createAppointmentSlot,
  getClinicAppointmentSlots,
  checkAppointmentConflict,
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

    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => searchClinics(input.query)),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => getClinicById(input.id)),

    getBySpecialty: publicProcedure
      .input(z.object({ specialtyId: z.number() }))
      .query(async ({ input }) => getClinicsBySpecialty(input.specialtyId)),

    getSpecialties: publicProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input }) => getClinicSpecialties(input.clinicId)),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        website: z.string().optional(),
        openingHours: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        const clinic = await getClinicByAdminId(ctx.user.id);
        if (!clinic || clinic.id !== input.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await updateClinic(input.id, input);
        return { success: true };
      }),

    addSpecialty: protectedProcedure
      .input(z.object({ clinicId: z.number(), specialtyId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        const clinic = await getClinicByAdminId(ctx.user.id);
        if (!clinic || clinic.id !== input.clinicId) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await addClinicSpecialty(input.clinicId, input.specialtyId);
        return { success: true };
      }),

    removeSpecialty: protectedProcedure
      .input(z.object({ clinicId: z.number(), specialtyId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        const clinic = await getClinicByAdminId(ctx.user.id);
        if (!clinic || clinic.id !== input.clinicId) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await removeClinicSpecialty(input.clinicId, input.specialtyId);
        return { success: true };
      }),
  }),

  specialties: router({
    list: publicProcedure.query(async () => getAllSpecialties()),
  }),

  ratings: router({
    getByClinic: publicProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input }) => getClinicRatings(input.clinicId)),

    getUserRating: publicProcedure
      .input(z.object({ clinicId: z.number(), userId: z.number() }))
      .query(async ({ input }) => getUserRating(input.clinicId, input.userId)),

    create: protectedProcedure
      .input(z.object({
        clinicId: z.number(),
        score: z.number().min(1).max(5),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const newRating: InsertRating = {
          clinicId: input.clinicId,
          userId: ctx.user.id,
          score: input.score,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.insert(ratings).values(newRating);
        await recalculateClinicRating(input.clinicId);
        const createdRating = await getUserRating(input.clinicId, ctx.user.id);
        return createdRating || { success: true };
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
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const newComment: InsertComment = {
          clinicId: input.clinicId,
          userId: ctx.user.id,
          text: input.text,
          isApproved: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await db.insert(comments).values(newComment);
        const createdComments = await getClinicCommentsWithUser(input.clinicId);
        return createdComments[createdComments.length - 1] || { success: true };
      }),

    reply: protectedProcedure
      .input(z.object({
        commentId: z.number(),
        text: z.string().min(1).max(1000),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const comment = await db.select().from(comments).where(eq(comments.id, input.commentId)).limit(1);
        if (comment.length === 0) throw new TRPCError({ code: "NOT_FOUND" });

        const clinic = await getClinicByAdminId(ctx.user.id);
        if (!clinic || clinic.id !== comment[0].clinicId) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        await createClinicResponseRecord({
          commentId: input.commentId,
          clinicId: clinic.id,
          text: input.text,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return { success: true };
      }),
  }),

  appointments: router({
    // Create a new appointment
    create: protectedProcedure
      .input(z.object({
        clinicId: z.number(),
        appointmentDate: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        specialtyId: z.number().optional(),
        patientName: z.string().min(1),
        patientEmail: z.string().email(),
        patientPhone: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        // Check for conflicts with confirmed appointments
        const hasConflict = await checkAppointmentConflict(
          input.clinicId,
          input.appointmentDate,
          input.startTime,
          input.endTime
        );
        
        if (hasConflict) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Este horario ja esta ocupado. Por favor, escolha outro horario.",
          });
        }
        
        return createAppointment({
          clinicId: input.clinicId,
          userId: ctx.user.id,
          appointmentDate: new Date(input.appointmentDate),
          startTime: input.startTime,
          endTime: input.endTime,
          specialtyId: input.specialtyId,
          patientName: input.patientName,
          patientEmail: input.patientEmail,
          patientPhone: input.patientPhone,
          notes: input.notes,
          status: "pending",
        });
      }),

    // Get clinic appointments
    getClinicAppointments: publicProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input }) => getClinicAppointments(input.clinicId)),

    // Get user appointments
    getUserAppointments: protectedProcedure
      .query(async ({ ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        return getUserAppointments(ctx.user.id);
      }),

    // Get appointment by ID
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => getAppointmentById(input.id)),

    // Update appointment status
    updateStatus: protectedProcedure
      .input(z.object({
        appointmentId: z.number(),
        status: z.enum(["pending", "confirmed", "completed", "cancelled", "no-show"]),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const appointment = await getAppointmentById(input.appointmentId);
        if (!appointment) throw new TRPCError({ code: "NOT_FOUND" });
        const clinic = await getClinicByAdminId(ctx.user.id);
        if (!clinic || clinic.id !== appointment.clinicId) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        // If confirming, check for conflicts
        if (input.status === "confirmed") {
          const hasConflict = await checkAppointmentConflict(
            appointment.clinicId,
            appointment.appointmentDate.toISOString().split("T")[0],
            appointment.startTime,
            appointment.endTime,
            input.appointmentId
          );
          
          if (hasConflict) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Este horario ja foi ocupado por outro agendamento.",
            });
          }
        }
        
        await updateAppointmentStatus(input.appointmentId, input.status);
        return { success: true };
      }),

    // Get available slots
    getAvailableSlots: publicProcedure
      .input(z.object({ clinicId: z.number(), dayOfWeek: z.number() }))
      .query(async ({ input }) => getAvailableSlots(input.clinicId, input.dayOfWeek)),

    // Create appointment slot
    createSlot: protectedProcedure
      .input(z.object({
        clinicId: z.number(),
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string(),
        endTime: z.string(),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
        const clinic = await getClinicByAdminId(ctx.user.id);
        if (!clinic || clinic.id !== input.clinicId) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return createAppointmentSlot({
          clinicId: input.clinicId,
          dayOfWeek: input.dayOfWeek,
          startTime: input.startTime,
          endTime: input.endTime,
          isActive: input.isActive,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }),

    // Get clinic appointment slots
    getClinicSlots: publicProcedure
      .input(z.object({ clinicId: z.number() }))
      .query(async ({ input }) => getClinicAppointmentSlots(input.clinicId)),
  }),
});

export type AppRouter = typeof appRouter;
