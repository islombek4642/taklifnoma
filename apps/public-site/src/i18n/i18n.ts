import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import i18next, { type i18n as I18nInstance } from "i18next";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.join(__dirname, "..", "locales");

function loadLocale(code: string): Record<string, unknown> {
  const filePath = path.join(LOCALES_DIR, `${code}.json`);
  return JSON.parse(readFileSync(filePath, "utf-8")) as Record<string, unknown>;
}

export function createI18n(): I18nInstance {
  const instance = i18next.createInstance();
  void instance.init({
    lng: "uz",
    fallbackLng: "uz",
    resources: {
      uz: { translation: loadLocale("uz") },
      ru: { translation: loadLocale("ru") },
      en: { translation: loadLocale("en") },
    },
    interpolation: { escapeValue: false },
  });
  return instance;
}
