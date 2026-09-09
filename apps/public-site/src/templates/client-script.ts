export interface RsvpLabels {
  comingThankYou: string;
  notComingThankYou: string;
  error: string;
  nameRequired: string;
}

export function renderClientScript(slug: string, eventDateTimeIso: string, labels: RsvpLabels): string {
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

  var form = document.querySelector("[data-rsvp-form]");
  var messageEl = document.querySelector("[data-rsvp-message]");
  if (form) {
    var buttons = form.querySelectorAll("[data-status]");
    var setButtonsDisabled = function (disabled) {
      for (var i = 0; i < buttons.length; i++) buttons[i].disabled = disabled;
    };

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var submitter = event.submitter;
      var status = submitter ? submitter.getAttribute("data-status") : null;
      var nameInput = form.querySelector('[name="guestName"]');
      var guestName = nameInput ? nameInput.value.trim() : "";
      if (!guestName) {
        if (messageEl) { messageEl.hidden = false; messageEl.textContent = ${JSON.stringify(labels.nameRequired)}; }
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
          form.hidden = true;
          if (messageEl) {
            messageEl.hidden = false;
            messageEl.textContent = result.status === "COMING" ? ${JSON.stringify(labels.comingThankYou)} : ${JSON.stringify(labels.notComingThankYou)};
          }
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
