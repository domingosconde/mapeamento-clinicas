import { describe, expect, it } from "vitest";
import { searchClinicsByName } from "./clinicSearch";

describe("searchClinicsByName", () => {
  const clinics = [
    { id: 1, name: "Clínica Esperança" },
    { id: 2, name: "Centro Médico Luanda" },
    { id: 3, name: "Clínica Vida" },
  ];

  it("returns every clinic for an empty query", () => {
    expect(searchClinicsByName(clinics, "")).toEqual(clinics);
    expect(searchClinicsByName(clinics, "   ")).toEqual(clinics);
  });

  it("matches names without case sensitivity", () => {
    expect(searchClinicsByName(clinics, "LUANDA")).toEqual([clinics[1]]);
  });

  it("returns an empty list when there is no match", () => {
    expect(searchClinicsByName(clinics, "Pediatria")).toEqual([]);
  });
});
