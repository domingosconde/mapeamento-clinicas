import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, float } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Clinics table - stores information about medical clinics
 */
export const clinics = mysqlTable("clinics", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  address: varchar("address", { length: 500 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  zipCode: varchar("zipCode", { length: 20 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 500 }),
  openingHours: text("openingHours"), // JSON string with hours
  photoUrl: varchar("photoUrl", { length: 500 }),
  adminUserId: int("adminUserId").notNull(),
  averageRating: float("averageRating").default(0),
  totalRatings: int("totalRatings").default(0),
  isVerified: boolean("isVerified").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Clinic = typeof clinics.$inferSelect;
export type InsertClinic = typeof clinics.$inferInsert;

/**
 * Specialties table - stores medical specialties
 */
export const specialties = mysqlTable("specialties", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Specialty = typeof specialties.$inferSelect;
export type InsertSpecialty = typeof specialties.$inferInsert;

/**
 * Clinic-Specialty junction table
 */
export const clinicSpecialties = mysqlTable("clinicSpecialties", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  specialtyId: int("specialtyId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ClinicSpecialty = typeof clinicSpecialties.$inferSelect;
export type InsertClinicSpecialty = typeof clinicSpecialties.$inferInsert;

/**
 * Ratings table - stores user ratings for clinics
 */
export const ratings = mysqlTable("ratings", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  userId: int("userId").notNull(),
  score: int("score").notNull(), // 1-5
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = typeof ratings.$inferInsert;

/**
 * Comments table - stores user comments/reviews for clinics
 */
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  userId: int("userId").notNull(),
  text: text("text").notNull(),
  isApproved: boolean("isApproved").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

/**
 * Clinic Responses table - stores clinic admin responses to comments
 */
export const clinicResponses = mysqlTable("clinicResponses", {
  id: int("id").autoincrement().primaryKey(),
  commentId: int("commentId").notNull(),
  clinicId: int("clinicId").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClinicResponse = typeof clinicResponses.$inferSelect;
export type InsertClinicResponse = typeof clinicResponses.$inferInsert;

// Relations
export const clinicsRelations = relations(clinics, ({ many, one }) => (
  {
    specialties: many(clinicSpecialties),
    ratings: many(ratings),
    comments: many(comments),
    admin: one(users, {
      fields: [clinics.adminUserId],
      references: [users.id],
    }),
  }
));

export const clinicSpecialtiesRelations = relations(clinicSpecialties, ({ one }) => (
  {
    clinic: one(clinics, {
      fields: [clinicSpecialties.clinicId],
      references: [clinics.id],
    }),
    specialty: one(specialties, {
      fields: [clinicSpecialties.specialtyId],
      references: [specialties.id],
    }),
  }
));

export const ratingsRelations = relations(ratings, ({ one }) => (
  {
    clinic: one(clinics, {
      fields: [ratings.clinicId],
      references: [clinics.id],
    }),
    user: one(users, {
      fields: [ratings.userId],
      references: [users.id],
    }),
  }
));

export const commentsRelations = relations(comments, ({ one, many }) => (
  {
    clinic: one(clinics, {
      fields: [comments.clinicId],
      references: [clinics.id],
    }),
    user: one(users, {
      fields: [comments.userId],
      references: [users.id],
    }),
    clinicResponses: many(clinicResponses),
  }
));

export const clinicResponsesRelations = relations(clinicResponses, ({ one }) => (
  {
    comment: one(comments, {
      fields: [clinicResponses.commentId],
      references: [comments.id],
    }),
    clinic: one(clinics, {
      fields: [clinicResponses.clinicId],
      references: [clinics.id],
    }),
  }
));

export const specialtiesRelations = relations(specialties, ({ many }) => (
  {
    clinics: many(clinicSpecialties),
  }
));

export const usersRelations = relations(users, ({ many }) => (
  {
    ratings: many(ratings),
    comments: many(comments),
  }
));
