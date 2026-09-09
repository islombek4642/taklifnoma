// Shown only on the template-preview page (opened via "Ko'rish" from the
// Mini App's template gallery) so it's obvious the page is a design demo,
// not a real invitation — kept as a separate always-inlined block for the
// same reason as MODAL_STYLE: it must render the same regardless of which
// template's CSS is active.
export const PREVIEW_BADGE_STYLE = `
  .taklifnoma-preview-badge {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999;
    padding: 0.6rem 1rem;
    text-align: center;
    font-family: system-ui, sans-serif;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    background: oklch(20% 0.02 30 / 0.85);
    color: white;
    backdrop-filter: blur(4px);
  }
`;
