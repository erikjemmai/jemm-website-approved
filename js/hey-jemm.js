(function () {
  var jemmDialogue = window.jemmHeyJemmDialogue || [
    { command: "I'm home", response: "Welcome home, Elena. Everything's ready for you.", state: "responding", gem: "radiant", video: "assets/videos/im-home-hey-jemm.mp4" },
    { command: "Good morning, Jemm", response: "Good morning. The kitchen is set and your morning playlist is on.", state: "responding", gem: "diamond", video: "assets/videos/good-morning-hey-jemm.mp4", videoEnd: 5.2 },
    { command: "Prepare movie night", response: "Movie night is ready. Lights dimmed, shades closed, and the room is set.", state: "responding", gem: "amethyst", video: "assets/videos/jemm-hero-background.mp4", videoEnd: 5.2 }
  ];

  var gemByStep = ["radiant", "diamond", "amethyst"];
  var VIDEO_SWAP_MS = 560;
  var IDLE_HOLD_MS = 4600;
  var SPEECH_TAIL_MS = 400;

  function getWakePhrase() {
    return '"Hey Jemm"';
  }

  function mergeChipItem(base, chip) {
    if (!base) return null;
    var videoEnd = base.videoEnd;
    if (chip && chip.getAttribute("data-video-end")) {
      videoEnd = parseFloat(chip.getAttribute("data-video-end"));
    }
    return {
      command: base.command,
      response: base.response,
      state: base.state,
      gem: (chip && chip.getAttribute("data-gem")) || base.gem,
      video: (chip && chip.getAttribute("data-video")) || base.video,
      videoSequence: base.videoSequence,
      videoEnd: videoEnd,
      loop: base.loop,
      hold: base.hold
    };
  }

  function initJemmEntity() {
    var entity = document.getElementById("jemmEntity");
    var wakeEl = document.getElementById("hey-jemm-title");
    var commandEl = document.getElementById("jemmCommand");
    var responseEl = document.getElementById("jemmResponse");
    if (!wakeEl || !commandEl || !responseEl) return;

    var step = 0;
    var advanceTimer = null;
    var speechEndTimer = null;
    var speechRaf = null;
    var speakSession = null;
    var sceneButtons = document.querySelectorAll(".hey-jemm__scene");
    var legacyChips = document.querySelectorAll(".hey-jemm__chip");
    var chips = sceneButtons.length ? sceneButtons : legacyChips;
    var sceneVideo = document.getElementById("heyJemmVideo");
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var videoSwapTimer = null;
    var videoSequence = null;
    var videoSequenceIndex = 0;
    var videoCompleteCallback = null;
    var speechReady = false;
    var videoReady = false;
    var advanceScheduled = false;

    var videoClipEnd = null;

    function updateWakeLine() {
      wakeEl.textContent = getWakePhrase();
    }

    function clearVideoClip() {
      videoClipEnd = null;
      if (!sceneVideo) return;
      sceneVideo.ontimeupdate = null;
    }

    function applyVideoClip(endAt) {
      clearVideoClip();
      if (!sceneVideo || endAt == null || isNaN(endAt)) return;
      videoClipEnd = endAt;
      sceneVideo.ontimeupdate = function () {
        if (videoClipEnd == null || sceneVideo.currentTime < videoClipEnd) return;
        sceneVideo.pause();
        sceneVideo.ontimeupdate = null;
        videoClipEnd = null;
        handleVideoEnded();
      };
    }

    function clearVideoSequence() {
      videoSequence = null;
      videoSequenceIndex = 0;
      clearVideoClip();
      if (!sceneVideo) return;
      sceneVideo.onended = null;
    }

    function invokeVideoComplete() {
      if (!videoCompleteCallback) return;
      var cb = videoCompleteCallback;
      videoCompleteCallback = null;
      cb();
    }

    function handleVideoEnded() {
      if (videoSequence && videoSequence.length > 1) {
        var nextIndex = videoSequenceIndex + 1;
        if (nextIndex < videoSequence.length) {
          playSequenceStep(nextIndex);
          return;
        }
      }
      invokeVideoComplete();
    }

    function playSequenceStep(index, clipEnd) {
      if (!sceneVideo || !videoSequence || !videoSequence.length) return;
      videoSequenceIndex = index;
      var src = videoSequence[videoSequenceIndex];
      sceneVideo.loop = false;
      sceneVideo.src = src;
      sceneVideo.setAttribute("data-current", src);
      sceneVideo.load();
      var playPromise = sceneVideo.play();
      if (playPromise && playPromise.catch) playPromise.catch(function () {});
      applyVideoClip(clipEnd);
    }

    function setSceneVideo(src, sequence, shouldLoop, clipEnd) {
      if (!sceneVideo || !src) return;

      clearVideoSequence();
      sceneVideo.loop = !!shouldLoop;

      if (sequence && sequence.length > 1) {
        videoSequence = sequence;
        videoSequenceIndex = 0;
        sceneVideo.loop = false;
        sceneVideo.onended = handleVideoEnded;
      } else if (!shouldLoop) {
        sceneVideo.onended = handleVideoEnded;
      } else {
        sceneVideo.onended = null;
      }

      if (sceneVideo.getAttribute("data-current") === src && !sequence && shouldLoop && clipEnd == null) return;

      if (videoSwapTimer) clearTimeout(videoSwapTimer);

      function swap() {
        if (sequence && sequence.length > 1) {
          playSequenceStep(0, clipEnd);
        } else {
          sceneVideo.src = src;
          sceneVideo.setAttribute("data-current", src);
          sceneVideo.load();
          var playPromise = sceneVideo.play();
          if (playPromise && playPromise.catch) playPromise.catch(function () {});
          applyVideoClip(clipEnd);
        }
        sceneVideo.classList.remove("is-swapping");
        videoSwapTimer = null;
      }

      if (reducedMotion) {
        swap();
        return;
      }

      sceneVideo.classList.add("is-swapping");
      videoSwapTimer = window.setTimeout(swap, VIDEO_SWAP_MS);
    }

    function setGemMode(gem) {
      var mode = gem || "circle";
      if (entity) entity.setAttribute("data-gem", mode);
      chips.forEach(function (chip) {
        var isActive = chip.getAttribute("data-gem") === mode && mode !== "circle";
        chip.classList.toggle("is-active", isActive);
        if (chip.tagName === "BUTTON") {
          chip.setAttribute("aria-selected", isActive ? "true" : "false");
        }
      });
    }

    function clampPct(v) {
      return Math.max(36, Math.min(64, v));
    }

    function organicBlobRadius(t, activity, gain, bias) {
      var a = activity * gain;
      var b = bias || { x: 0, y: 0 };
      function corner(base, freq, phase, amp) {
        return base + Math.sin(t * freq + phase) * amp + Math.sin(t * freq * 1.65 + phase * 1.4) * amp * 0.35;
      }
      var tl = corner(50 + b.x * 0.35, 2.2, 0, 5.5) + a * 7 + b.x * 1.2;
      var tr = corner(50 - b.x * 0.3, 2.5, 1.1, 5) + a * 6.5 - b.x * 1.1;
      var br = corner(50 + b.y * 0.25, 1.9, 2.3, 6) + a * 7.5 + b.y;
      var bl = corner(50 - b.y * 0.3, 2.7, 3.6, 5.2) + a * 6 - b.y * 0.9;
      var tl2 = corner(50 - b.y * 0.2, 2.1, 0.6, 6.5) + a * 8;
      var tr2 = corner(50 + b.y * 0.25, 1.85, 2.0, 5.8) + a * 6.8;
      var br2 = corner(50 - b.x * 0.2, 2.4, 3.1, 5.4) + a * 7.2;
      var bl2 = corner(50 + b.x * 0.3, 2.0, 4.4, 6.2) + a * 6.5;
      function fmt(v) { return clampPct(v).toFixed(1) + "%"; }
      return fmt(tl) + " " + fmt(tr) + " " + fmt(br) + " " + fmt(bl) + " / " +
        fmt(tl2) + " " + fmt(tr2) + " " + fmt(br2) + " " + fmt(bl2);
    }

    function charActivity(ch) {
      if (ch === " ") return 0.3;
      if (ch === "." || ch === "!" || ch === "?") return 0.42;
      if (ch === ",") return 0.34;
      if (/[aeiouAEIOU]/.test(ch)) return 0.24;
      return 0.17;
    }

    function charBias(ch) {
      var code = ch.charCodeAt(0) || 0;
      return {
        x: Math.sin(code * 0.17) * 4,
        y: Math.cos(code * 0.23) * 3.5
      };
    }

    function applySpeechVars(scaleX, scaleY, glow, rotate, blobR) {
      if (!entity) return;
      entity.style.setProperty("--speech-scale-x", scaleX.toFixed(4));
      entity.style.setProperty("--speech-scale-y", scaleY.toFixed(4));
      entity.style.setProperty("--speech-glow", glow.toFixed(4));
      entity.style.setProperty("--speech-rotate", rotate.toFixed(2) + "deg");
      if (blobR) entity.style.setProperty("--blob-r", blobR);
    }

    function resetSpeechVars() {
      if (!entity) return;
      applySpeechVars(1, 1, 0, 0, "50% 50% 50% 50% / 50% 50% 50% 50%");
    }

    function stopSpeech() {
      if (speakSession) {
        speakSession.active = false;
        if (speakSession.typeTimer) clearTimeout(speakSession.typeTimer);
        speakSession = null;
      }
      if (speechEndTimer) clearTimeout(speechEndTimer);
      speechEndTimer = null;
      if (speechRaf) cancelAnimationFrame(speechRaf);
      speechRaf = null;
      if (entity) {
        entity.classList.remove("jemm-entity--speaking");
        resetSpeechVars();
      }
    }

    function startSpeakSession(text, options) {
      options = options || {};
      var el = options.el || responseEl;
      var gain = options.gain != null ? options.gain : 1;
      var charMs = options.charMs || 34;
      var chars = text.split("");
      var charIndex = 0;

      stopSpeech();
      if (entity) entity.classList.add("jemm-entity--speaking");
      el.textContent = "";

      speakSession = {
        active: true,
        startTime: performance.now(),
        activity: 0,
        bias: { x: 0, y: 0 },
        gain: gain,
        typeTimer: null
      };

      function animateOrb() {
        if (!speakSession || !speakSession.active) return;
        var t = (performance.now() - speakSession.startTime) / 1000;
        speakSession.activity *= 0.88;
        speakSession.bias.x *= 0.86;
        speakSession.bias.y *= 0.86;
        var wave = (Math.sin(t * 5.2) + 1) * 0.5;
        var wave2 = (Math.sin(t * 3.2 + 0.9) + 1) * 0.5;
        var activity = speakSession.activity;
        var sessionGain = speakSession.gain;
        var glow = Math.min(1, (0.2 + wave * 0.26 + wave2 * 0.1 + activity * 0.52) * sessionGain);
        var base = 1 + (0.016 + wave * 0.028 + activity * 0.04) * sessionGain;
        var scaleX = base + Math.sin(t * 3.4) * 0.014 * sessionGain + speakSession.bias.x * 0.004 * activity;
        var scaleY = base + Math.cos(t * 2.9) * 0.016 * sessionGain + speakSession.bias.y * 0.004 * activity;
        var rotate = Math.sin(t * 3.8) * 1.2 * sessionGain + speakSession.bias.x * 0.08 * activity;
        var blobR = organicBlobRadius(t, activity, sessionGain, speakSession.bias);
        applySpeechVars(scaleX, scaleY, glow, rotate, blobR);
        speechRaf = requestAnimationFrame(animateOrb);
      }

      function typeNextChar() {
        if (!speakSession || !speakSession.active) return;
        if (charIndex >= chars.length) {
          speakSession.active = false;
          speechEndTimer = setTimeout(stopSpeech, 700);
          return;
        }
        var ch = chars[charIndex++];
        el.textContent += ch;
        var bump = charActivity(ch);
        speakSession.activity = Math.min(1, speakSession.activity + bump);
        var b = charBias(ch);
        speakSession.bias.x = Math.max(-5, Math.min(5, speakSession.bias.x + b.x * bump));
        speakSession.bias.y = Math.max(-5, Math.min(5, speakSession.bias.y + b.y * bump));
        var pause = ch === "." || ch === "!" || ch === "?" ? 160 : (ch === "," ? 100 : 0);
        speakSession.typeTimer = setTimeout(typeNextChar, charMs + pause);
      }

      if (entity) {
        speechRaf = requestAnimationFrame(animateOrb);
      }
      typeNextChar();

      var totalMs = 0;
      for (var i = 0; i < chars.length; i++) {
        totalMs += charMs;
        if (chars[i] === ".") totalMs += 140;
        else if (chars[i] === ",") totalMs += 90;
      }
      return totalMs + 700;
    }

    function tryAdvanceStep() {
      if (!speechReady || !videoReady || advanceScheduled) return;
      advanceScheduled = true;
      var next = (step + 1) % jemmDialogue.length;
      showStep(next);
    }

    function scheduleStepAdvance(speechMs, waitForVideo) {
      if (advanceTimer) clearTimeout(advanceTimer);
      videoCompleteCallback = null;
      speechReady = false;
      videoReady = !waitForVideo;
      advanceScheduled = false;

      advanceTimer = setTimeout(function () {
        speechReady = true;
        tryAdvanceStep();
      }, speechMs);

      if (waitForVideo) {
        videoCompleteCallback = function () {
          videoReady = true;
          tryAdvanceStep();
        };
      }
    }

    function showStep(index, chip) {
      step = index;
      advanceScheduled = false;
      var item = mergeChipItem(jemmDialogue[index], chip);
      if (!item) return;
      stopSpeech();
      if (advanceTimer) clearTimeout(advanceTimer);
      videoCompleteCallback = null;

      if (entity) {
        entity.classList.remove("jemm-entity--idle", "jemm-entity--listening", "jemm-entity--responding");
        entity.classList.add("jemm-entity--" + item.state);
      }
      setGemMode(item.gem || gemByStep[index] || "circle");
      setSceneVideo(item.video || sceneVideo && sceneVideo.getAttribute("src"), item.videoSequence, !!item.loop, item.videoEnd);
      updateWakeLine();
      commandEl.textContent = item.command;
      commandEl.classList.toggle("is-active", !!item.command);

      if (item.state === "idle") {
        responseEl.textContent = item.response;
        if (!item.hold) {
          scheduleStepAdvance(IDLE_HOLD_MS, false);
        }
        return;
      }

      responseEl.textContent = "";
      var speechMs = SPEECH_TAIL_MS;
      if (item.response) {
        var gain = item.state === "listening" ? 0.88 : 1;
        speechMs = startSpeakSession(item.response, { el: responseEl, gain: gain, charMs: 34 }) + SPEECH_TAIL_MS;
      }

      scheduleStepAdvance(speechMs, !!(sceneVideo && sceneVideo.tagName === "VIDEO"));
    }

    showStep(0);

    chips.forEach(function (chip, chipIndex) {
      chip.addEventListener("click", function () {
        if (advanceTimer) clearTimeout(advanceTimer);
        videoCompleteCallback = null;
        showStep(chipIndex, chip);
      });
    });

    if (sceneVideo) {
      sceneVideo.setAttribute("data-current", jemmDialogue[0].video);
      sceneVideo.loop = false;
    }

    window.addEventListener("jemm:namechange", updateWakeLine);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initJemmEntity);
  } else {
    initJemmEntity();
  }
})();
