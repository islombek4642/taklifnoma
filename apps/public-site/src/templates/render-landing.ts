import type { TFunction } from "i18next";
import type { TemplateDto } from "../services/backend-api-client.js";
import { escapeHtml } from "./sanitize.js";
import { LANDING_STYLE } from "../constants/landing-style.js";

const FEATURE_KEYS = ["templates", "rsvp", "share", "free"] as const;
const FEATURE_ICONS: Record<(typeof FEATURE_KEYS)[number], string> = {
  templates: "❖",
  rsvp: "✓",
  share: "↗",
  free: "⚡",
};

const STEP_KEYS = ["1", "2", "3", "4"] as const;

// The marketing homepage at "/" — distinct from an individual invitation's
// "/{slug}" page. Without this, opening the bare domain (or a search
// engine indexing it) hit the generic "invitation not found" page instead
// of something that explains what Taklifnoma is.
export function renderLandingPage(t: TFunction, templates: TemplateDto[], botUsername: string): string {
  const botLink = `https://t.me/${encodeURIComponent(botUsername)}`;

  const features = FEATURE_KEYS.map(
    (key) => `
      <div class="landing__feature">
        <div class="landing__feature-icon">${FEATURE_ICONS[key]}</div>
        <h3>${t(`landing.features.items.${key}.title`)}</h3>
        <p>${t(`landing.features.items.${key}.text`)}</p>
      </div>
    `,
  ).join("");

  const steps = STEP_KEYS.map(
    (key) => `
      <div class="landing__step">
        <div class="landing__step-number">${key}</div>
        <div>
          <h3>${t(`landing.howItWorks.steps.${key}.title`)}</h3>
          <p>${t(`landing.howItWorks.steps.${key}.text`)}</p>
        </div>
      </div>
    `,
  ).join("");

  const templateCards = templates
    .map(
      (template) => `
        <a class="landing__template-card" href="/preview/${encodeURIComponent(template.id)}">
          <div class="landing__template-swatch" style="background: ${escapeHtml(template.accentColor)}"></div>
          <div class="landing__template-info">
            <strong>${escapeHtml(template.name)}</strong>
            <span>${escapeHtml(template.description)}</span>
          </div>
          <span class="landing__template-view">${t("landing.templates.viewButton")}</span>
        </a>
      `,
    )
    .join("");

  return `<!doctype html>
<html lang="uz">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${t("landing.meta.title")}</title>
<meta name="description" content="${t("landing.meta.description")}" />
<style>${LANDING_STYLE}</style>
</head>
<body>
  <section class="landing__hero">
    <span class="landing__eyebrow">${t("landing.hero.eyebrow")}</span>
    <h1>${t("landing.hero.title")}</h1>
    <p>${t("landing.hero.subtitle")}</p>
    <a class="landing__cta" href="${botLink}">${t("landing.hero.cta")}</a>
  </section>

  <section class="landing__section">
    <h2 class="landing__section-title">${t("landing.features.title")}</h2>
    <div class="landing__features">${features}</div>
  </section>

  <section class="landing__section">
    <h2 class="landing__section-title">${t("landing.howItWorks.title")}</h2>
    <div class="landing__steps">${steps}</div>
  </section>

  ${
    templateCards.length > 0
      ? `
  <section class="landing__section">
    <h2 class="landing__section-title">${t("landing.templates.title")}</h2>
    <p class="landing__section-subtitle">${t("landing.templates.subtitle")}</p>
    <div class="landing__templates">${templateCards}</div>
  </section>
  `
      : ""
  }

  <section class="landing__section">
    <div class="landing__final-cta">
      <h2>${t("landing.finalCta.title")}</h2>
      <p>${t("landing.finalCta.subtitle")}</p>
      <a class="landing__cta" href="${botLink}">${t("landing.finalCta.button")}</a>
    </div>
  </section>

  <footer class="landing__footer">${t("landing.footer.text", { year: new Date().getFullYear() })}</footer>
</body>
</html>`;
}
