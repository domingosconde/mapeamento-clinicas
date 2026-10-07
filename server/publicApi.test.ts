import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  getAllClinics: vi.fn(async () => [
    {
      id: 1,
      name: "Clínica Integração",
      description: "Teste público",
      address: "Rua A",
      city: "Luanda",
      state: "Luanda",
      zipCode: "0000",
      latitude: "-8.83",
      longitude: "13.23",
      phone: null,
      email: null,
      website: null,
      openingHours: null,
      photoUrl: null,
      averageRating: 4.5,
      totalRatings: 2,
      isVerified: true,
    },
  ]),
  getClinicById: vi.fn(async (id: number) => (id === 1 ? {
    id: 1,
    name: "Clínica Integração",
    description: "Teste público",
    address: "Rua A",
    city: "Luanda",
    state: "Luanda",
    zipCode: "0000",
    latitude: "-8.83",
    longitude: "13.23",
    phone: null,
    email: null,
    website: null,
    openingHours: null,
    photoUrl: null,
    averageRating: 4.5,
    totalRatings: 2,
    isVerified: true,
  } : undefined)),
}));

import { registerPublicApi } from "./publicApi";

describe("public API integration", () => {
  const app = express();

  beforeEach(() => {
    registerPublicApi(app);
  });

  it("returns a stable public clinic contract", async () => {
    const response = await request(app).get("/api/public/v1/clinics");
    expect(response.status).toBe(200);
    expect(response.body.meta.count).toBe(1);
    expect(response.body.data[0]).toMatchObject({ id: 1, name: "Clínica Integração", isVerified: true });
    expect(response.body.data[0]).not.toHaveProperty("adminUserId");
  });

  it("supports name search and not-found responses", async () => {
    const search = await request(app).get("/api/public/v1/clinics?search=integração");
    expect(search.status).toBe(200);
    expect(search.body.data).toHaveLength(1);

    const notFound = await request(app).get("/api/public/v1/clinics/999");
    expect(notFound.status).toBe(404);
    expect(notFound.body.error).toContain("não encontrada");
  });
});
