import type { TFunction } from "i18next";
import { FALLBACK_STYLE } from "../constants/fallback-style.js";

export function renderNotFoundPage(t: TFunction): string {
  return `<!doctype html>
<html lang="uz">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${t("notFound.title")}</title>
<style>${FALLBACK_STYLE}</style>
</head>
<body>
<section class="not-found">
<h1>${t("notFound.title")}</h1>
<p>${t("notFound.subtitle")}</p>
</section>
</body>
</html>`;
}
