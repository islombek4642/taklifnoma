export interface RsvpLabels {
  comingThankYou: string;
  notComingThankYou: string;
  error: string;
  nameRequired: string;
  alreadyRespondedComing: string;
  alreadyRespondedNotComing: string;
}

export interface RenderClientScriptOptions {
  // The template-preview page ("Ko'rish" from the home screen's template
  // gallery) renders this exact script so the RSVP flow looks and feels
  // real, but there's no actual invitation behind it — so a submit there
  // must never hit the network or touch localStorage, just show the
  // thank-you modal locally.
  previewMode?: boolean;
}

export function renderClientScript(
  slug: string,
  eventDateTimeIso: string,
  labels: RsvpLabels,
  options?: RenderClientScriptOptions,
): string {
  const statusStorageKey = `taklifnoma_rsvp_status_${slug}`;
  const previewMode = options?.previewMode === true;

  return `
(function () {
  var previewMode = ${JSON.stringify(previewMode)};
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

  var form = document.querySelector("[data-rsvp-form]");
  var messageEl = document.querySelector("[data-rsvp-message]");
  var statusMessageEl = document.querySelector("[data-rsvp-status-message]");
  var changeBtn = document.querySelector("[data-rsvp-change]");
  var nameInput = form ? form.querySelector('[name="guestName"]') : null;
  var modalOverlay = document.querySelector("[data-rsvp-modal-overlay]");
  var modalMessage = document.querySelector("[data-rsvp-modal-message]");
  var modalClose = document.querySelector("[data-rsvp-modal-close]");

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

  function showRespondedState(status) {
    hide(form);
    if (statusMessageEl) {
      statusMessageEl.textContent = alreadyRespondedLabels[status];
      show(statusMessageEl);
    }
    show(changeBtn);
  }

  if (!previewMode) {
    var savedStatus = getSavedStatus();
    if (savedStatus) showRespondedState(savedStatus);
  }

  function openThankYouModal(status) {
    if (!modalOverlay || !modalMessage) return;
    modalMessage.textContent = thankYouLabels[status] || "";
    show(modalOverlay);
  }
  function closeModal() {
    hide(modalOverlay);
  }
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener("click", function (event) {
      if (event.target === modalOverlay) closeModal();
    });
  }

  if (changeBtn) {
    changeBtn.addEventListener("click", function () {
      hide(changeBtn);
      hide(statusMessageEl);
      if (form) {
        if (nameInput) nameInput.value = "";
        hide(messageEl);
        show(form);
      }
    });
  }

  if (form) {
    var buttons = form.querySelectorAll("[data-status]");
    var setButtonsDisabled = function (disabled) {
      for (var i = 0; i < buttons.length; i++) buttons[i].disabled = disabled;
    };

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var submitter = event.submitter;
      var status = submitter ? submitter.getAttribute("data-status") : null;
      var guestName = nameInput ? nameInput.value.trim() : "";
      if (!guestName) {
        if (messageEl) { messageEl.hidden = false; messageEl.textContent = ${JSON.stringify(labels.nameRequired)}; }
        return;
      }

      if (previewMode) {
        openThankYouModal(status);
        showRespondedState(status);
        return;
      }

      // Disabled immediately (not just after the request resolves) so a
      // second click while the first request is still in flight can't
      // fire a second, conflicting submission.
      setButtonsDisabled(true);

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
          setButtonsDisabled(false);
          saveStatus(result.status);
          openThankYouModal(result.status);
          showRespondedState(result.status);
        })
        .catch(function () {
          setButtonsDisabled(false);
          if (messageEl) { messageEl.hidden = false; messageEl.textContent = ${JSON.stringify(labels.error)}; }
        });
    });
  }

  var musicButton = document.querySelector("[data-music-toggle]");
  var musicAudio = document.querySelector("[data-music-audio]");
  if (musicButton && musicAudio) {
    var setPlayingState = function (playing) {
      if (playing) {
        musicButton.classList.add("taklifnoma-music-toggle--playing");
      } else {
        musicButton.classList.remove("taklifnoma-music-toggle--playing");
      }
    };

    // Tries to start music the moment the page loads. Browsers only allow
    // this for audio that starts muted, or once the guest has already
    // interacted with the page/site — so this can silently fail (no error,
    // audio just stays paused), which is why the button below is still
    // always there as a fallback: tapping it always works, autoplay or not.
    var autoplayAttempt = musicAudio.play();
    if (autoplayAttempt && typeof autoplayAttempt.then === "function") {
      autoplayAttempt.then(function () { setPlayingState(true); }).catch(function () {});
    }

    musicButton.addEventListener("click", function () {
      if (musicAudio.paused) {
        musicAudio.play();
        setPlayingState(true);
      } else {
        musicAudio.pause();
        setPlayingState(false);
      }
    });
  }
})();
`;
}
