import { describe, expect, it } from "vitest";
import { createI18n } from "../../../src/i18n/i18n.js";
import { renderLandingPage } from "../../../src/templates/render-landing.js";
import type { TemplateDto } from "../../../src/services/backend-api-client.js";

const i18n = createI18n();
const t = i18n.t.bind(i18n);

const templates: TemplateDto[] = [
  { id: "classic", name: "Klassik", description: "Iliq uslub", accentColor: "#b45d52", styleCss: "" },
];

describe("renderLandingPage", () => {
  it("links the hero and final CTAs to the bot", () => {
    const html = renderLandingPage(t, templates, "taklifnoma_bot");

    expect(html).toContain('href="https://t.me/taklifnoma_bot"');
    // Two CTAs: one in the hero, one at the bottom.
    expect(html.split('href="https://t.me/taklifnoma_bot"').length - 1).toBe(2);
  });

  it("URL-encodes an unusual bot username", () => {
    const html = renderLandingPage(t, templates, "weird bot/name");

    expect(html).toContain(`href="https://t.me/${encodeURIComponent("weird bot/name")}"`);
  });

  it("lists each template with a link to its live preview", () => {
    const html = renderLandingPage(t, templates, "taklifnoma_bot");

    expect(html).toContain('href="/preview/classic"');
    expect(html).toContain("Klassik");
    expect(html).toContain("Iliq uslub");
  });

  it("escapes template names and descriptions (content data, not trusted markup)", () => {
    const html = renderLandingPage(
      t,
      [{ id: "x", name: '<script>alert(1)</script>', description: "A & B", accentColor: "#fff", styleCss: "" }],
      "taklifnoma_bot",
    );

    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("A &amp; B");
  });

  it("omits the templates section entirely when there are none yet", () => {
    const html = renderLandingPage(t, [], "taklifnoma_bot");

    // The stylesheet always defines .landing__templates (it's always
    // inlined), so check for the rendered section markup specifically.
    expect(html).not.toContain('<div class="landing__templates">');
    expect(html).not.toContain(t("landing.templates.title"));
  });

  it("includes the current year in the footer", () => {
    const html = renderLandingPage(t, templates, "taklifnoma_bot");

    expect(html).toContain(String(new Date().getFullYear()));
  });
});
