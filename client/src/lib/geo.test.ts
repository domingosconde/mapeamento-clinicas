import { describe, expect, it } from "vitest";
import { distanceInKm } from "./geo";

describe("distanceInKm", () => {
  it("returns zero for identical coordinates", () => {
    expect(distanceInKm({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 0 })).toBe(0);
  });

  it("calculates a realistic distance between Luanda and a nearby point", () => {
    const distance = distanceInKm(
      { latitude: -8.8383, longitude: 13.2344 },
      { latitude: -8.85, longitude: 13.27 },
    );
    expect(distance).toBeGreaterThan(3);
    expect(distance).toBeLessThan(5);
  });
});
