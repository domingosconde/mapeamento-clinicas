import { describe, expect, it } from "vitest";
import { decodeOAuthState } from "./_core/sdk";

describe("OAuth state parsing", () => {
  it("extracts redirectUri from the structured state used by return paths", () => {
    const state = Buffer.from(
      JSON.stringify({
        redirectUri: "https://example.test/api/oauth/callback",
        returnPath: "/appointments",
      }),
      "utf8",
    ).toString("base64");

    expect(decodeOAuthState(state)).toBe("https://example.test/api/oauth/callback");
  });

  it("keeps compatibility with the legacy opaque state format", () => {
    const state = Buffer.from("https://example.test/api/oauth/callback", "utf8").toString("base64");
    expect(decodeOAuthState(state)).toBe("https://example.test/api/oauth/callback");
  });
});
