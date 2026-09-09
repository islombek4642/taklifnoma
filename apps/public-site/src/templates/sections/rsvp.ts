import type { TFunction } from "i18next";

export function renderRsvpSection(t: TFunction): string {
  return `
    <section class="rsvp" id="rsvp">
      <h2>${t("rsvp.title")}</h2>
      <form class="rsvp__form" data-rsvp-form>
        <input type="text" name="guestName" placeholder="${t("rsvp.namePlaceholder")}" required maxlength="100" />
        <div class="rsvp__buttons">
          <button type="submit" data-status="COMING">${t("rsvp.comingButton")}</button>
          <button type="submit" data-status="NOT_COMING">${t("rsvp.notComingButton")}</button>
        </div>
        <p class="rsvp__message" data-rsvp-message hidden></p>
      </form>
      <p class="rsvp__message" data-rsvp-status-message hidden></p>
      <button type="button" class="taklifnoma-rsvp-change" data-rsvp-change hidden>${t("rsvp.changeResponse")}</button>
    </section>

    <div class="taklifnoma-modal-overlay" data-rsvp-modal-overlay hidden>
      <div class="taklifnoma-modal" role="dialog" aria-modal="true" data-rsvp-modal>
        <button type="button" class="taklifnoma-modal__close" data-rsvp-modal-close aria-label="${t("rsvp.modalClose")}">&times;</button>
        <div class="taklifnoma-modal__ornament" aria-hidden="true"></div>
        <p class="taklifnoma-modal__message" data-rsvp-modal-message></p>
        <div class="taklifnoma-modal__ornament taklifnoma-modal__ornament--bottom" aria-hidden="true"></div>
      </div>
    </div>
  `;
}
