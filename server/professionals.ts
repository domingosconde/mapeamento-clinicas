import { and, asc, eq, sql } from "drizzle-orm";
import { getDb } from "./db";
import { medicalProfessionals, professionalRatings } from "../drizzle/schema";
import type { InsertMedicalProfessional, InsertProfessionalRating } from "../drizzle/schema";

export async function getClinicProfessionals(clinicId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(medicalProfessionals)
    .where(and(eq(medicalProfessionals.clinicId, clinicId), eq(medicalProfessionals.isActive, true)))
    .orderBy(asc(medicalProfessionals.name));
}

export async function getProfessionalById(professionalId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [professional] = await db.select().from(medicalProfessionals).where(eq(medicalProfessionals.id, professionalId)).limit(1);
  return professional;
}

export async function createProfessional(input: InsertMedicalProfessional) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(medicalProfessionals).values(input);
  return getProfessionalById(Number(result[0].insertId));
}

export async function createProfessionalRating(input: InsertProfessionalRating) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(professionalRatings).values(input);
  await recalculateProfessionalRating(input.professionalId);
  return getUserProfessionalRating(input.professionalId, input.userId);
}

export async function getUserProfessionalRating(professionalId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [rating] = await db
    .select()
    .from(professionalRatings)
    .where(and(eq(professionalRatings.professionalId, professionalId), eq(professionalRatings.userId, userId)))
    .limit(1);
  return rating;
}

export async function recalculateProfessionalRating(professionalId: number) {
  const db = await getDb();
  if (!db) return;
  const [summary] = await db
    .select({ average: sql<number>`AVG(${professionalRatings.score})`, total: sql<number>`COUNT(*)` })
    .from(professionalRatings)
    .where(eq(professionalRatings.professionalId, professionalId));
  await db
    .update(medicalProfessionals)
    .set({ averageRating: Number(summary?.average ?? 0), totalRatings: Number(summary?.total ?? 0) })
    .where(eq(medicalProfessionals.id, professionalId));
}
