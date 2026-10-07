export type Clinic = {
  id: number;
  name: string;
  description?: string | null;
  address: string;
  city: string;
  state: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  photoUrl?: string | null;
  averageRating?: number | null;
  totalRatings?: number | null;
  isVerified?: boolean | null;
};

const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://clinicamap-eyatarvw.manus.space";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) throw new Error("Não foi possível carregar os dados das clínicas.");
  const body = await response.json();
  return body.data as T;
}

export function fetchClinics(search = "") {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
  return request<Clinic[]>(`/api/public/v1/clinics${query}`);
}

export function fetchClinic(id: string) {
  return request<Clinic>(`/api/public/v1/clinics/${encodeURIComponent(id)}`);
}
