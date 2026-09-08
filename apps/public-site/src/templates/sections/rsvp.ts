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
    </section>
  `;
}
