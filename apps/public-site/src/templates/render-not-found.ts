import type { TFunction } from "i18next";
import { INLINE_STYLES } from "./styles.js";

export function renderNotFoundPage(t: TFunction): string {
  return `<!doctype html>
<html lang="uz">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${t("notFound.title")}</title>
<style>${INLINE_STYLES}</style>
</head>
<body>
<section class="not-found">
<h1>${t("notFound.title")}</h1>
<p>${t("notFound.subtitle")}</p>
</section>
</body>
</html>`;
}
