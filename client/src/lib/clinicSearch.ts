export type ClinicSearchItem = {
  name?: string | null;
};

/**
 * Keeps the public search intentionally simple: one query, matched against
 * the clinic name, with whitespace and letter casing normalized.
 */
export function searchClinicsByName<T extends ClinicSearchItem>(
  clinics: T[],
  query: string,
): T[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (!normalizedQuery) {
    return clinics;
  }

  return clinics.filter((clinic) =>
    String(clinic.name ?? "")
      .toLocaleLowerCase()
      .includes(normalizedQuery),
  );
}
