// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import ClinicDetail from "./ClinicDetail";

const clinic = {
  id: 1,
  name: "Clínica Teste",
  description: "Cuidados de proximidade.",
  address: "Rua da Saúde, 10",
  city: "Luanda",
  state: "Luanda",
  zipCode: "0000",
  phone: "+244 900 000 000",
  email: "contacto@clinica.test",
  website: null,
  openingHours: null,
  photoUrl: null,
  isVerified: true,
};

vi.mock("wouter", () => ({
  useParams: () => ({ id: "1" }),
  useLocation: () => ["/clinic/1", vi.fn()],
}));

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ user: null, isAuthenticated: false }),
}));

vi.mock("@/const", () => ({ getLoginUrl: () => "/login" }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/lib/trpc", () => {
  const mutation = () => ({ isPending: false, mutate: vi.fn() });
  return {
    trpc: {
      useUtils: () => ({ clinics: { getById: { invalidate: vi.fn() } } }),
      clinics: { getById: { useQuery: () => ({ data: clinic, isLoading: false }) } },
      ratings: {
        getByClinic: { useQuery: () => ({ data: [], refetch: vi.fn() }) },
        getUserRating: { useQuery: () => ({ data: undefined }) },
        create: { useMutation: mutation },
      },
      comments: {
        getByClinic: { useQuery: () => ({ data: [], refetch: vi.fn() }) },
        create: { useMutation: mutation },
      },
      professionals: {
        getByClinic: { useQuery: () => ({ data: [{ id: 7, name: "Dra. Ana Manuel", specialty: "Cardiologia", averageRating: 4.8, totalRatings: 6, bio: "Acompanhamento preventivo." }] }) },
        rate: { useMutation: mutation },
      },
    },
  };
});

describe("ClinicDetail", () => {
  it("renders the public clinic identity and booking action", () => {
    render(<ClinicDetail />);

    expect(screen.getByRole("heading", { name: "Clínica Teste" })).toBeInTheDocument();
    expect(screen.getByText("Cuidados de proximidade.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Agendar Consulta" })).toBeInTheDocument();
    expect(screen.getByText("Dra. Ana Manuel")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar para avaliar" })).toBeInTheDocument();
    expect(screen.getByText("Clínica Teste").parentElement).toHaveTextContent("Verificada");
  });
});
