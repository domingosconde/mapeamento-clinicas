import type { Express, Request, Response } from "express";
import { getAllClinics, getClinicById } from "./db";
import { ENV } from "./_core/env";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 60;
const requests = new Map<string, { count: number; startedAt: number }>();

function clientKey(req: Request) {
  return req.header("x-api-key") || req.ip || "anonymous";
}

function isRateLimited(req: Request) {
  const key = clientKey(req);
  const now = Date.now();
  const current = requests.get(key);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    requests.set(key, { count: 1, startedAt: now });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}

function publicClinic(clinic: any) {
  return {
    id: clinic.id,
    name: clinic.name,
    description: clinic.description,
    address: clinic.address,
    city: clinic.city,
    state: clinic.state,
    zipCode: clinic.zipCode,
    latitude: clinic.latitude,
    longitude: clinic.longitude,
    phone: clinic.phone,
    email: clinic.email,
    website: clinic.website,
    openingHours: clinic.openingHours,
    photoUrl: clinic.photoUrl,
    averageRating: clinic.averageRating,
    totalRatings: clinic.totalRatings,
    isVerified: clinic.isVerified,
  };
}

export function registerPublicApi(app: Express) {
  app.get("/api/public/v1/clinics", async (req: Request, res: Response) => {
    if (ENV.publicApiKey && req.header("x-api-key") !== ENV.publicApiKey) {
      res.status(401).json({ error: "A chave da API é inválida ou está ausente." });
      return;
    }
    if (isRateLimited(req)) {
      res.setHeader("Retry-After", "60");
      res.status(429).json({ error: "Limite de pedidos excedido. Tente novamente em breve." });
      return;
    }

    const query = String(req.query.search ?? "").trim().toLocaleLowerCase();
    const clinics = await getAllClinics();
    const filtered = query
      ? clinics.filter((clinic: any) => String(clinic.name).toLocaleLowerCase().includes(query))
      : clinics;
    res.json({ data: filtered.map(publicClinic), meta: { count: filtered.length, limit: MAX_REQUESTS_PER_WINDOW, windowSeconds: 60 } });
  });

  app.get("/api/public/v1/clinics/:id", async (req: Request, res: Response) => {
    if (ENV.publicApiKey && req.header("x-api-key") !== ENV.publicApiKey) {
      res.status(401).json({ error: "A chave da API é inválida ou está ausente." });
      return;
    }
    if (isRateLimited(req)) {
      res.setHeader("Retry-After", "60");
      res.status(429).json({ error: "Limite de pedidos excedido. Tente novamente em breve." });
      return;
    }

    const clinic = await getClinicById(Number(req.params.id));
    if (!clinic) {
      res.status(404).json({ error: "Clínica não encontrada." });
      return;
    }
    res.json({ data: publicClinic(clinic) });
  });
}
