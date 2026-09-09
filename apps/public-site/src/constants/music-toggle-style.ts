// The music toggle button is not part of any per-invitation template —
// like MODAL_STYLE, it's always inlined in render-page.ts after the
// template's own <style> and namespaced with "taklifnoma-" so a template's
// CSS can never collide with or override it, while still picking up the
// template's palette via its CSS custom properties (falling back to warm
// neutrals when a template doesn't define them).
export const MUSIC_TOGGLE_STYLE = `
  .taklifnoma-music-toggle {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    width: 3.25rem;
    height: 3.25rem;
    border-radius: 50%;
    border: none;
    background: var(--accent, #b5673c);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    box-shadow: 0 8px 20px oklch(20% 0.02 30 / 0.35);
    z-index: 900;
  }

  .taklifnoma-music-toggle__wave {
    display: none;
    align-items: flex-end;
    justify-content: center;
    gap: 3px;
    height: 18px;
  }
  .taklifnoma-music-toggle--playing .taklifnoma-music-toggle__icon {
    display: none;
  }
  .taklifnoma-music-toggle--playing .taklifnoma-music-toggle__wave {
    display: flex;
  }

  .taklifnoma-music-toggle__wave span {
    display: block;
    width: 3px;
    background: white;
    border-radius: 2px;
    animation: taklifnoma-music-wave 0.9s ease-in-out infinite;
  }
  .taklifnoma-music-toggle__wave span:nth-child(1) {
    height: 40%;
    animation-delay: 0s;
  }
  .taklifnoma-music-toggle__wave span:nth-child(2) {
    height: 100%;
    animation-delay: 0.15s;
  }
  .taklifnoma-music-toggle__wave span:nth-child(3) {
    height: 65%;
    animation-delay: 0.3s;
  }
  .taklifnoma-music-toggle__wave span:nth-child(4) {
    height: 85%;
    animation-delay: 0.45s;
  }

  @keyframes taklifnoma-music-wave {
    0%,
    100% {
      transform: scaleY(0.4);
    }
    50% {
      transform: scaleY(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .taklifnoma-music-toggle__wave span {
      animation: none;
      transform: scaleY(0.7);
    }
  }
`;
