import { createFeedbackMailto } from "../email";

describe("createFeedbackMailto", () => {
  it("should generate a basic mailto link with recipient", () => {
    const url = createFeedbackMailto("test@example.com");
    expect(url).toBe("mailto:test@example.com");
  });

  it("should include subject if provided", () => {
    const url = createFeedbackMailto("test@example.com", "Test Subject");
    expect(url).toBe("mailto:test@example.com?subject=Test%20Subject");
  });

  it("should include body if provided", () => {
    const url = createFeedbackMailto(
      "test@example.com",
      "Test Subject",
      "Hello World",
    );
    expect(url).toBe(
      "mailto:test@example.com?subject=Test%20Subject&body=Hello%20World",
    );
  });

  it("should handle special characters in subject and body", () => {
    const url = createFeedbackMailto(
      "test@example.com",
      "Hata & İstek",
      "Satır 1\nSatır 2",
    );
    expect(url).toContain("subject=Hata%20%26%20%C4%B0stek");
    expect(url).toContain("body=Sat%C4%B1r%201%0ASat%C4%B1r%202");
  });
});
