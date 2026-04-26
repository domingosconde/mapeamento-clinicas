import { eq, like, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, clinics, specialties, ratings, comments, clinicSpecialties } from "../drizzle/schema";
import { ENV } from './_core/env';
import type { InsertClinic, InsertRating, InsertComment } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Clinic queries
export async function getAllClinics() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clinics);
}

export async function getClinicById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clinics).where(eq(clinics.id, id)).limit(1);
  return result[0];
}

export async function getClinicsBySpecialty(specialtyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(clinics)
    .innerJoin(clinicSpecialties, eq(clinics.id, clinicSpecialties.clinicId))
    .where(eq(clinicSpecialties.specialtyId, specialtyId));
}

export async function searchClinics(query: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(clinics)
    .where(like(clinics.name, `%${query}%`));
}

// Specialty queries
export async function getAllSpecialties() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(specialties);
}

export async function getSpecialtyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(specialties).where(eq(specialties.id, id)).limit(1);
  return result[0];
}

// Rating queries
export async function getClinicRatings(clinicId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ratings).where(eq(ratings.clinicId, clinicId));
}

export async function getUserRating(clinicId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(ratings)
    .where(and(eq(ratings.clinicId, clinicId), eq(ratings.userId, userId)))
    .limit(1);
  return result[0];
}

// Comment queries
export async function getClinicComments(clinicId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(comments).where(eq(comments.clinicId, clinicId));
}

// Clinic Specialties queries
export async function getClinicSpecialties(clinicId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(specialties)
    .innerJoin(clinicSpecialties, eq(specialties.id, clinicSpecialties.specialtyId))
    .where(eq(clinicSpecialties.clinicId, clinicId));
}

// TODO: add more feature queries as needed
