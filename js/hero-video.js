(function () {
  var video = document.getElementById("heroVideo");
  if (!video) return;

  function startPlayback() {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = true;
    var playPromise = video.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function () {});
    }
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    video.removeAttribute("autoplay");
    video.pause();
    video.currentTime = 0;
    return;
  }

  video.addEventListener("loadedmetadata", startPlayback);
  video.addEventListener("canplay", startPlayback);
  window.addEventListener("pageshow", startPlayback);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) startPlayback();
  });

  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) startPlayback();
})();
