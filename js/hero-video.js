(function () {
  var video = document.getElementById("heroVideo");
  if (!video) return;

  var segments = [];
  var segmentIndex = 0;
  var skipPartIndex = 2; // third segment: two Jemm Arc devices

  function buildSegments() {
    var duration = video.duration;
    if (!duration || !isFinite(duration)) return [];

    // Video is treated as four equal beats; the third is skipped on loop.
    var part = duration / 4;
    var all = [
      [0, part],
      [part, part * 2],
      [part * 2, part * 3],
      [part * 3, duration]
    ];

    return all.filter(function (_, index) {
      return index !== skipPartIndex;
    });
  }

  function playCurrentSegment() {
    if (!segments.length) return;
    var start = segments[segmentIndex][0];
    if (Math.abs(video.currentTime - start) > 0.15) {
      video.currentTime = start;
    }
  }

  function advanceSegment() {
    segmentIndex = (segmentIndex + 1) % segments.length;
    video.currentTime = segments[segmentIndex][0];
  }

  function startPlayback() {
    segments = buildSegments();
    if (!segments.length) return;

    segmentIndex = 0;
    playCurrentSegment();

    var playPromise = video.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function () {
        video.controls = false;
      });
    }
  }

  video.addEventListener("loadedmetadata", startPlayback);

  video.addEventListener("timeupdate", function () {
    if (!segments.length) return;

    var end = segments[segmentIndex][1];
    if (video.currentTime >= end - 0.08) {
      advanceSegment();
    }
  });

  video.addEventListener("ended", function () {
    advanceSegment();
    video.play();
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    video.removeAttribute("autoplay");
    video.pause();
    video.currentTime = 0;
  }
})();
