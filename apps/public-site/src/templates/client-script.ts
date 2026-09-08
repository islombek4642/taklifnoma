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

  var form = document.querySelector("[data-rsvp-form]");
  var messageEl = document.querySelector("[data-rsvp-message]");
  if (form) {
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
      fetch(${JSON.stringify(`/${slug}/rsvp`)}, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ guestName: guestName, status: status }),
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
