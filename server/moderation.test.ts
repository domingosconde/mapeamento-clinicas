import { describe, expect, it } from "vitest";
import { moderateCommentText } from "./moderation";

describe("moderateCommentText", () => {
  it("approves normal patient feedback", () => {
    expect(moderateCommentText("Atendimento acolhedor e pontual.")).toEqual({
      approved: true,
      reason: null,
    });
  });

  it("holds content that matches the spam policy", () => {
    const result = moderateCommentText("Este comentário é spam");
    expect(result.approved).toBe(false);
    expect(result.reason).toContain("spam");
  });

  it("holds content with excessive repeated characters", () => {
    expect(moderateCommentText("Excelente!!!!!!!!").approved).toBe(false);
  });
});
