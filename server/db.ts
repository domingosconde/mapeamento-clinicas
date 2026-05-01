import { eq, like, and, avg, count, ne, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, clinics, specialties, ratings, comments, clinicSpecialties, clinicResponses, appointments, appointmentSlots } from "../drizzle/schema";
import { ENV } from './_core/env';
import type { InsertClinic, InsertRating, InsertComment, InsertClinicResponse, InsertAppointment, InsertAppointmentSlot } from "../drizzle/schema";

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

// Get clinic where adminUserId = userId
export async function getClinicByAdminId(adminUserId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clinics).where(eq(clinics.adminUserId, adminUserId)).limit(1);
  return result[0];
}

// Update clinic fields (only updatable by its admin)
export async function updateClinic(id: number, data: Partial<InsertClinic>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(clinics).set({ ...data, updatedAt: new Date() }).where(eq(clinics.id, id));
  const result = await db.select().from(clinics).where(eq(clinics.id, id)).limit(1);
  return result[0];
}

// Recalculate and persist averageRating and totalRatings on clinic
export async function recalculateClinicRating(clinicId: number) {
  const db = await getDb();
  if (!db) return;
  const result = await db
    .select({ avgScore: avg(ratings.score), total: count(ratings.id) })
    .from(ratings)
    .where(eq(ratings.clinicId, clinicId));
  const { avgScore, total } = result[0];
  await db
    .update(clinics)
    .set({ averageRating: avgScore ? parseFloat(String(avgScore)) : 0, totalRatings: total })
    .where(eq(clinics.id, clinicId));
}

// Get comments with user name
export async function getClinicCommentsWithUser(clinicId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: comments.id,
      clinicId: comments.clinicId,
      userId: comments.userId,
      text: comments.text,
      isApproved: comments.isApproved,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      userName: users.name,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(and(eq(comments.clinicId, clinicId), eq(comments.isApproved, true)));
}

// Get clinic responses for a comment
export async function getClinicResponsesForComment(commentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clinicResponses).where(eq(clinicResponses.commentId, commentId));
}

// Get all clinic responses for a clinic's comments
export async function getClinicResponsesForClinic(clinicId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clinicResponses).where(eq(clinicResponses.clinicId, clinicId));
}

// Create a clinic response to a comment
export async function createClinicResponseRecord(data: InsertClinicResponse) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(clinicResponses).values(data);
  return { id: (result as any).insertId, ...data };
}

// Add a specialty to a clinic
export async function addClinicSpecialty(clinicId: number, specialtyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db
    .select()
    .from(clinicSpecialties)
    .where(and(eq(clinicSpecialties.clinicId, clinicId), eq(clinicSpecialties.specialtyId, specialtyId)))
    .limit(1);
  if (existing.length > 0) return existing[0];
  const result = await db.insert(clinicSpecialties).values({ clinicId, specialtyId });
  return { id: (result as any).insertId, clinicId, specialtyId };
}

// Remove a specialty from a clinic
export async function removeClinicSpecialty(clinicId: number, specialtyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(clinicSpecialties)
    .where(and(eq(clinicSpecialties.clinicId, clinicId), eq(clinicSpecialties.specialtyId, specialtyId)));
  return { success: true };
}


// Appointment functions
export async function createAppointment(data: InsertAppointment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(appointments).values(data);
  return { id: (result as any).insertId, ...data };
}

export async function getClinicAppointments(clinicId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(appointments)
    .where(eq(appointments.clinicId, clinicId))
    .orderBy(appointments.appointmentDate);
}

export async function getUserAppointments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(appointments)
    .where(eq(appointments.userId, userId))
    .orderBy(appointments.appointmentDate);
}

export async function getAppointmentById(appointmentId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, appointmentId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateAppointmentStatus(appointmentId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(appointments)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(appointments.id, appointmentId));
}

export async function getAvailableSlots(clinicId: number, dayOfWeek: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(appointmentSlots)
    .where(and(eq(appointmentSlots.clinicId, clinicId), eq(appointmentSlots.dayOfWeek, dayOfWeek), eq(appointmentSlots.isActive, true)));
}

export async function createAppointmentSlot(data: InsertAppointmentSlot) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(appointmentSlots).values(data);
  return { id: (result as any).insertId, ...data };
}

export async function getClinicAppointmentSlots(clinicId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(appointmentSlots)
    .where(eq(appointmentSlots.clinicId, clinicId))
    .orderBy(appointmentSlots.dayOfWeek);
}


// Appointment conflict validation
export async function checkAppointmentConflict(
  clinicId: number,
  appointmentDate: string,
  startTime: string,
  endTime: string,
  excludeAppointmentId?: number
) {
  const db = await getDb();
  if (!db) return false;

  let whereCondition = and(
    eq(appointments.clinicId, clinicId),
    eq(appointments.appointmentDate, appointmentDate as any),
    eq(appointments.status, "confirmed" as any)
  );

  if (excludeAppointmentId) {
    whereCondition = and(whereCondition, ne(appointments.id, excludeAppointmentId));
  }

  const conflicts = await db
    .select()
    .from(appointments)
    .where(whereCondition);

  // Check for time overlap in application layer
  return conflicts.some((existing: any) => {
    const existingStart = existing.startTime;
    const existingEnd = existing.endTime;
    return startTime < existingEnd && endTime > existingStart;
  });
}

// Get appointment statistics for clinic
export async function getClinicAppointmentStats(clinicId: number) {
  const db = await getDb();
  if (!db) return { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };

  const allAppointments = await db
    .select()
    .from(appointments)
    .where(eq(appointments.clinicId, clinicId));

  return {
    total: allAppointments.length,
    pending: allAppointments.filter((a: any) => a.status === "pending").length,
    confirmed: allAppointments.filter((a: any) => a.status === "confirmed").length,
    completed: allAppointments.filter((a: any) => a.status === "completed").length,
    cancelled: allAppointments.filter((a: any) => a.status === "cancelled").length,
  };
}

// Get upcoming appointments for clinic
export async function getUpcomingAppointments(clinicId: number, days: number = 7) {
  const db = await getDb();
  if (!db) return [];

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.clinicId, clinicId),
        sql`${appointments.appointmentDate} >= CURDATE()`,
        sql`${appointments.appointmentDate} <= ${futureDate.toISOString().split("T")[0]}`,
        ne(appointments.status, "cancelled")
      )
    )
    .orderBy(appointments.appointmentDate, appointments.startTime);
}
