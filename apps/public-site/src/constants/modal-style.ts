// The RSVP confirmation modal is not part of any per-invitation template —
// templates are swappable (and eventually admin-uploadable), but every guest
// must get the same trustworthy confirmation dialog regardless of which one
// is active. So this is always inlined in render-page.ts, after the
// template's own <style>, and every class here is prefixed "taklifnoma-" so
// a template's CSS can never accidentally collide with or override it. It
// still picks up each template's palette via the shared CSS custom
// properties (--accent, --surface, ...), falling back to warm neutrals when
// a template doesn't define them.
export const MODAL_STYLE = `
  .taklifnoma-modal-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.25rem;
    background: oklch(20% 0.02 30 / 0.55);
    backdrop-filter: blur(3px);
    z-index: 1000;
  }
  .taklifnoma-modal-overlay[hidden] {
    display: none;
  }

  .taklifnoma-modal {
    position: relative;
    width: 100%;
    max-width: 360px;
    padding: 2.5rem 1.75rem 1.75rem;
    background: var(--surface, #fffaf5);
    color: var(--text, #2b2320);
    border: 1px solid var(--border, #e8ddd0);
    border-radius: 22px;
    box-shadow: 0 24px 64px oklch(20% 0.02 30 / 0.35);
    text-align: center;
    overflow: hidden;
  }

  .taklifnoma-modal::before,
  .taklifnoma-modal::after {
    content: "";
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 72px;
    height: 6px;
    background-image: radial-gradient(circle, var(--accent, #b5673c) 1.4px, transparent 1.5px);
    background-size: 9px 6px;
    background-repeat: repeat-x;
    opacity: 0.5;
  }
  .taklifnoma-modal::before {
    top: 16px;
  }
  .taklifnoma-modal::after {
    bottom: 16px;
  }

  .taklifnoma-modal__close {
    position: absolute;
    top: 0.6rem;
    right: 0.6rem;
    width: 2rem;
    height: 2rem;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--text-muted, #8a7d70);
    font-size: 1.35rem;
    line-height: 1;
    cursor: pointer;
  }

  .taklifnoma-modal__ornament {
    width: 38px;
    height: 38px;
    margin: 0 auto 0.75rem;
    border: 1.5px solid var(--accent, #b5673c);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent, #b5673c);
    font-size: 1rem;
    opacity: 0.75;
  }
  .taklifnoma-modal__ornament::before {
    content: "❖";
  }
  .taklifnoma-modal__ornament--bottom {
    margin: 1.25rem auto 0;
  }

  .taklifnoma-modal__title {
    margin: 0 0 1.5rem;
    font-family: Georgia, "Iowan Old Style", "Palatino Linotype", Palatino, serif;
    font-size: 1.2rem;
    line-height: 1.4;
  }

  .taklifnoma-modal__form {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  .taklifnoma-modal__form input {
    width: 100%;
    padding: 0.85rem 1rem;
    border-radius: 14px;
    border: 1.5px solid var(--border, #e8ddd0);
    background: var(--bg, #fbf3ea);
    color: var(--text, #2b2320);
    font-size: 1rem;
    text-align: center;
  }

  .taklifnoma-modal__error {
    margin: 0;
    color: #b3261e;
    font-size: 0.85rem;
  }

  .taklifnoma-modal__confirm {
    padding: 0.85rem 1.5rem;
    border: none;
    border-radius: 999px;
    background: var(--accent, #b5673c);
    color: white;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
  }

  .taklifnoma-modal__confirm:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .taklifnoma-modal__cancel {
    padding: 0.5rem;
    border: none;
    background: transparent;
    color: var(--text-muted, #8a7d70);
    font-size: 0.9rem;
    text-decoration: underline;
    cursor: pointer;
  }

  .taklifnoma-rsvp-change {
    display: block;
    margin: 0.75rem auto 0;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--accent, #b5673c);
    font-size: 0.9rem;
    text-decoration: underline;
    cursor: pointer;
  }
  .taklifnoma-rsvp-change[hidden] {
    display: none;
  }
`;
