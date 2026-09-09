export interface RsvpLabels {
  comingThankYou: string;
  notComingThankYou: string;
  error: string;
  nameRequired: string;
  alreadyRespondedComing: string;
  alreadyRespondedNotComing: string;
  modalComingTitle: string;
  modalNotComingTitle: string;
}

export function renderClientScript(slug: string, eventDateTimeIso: string, labels: RsvpLabels): string {
  const statusStorageKey = `taklifnoma_rsvp_status_${slug}`;

  return `
(function () {
  var eventDate = new Date(${JSON.stringify(eventDateTimeIso)});
  function pad(n) { return String(n).padStart(2, "0"); }
  function tick() {
    var diff = Math.max(0, eventDate.getTime() - Date.now());
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var minutes = Math.floor((diff % 3600000) / 60000);
    var seconds = Math.floor((diff % 60000) / 1000);
    var el = document.querySelector('[data-countdown="days"]'); if (el) el.textContent = String(days);
    el = document.querySelector('[data-countdown="hours"]'); if (el) el.textContent = pad(hours);
    el = document.querySelector('[data-countdown="minutes"]'); if (el) el.textContent = pad(minutes);
    el = document.querySelector('[data-countdown="seconds"]'); if (el) el.textContent = pad(seconds);
  }
  tick();
  setInterval(tick, 1000);

  // A stable per-browser id, kept in localStorage, so submitting twice —
  // a double-tap, or reopening the same link later — updates this guest's
  // one response instead of adding a duplicate to the list and pinging
  // the owner again.
  function getGuestToken() {
    try {
      var key = "taklifnoma_guest_token";
      var existing = window.localStorage.getItem(key);
      if (existing) return existing;
      var token = (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
      window.localStorage.setItem(key, token);
      return token;
    } catch (e) {
      return null;
    }
  }

  // Remembers this guest's answer for THIS invitation specifically (unlike
  // the guest token above, which is shared across every invitation opened
  // from this browser), so reopening the link later shows "you already
  // responded" instead of silently re-showing a blank form.
  var statusKey = ${JSON.stringify(statusStorageKey)};
  function getSavedStatus() {
    try { return window.localStorage.getItem(statusKey); } catch (e) { return null; }
  }
  function saveStatus(status) {
    try { window.localStorage.setItem(statusKey, status); } catch (e) {}
  }

  var buttonsWrap = document.querySelector("[data-rsvp-buttons]");
  var messageEl = document.querySelector("[data-rsvp-message]");
  var changeBtn = document.querySelector("[data-rsvp-change]");
  var modalOverlay = document.querySelector("[data-rsvp-modal-overlay]");
  var modal = document.querySelector("[data-rsvp-modal]");
  var modalTitle = document.querySelector("[data-rsvp-modal-title]");
  var modalError = document.querySelector("[data-rsvp-modal-error]");
  var modalClose = document.querySelector("[data-rsvp-modal-close]");
  var modalCancel = document.querySelector("[data-rsvp-modal-cancel]");
  var form = document.querySelector("[data-rsvp-form]");
  var nameInput = document.querySelector("[data-rsvp-name-input]");

  var modalTitles = {
    COMING: ${JSON.stringify(labels.modalComingTitle)},
    NOT_COMING: ${JSON.stringify(labels.modalNotComingTitle)}
  };
  var thankYouLabels = {
    COMING: ${JSON.stringify(labels.comingThankYou)},
    NOT_COMING: ${JSON.stringify(labels.notComingThankYou)}
  };
  var alreadyRespondedLabels = {
    COMING: ${JSON.stringify(labels.alreadyRespondedComing)},
    NOT_COMING: ${JSON.stringify(labels.alreadyRespondedNotComing)}
  };

  // A template's own stylesheet can give ".rsvp__buttons" (or any other
  // class we share with it) an explicit "display", which then outranks the
  // browser's default [hidden] rule at equal specificity. Setting the
  // inline style directly always wins, so hide()/show() are used for every
  // element toggled here instead of the "hidden" property alone — that
  // stays too, only for its semantic/accessibility meaning.
  function hide(el) {
    if (!el) return;
    el.hidden = true;
    el.style.display = "none";
  }
  function show(el) {
    if (!el) return;
    el.hidden = false;
    el.style.display = "";
  }

  function showRespondedState(status, freshlySubmitted) {
    hide(buttonsWrap);
    if (messageEl) {
      messageEl.textContent = freshlySubmitted ? thankYouLabels[status] : alreadyRespondedLabels[status];
      show(messageEl);
    }
    show(changeBtn);
  }

  var savedStatus = getSavedStatus();
  if (savedStatus) showRespondedState(savedStatus, false);

  function openModal(status) {
    if (!modalOverlay || !modal) return;
    modal.setAttribute("data-selected-status", status);
    if (modalTitle) modalTitle.textContent = modalTitles[status] || "";
    hide(modalError);
    if (nameInput) nameInput.value = "";
    show(modalOverlay);
    if (nameInput) nameInput.focus();
  }
  function closeModal() {
    hide(modalOverlay);
  }

  if (buttonsWrap) {
    var triggers = buttonsWrap.querySelectorAll("[data-status]");
    for (var i = 0; i < triggers.length; i++) {
      triggers[i].addEventListener("click", function (event) {
        openModal(event.currentTarget.getAttribute("data-status"));
      });
    }
  }
  if (changeBtn) {
    changeBtn.addEventListener("click", function () {
      hide(changeBtn);
      hide(messageEl);
      show(buttonsWrap);
    });
  }
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalCancel) modalCancel.addEventListener("click", closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener("click", function (event) {
      if (event.target === modalOverlay) closeModal();
    });
  }

  if (form) {
    var confirmBtn = form.querySelector("[data-rsvp-confirm]");
    var setFormDisabled = function (disabled) {
      if (confirmBtn) confirmBtn.disabled = disabled;
      if (nameInput) nameInput.disabled = disabled;
    };

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var status = modal ? modal.getAttribute("data-selected-status") : null;
      var guestName = nameInput ? nameInput.value.trim() : "";
      if (!guestName) {
        if (modalError) modalError.textContent = ${JSON.stringify(labels.nameRequired)};
        show(modalError);
        return;
      }

      // Disabled immediately (not just after the request resolves) so a
      // second click while the first request is still in flight can't
      // fire a second, conflicting submission.
      setFormDisabled(true);

      fetch(${JSON.stringify(`/${slug}/rsvp`)}, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ guestName: guestName, status: status, guestToken: getGuestToken() }),
      })
        .then(function (res) {
          if (!res.ok) throw new Error("failed");
          return res.json();
        })
        .then(function (result) {
          setFormDisabled(false);
          closeModal();
          saveStatus(result.status);
          showRespondedState(result.status, true);
        })
        .catch(function () {
          setFormDisabled(false);
          if (modalError) modalError.textContent = ${JSON.stringify(labels.error)};
          show(modalError);
        });
    });
  }

  var musicButton = document.querySelector("[data-music-toggle]");
  var musicAudio = document.querySelector("[data-music-audio]");
  if (musicButton && musicAudio) {
    musicButton.addEventListener("click", function () {
      if (musicAudio.paused) {
        musicAudio.play();
        musicButton.classList.add("music-toggle--playing");
      } else {
        musicAudio.pause();
        musicButton.classList.remove("music-toggle--playing");
      }
    });
  }
})();
`;
}
