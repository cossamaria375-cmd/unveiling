/* ==========================================================================
   Tombstone Unveiling Invitation — script
   Sections: Welcome/Envelope → Home → Invitation → Location → RSVP
   ========================================================================== */

/* ----------------------------- Configuration ----------------------------- */

// Host & event details (used by RSVP WhatsApp message)
const EVENT = {
  title:    "Tombstone Unveiling",
  deceased: "Merriam Nteseng Tladi",
  date:     "Saturday, 26 December 2026",
  time:     "07H00",
  venue:    "80374 Majakaneng, Sgandaf Sec",
  family:   "The Tladi Family",
  rsvpPhone: "27738250030",          // International format, no '+'
  rsvpDisplay: "+27 73 825 0030",
};

// Background music — placeholder ambient track included (song.mp3).
// Replace song.mp3 with your own track (same filename) to swap the music.
const SONG_SRC = "song.mp3";


/* ----------------------------- State ----------------------------- */

let guests = 1;
let attending = "yes";
let musicOn = false;


/* ----------------------------- Welcome flow ----------------------------- */

function openInvitation() {
  const welcome = document.getElementById("welcome-screen");
  const env     = document.getElementById("envelope-scene");
  const site    = document.getElementById("website");

  // Hide welcome, show envelope scene (closed envelope visible)
  welcome.classList.add("hidden");
  env.classList.add("active");

  // Autoplay music on user gesture (click) — this is the explicit user interaction
  // that lets browsers permit audio playback.
  startMusicOnOpen();

  // After envelope scene fades in (~700ms), trigger the opening animation
  // by adding .opening class which drives the staged flap+letter reveal.
  // The actual opening is wired to the envelope click as well — see below.
  setTimeout(() => {
    env.classList.add("opening");
  }, 800);

  // After full envelope opening + hold (~4.5s total), reveal site
  setTimeout(() => {
    env.classList.remove("active", "opening");
    site.classList.add("visible");
    requestAnimationFrame(() => triggerReveal("#home"));
  }, 4800);
}

// Start music playback immediately when user clicks "Open the Invitation".
// This is called inside openInvitation() so it runs as part of the click handler.
function startMusicOnOpen() {
  const audio = document.getElementById("bgm");
  const btn   = document.getElementById("musicBtn");
  if (!audio || !SONG_SRC) return;

  if (!audio.src || audio.src.indexOf(SONG_SRC) === -1) {
    audio.src = SONG_SRC;
    audio.load();
  }

  // Attempt to play; the click gesture should satisfy autoplay policies
  audio.play().then(() => {
    musicOn = true;
    btn.classList.add("playing");
  }).catch((err) => {
    // Autoplay blocked despite the click (rare) — keep button idle so user can tap to start
    console.warn("Music autoplay blocked:", err);
    musicOn = false;
    btn.classList.remove("playing");
  });
}

// Allow user to tap the envelope to trigger the opening immediately
 document.addEventListener("DOMContentLoaded", () => {
  const env = document.getElementById("envelope-scene");
  const envEl = env ? env.querySelector(".envelope") : null;
  if (envEl) {
    envEl.addEventListener("click", () => {
      env.classList.add("opening");
    });
    envEl.style.cursor = "pointer";
  }
});


/* ----------------------------- Page navigation ----------------------------- */

function showPage(pageId) {
  // Deactivate all
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));

  // Activate target
  const target = document.getElementById(pageId);
  if (target) {
    target.classList.add("active");
    requestAnimationFrame(() => triggerReveal("#" + pageId));
  }

  // Mark matching nav buttons active
  document.querySelectorAll(`.nav-btn[data-page="${pageId}"]`)
    .forEach(b => b.classList.add("active"));

  // Scroll to top of page
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Mark Home nav active on load
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.nav-btn[data-page="home"]').forEach(b => b.classList.add("active"));
});


/* ----------------------------- Reveal-on-scroll ----------------------------- */

function triggerReveal(scopeSelector) {
  const scope = scopeSelector ? document.querySelector(scopeSelector) : document;
  if (!scope) return;
  const items = scope.querySelectorAll(".reveal");
  items.forEach(el => {
    // small rAF stagger for smooth entrance
    requestAnimationFrame(() => el.classList.add("in"));
  });
}

// IntersectionObserver for reveal-on-scroll within the active page
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".page .reveal").forEach(el => revealObserver.observe(el));
});


/* ----------------------------- RSVP ----------------------------- */

function stepGuests(delta) {
  const el = document.getElementById("guestCount");
  guests = Math.max(1, Math.min(20, guests + delta));
  el.textContent = guests;
  el.animate(
    [{ transform: "scale(1.2)" }, { transform: "scale(1)" }],
    { duration: 220, easing: "ease-out" }
  );
}

function setAttending(value, btn) {
  attending = value;
  document.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

function sendRSVP() {
  const nameEl = document.getElementById("rsvpName");
  const errEl  = document.getElementById("rsvpError");
  const name   = (nameEl.value || "").trim();

  if (!name) {
    errEl.textContent = "Please enter your name.";
    nameEl.focus();
    return;
  }
  errEl.textContent = "";

  const attendingText = attending === "yes"
    ? `will be attending the tombstone unveiling of ${EVENT.deceased}`
    : `regretfully cannot attend the tombstone unveiling of ${EVENT.deceased}`;

  const msg =
    `Hello ${EVENT.family},\n\n` +
    `My name is ${name}. I ${attendingText}.\n` +
    (attending === "yes" ? `Number of guests: ${guests}.\n\n` : "\n") +
    `Date: ${EVENT.date} at ${EVENT.time}\n` +
    `Venue: ${EVENT.venue}\n\n` +
    `Thank you for inviting me.`;

  const url = `https://wa.me/${EVENT.rsvpPhone}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank", "noopener");
}


/* ----------------------------- Music toggle ----------------------------- */

function toggleMusic() {
  const audio = document.getElementById("bgm");
  const btn   = document.getElementById("musicBtn");

  if (!SONG_SRC) {
    // Placeholder mode — visually toggle but no audio
    musicOn = !musicOn;
    btn.classList.toggle("playing", musicOn);
    btn.title = musicOn
      ? "Music placeholder — add song.mp3 and set SONG_SRC in script.js"
      : "Play music";
    if (musicOn) {
      // Pulse a hint
      btn.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.18)" },
          { transform: "scale(1)" },
        ],
        { duration: 400, easing: "ease-out" }
      );
    }
    return;
  }

  if (!audio.src) {
    audio.src = SONG_SRC;
    audio.load();
  }

  if (audio.paused) {
    audio.play().then(() => {
      musicOn = true;
      btn.classList.add("playing");
    }).catch(() => {
      // Autoplay blocked — wait for user gesture (already a click, so retry)
      musicOn = false;
      btn.classList.remove("playing");
    });
  } else {
    audio.pause();
    musicOn = false;
    btn.classList.remove("playing");
  }
}


/* ----------------------------- Initial reveal on load ----------------------------- */

window.addEventListener("load", () => {
  // If user lands with no welcome (e.g. direct #hash), make sure reveal fires.
  // Welcome screen handles its own flow via openInvitation().
});
