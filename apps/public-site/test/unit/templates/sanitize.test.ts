import { describe, expect, it } from "vitest";
import { escapeHtml, isSafeHttpUrl } from "../../../src/templates/sanitize.js";

describe("escapeHtml", () => {
  it("escapes the five HTML-significant characters", () => {
    expect(escapeHtml(`<script>alert('x') & "y"</script>`)).toBe(
      "&lt;script&gt;alert(&#39;x&#39;) &amp; &quot;y&quot;&lt;/script&gt;",
    );
  });

  it("leaves ordinary text untouched", () => {
    expect(escapeHtml("Ulug'bek & Malika")).toBe("Ulug&#39;bek &amp; Malika");
  });
});

describe("isSafeHttpUrl", () => {
  it("accepts http and https URLs", () => {
    expect(isSafeHttpUrl("https://maps.google.com/?q=1,2")).toBe(true);
    expect(isSafeHttpUrl("http://example.com")).toBe(true);
  });

  it("rejects javascript: and other non-http schemes", () => {
    expect(isSafeHttpUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeHttpUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
  });

  it("rejects malformed URLs", () => {
    expect(isSafeHttpUrl("not a url")).toBe(false);
  });
});
