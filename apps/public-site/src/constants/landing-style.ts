// The marketing landing page at "/" is the product's own face, not a
// per-invitation page — so unlike FALLBACK_STYLE/MODAL_STYLE it never
// depends on any invitation template's CSS variables. Palette mirrors the
// Mini App's own design tokens (apps/miniapp/src/styles/tokens.css) so the
// two feel like one product.
export const LANDING_STYLE = `
  :root {
    --bg: oklch(97% 0.015 65);
    --surface: oklch(99% 0.006 65);
    --surface-alt: oklch(94% 0.03 55);
    --text: oklch(28% 0.035 25);
    --text-muted: oklch(50% 0.02 30);
    --accent: oklch(58% 0.11 25);
    --accent-deep: oklch(45% 0.1 22);
    --accent-soft: oklch(92% 0.035 35);
    --border: oklch(90% 0.018 55);
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  h1,
  h2,
  h3 {
    font-family: Georgia, "Iowan Old Style", "Palatino Linotype", Palatino, serif;
    font-weight: 600;
    margin: 0;
  }

  a {
    color: inherit;
  }

  .landing__section {
    max-width: 640px;
    margin: 0 auto;
    padding: 3.5rem 1.5rem;
  }

  .landing__hero {
    text-align: center;
    padding: 4.5rem 1.5rem 3.5rem;
    background: linear-gradient(180deg, var(--surface-alt), var(--bg) 70%);
  }

  .landing__eyebrow {
    display: inline-block;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent-deep);
    background: var(--accent-soft);
    padding: 0.35rem 0.9rem;
    border-radius: 999px;
    margin-bottom: 1.25rem;
  }

  .landing__hero h1 {
    font-size: 2.1rem;
    line-height: 1.25;
    margin-bottom: 1rem;
  }

  .landing__hero p {
    font-size: 1.05rem;
    color: var(--text-muted);
    line-height: 1.6;
    max-width: 420px;
    margin: 0 auto 2rem;
  }

  .landing__cta {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.9rem 2rem;
    border-radius: 999px;
    background: var(--accent);
    color: white;
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
    box-shadow: 0 10px 24px oklch(45% 0.1 22 / 0.28);
  }

  .landing__section-title {
    text-align: center;
    font-size: 1.6rem;
    margin-bottom: 0.5rem;
  }

  .landing__section-subtitle {
    text-align: center;
    color: var(--text-muted);
    margin-bottom: 2.5rem;
  }

  .landing__features {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }

  .landing__feature {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 1.5rem 1.25rem;
    text-align: center;
  }

  .landing__feature-icon {
    width: 44px;
    height: 44px;
    margin: 0 auto 0.85rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent-soft);
    color: var(--accent-deep);
    font-size: 1.2rem;
  }

  .landing__feature h3 {
    font-size: 1rem;
    margin-bottom: 0.4rem;
  }

  .landing__feature p {
    font-size: 0.85rem;
    color: var(--text-muted);
    line-height: 1.5;
    margin: 0;
  }

  .landing__steps {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .landing__step {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }

  .landing__step-number {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--accent);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-family: Georgia, serif;
  }

  .landing__step h3 {
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }

  .landing__step p {
    font-size: 0.9rem;
    color: var(--text-muted);
    margin: 0;
    line-height: 1.5;
  }

  .landing__templates {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .landing__template-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1rem 1.25rem;
    text-decoration: none;
    color: var(--text);
  }

  .landing__template-swatch {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 2px 8px oklch(28% 0.035 25 / 0.15);
  }

  .landing__template-info {
    flex: 1;
  }

  .landing__template-info strong {
    display: block;
    font-family: Georgia, serif;
    font-size: 1.05rem;
    margin-bottom: 0.15rem;
  }

  .landing__template-info span {
    font-size: 0.82rem;
    color: var(--text-muted);
  }

  .landing__template-view {
    flex-shrink: 0;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--accent-deep);
    white-space: nowrap;
  }

  .landing__final-cta {
    text-align: center;
    background: var(--accent-soft);
    border-radius: 24px;
    padding: 3rem 1.5rem;
  }

  .landing__final-cta h2 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .landing__final-cta p {
    color: var(--text-muted);
    margin-bottom: 1.75rem;
  }

  .landing__footer {
    text-align: center;
    padding: 2rem 1.5rem 3rem;
    color: var(--text-muted);
    font-size: 0.82rem;
  }

  @media (max-width: 420px) {
    .landing__features {
      grid-template-columns: 1fr;
    }
  }
`;
