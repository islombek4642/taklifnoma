// Used only if the invitation's template can't be resolved (backend
// unreachable, or its templateId doesn't match any registered template) —
// keeps the page readable instead of rendering fully unstyled.
export const FALLBACK_STYLE = `
  :root { font-family: system-ui, sans-serif; }
  body { margin: 0; padding: 0 1rem 4rem; }
  section { padding: 2rem 0; text-align: center; }
  .countdown { display: flex; justify-content: center; gap: 1.5rem; }
  .rsvp__buttons { display: flex; justify-content: center; gap: 1rem; margin-top: 1rem; }
  .music-toggle {
    position: fixed; bottom: 1.5rem; right: 1.5rem;
    width: 3rem; height: 3rem; border-radius: 50%; border: none;
    font-size: 1.25rem; cursor: pointer;
  }
`;
