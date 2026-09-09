import type { TFunction } from "i18next";

export function renderRsvpSection(t: TFunction): string {
  return `
    <section class="rsvp" id="rsvp">
      <h2>${t("rsvp.title")}</h2>
      <div class="rsvp__buttons" data-rsvp-buttons>
        <button type="button" data-status="COMING">${t("rsvp.comingButton")}</button>
        <button type="button" data-status="NOT_COMING">${t("rsvp.notComingButton")}</button>
      </div>
      <p class="rsvp__message" data-rsvp-message hidden></p>
      <button type="button" class="taklifnoma-rsvp-change" data-rsvp-change hidden>${t("rsvp.changeResponse")}</button>
    </section>

    <div class="taklifnoma-modal-overlay" data-rsvp-modal-overlay hidden>
      <div class="taklifnoma-modal" role="dialog" aria-modal="true" data-rsvp-modal>
        <button type="button" class="taklifnoma-modal__close" data-rsvp-modal-close aria-label="${t("rsvp.modalClose")}">&times;</button>
        <div class="taklifnoma-modal__ornament" aria-hidden="true"></div>
        <h3 class="taklifnoma-modal__title" data-rsvp-modal-title></h3>
        <form class="taklifnoma-modal__form" data-rsvp-form>
          <input type="text" name="guestName" placeholder="${t("rsvp.namePlaceholder")}" required maxlength="100" data-rsvp-name-input />
          <p class="taklifnoma-modal__error" data-rsvp-modal-error hidden></p>
          <button type="submit" class="taklifnoma-modal__confirm" data-rsvp-confirm>${t("rsvp.confirmButton")}</button>
          <button type="button" class="taklifnoma-modal__cancel" data-rsvp-modal-cancel>${t("rsvp.cancelButton")}</button>
        </form>
        <div class="taklifnoma-modal__ornament taklifnoma-modal__ornament--bottom" aria-hidden="true"></div>
      </div>
    </div>
  `;
}
