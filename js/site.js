(function () {
  var toggle = document.getElementById("siteNavToggle");
  var nav = document.getElementById("siteNav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var scrollBtn = document.getElementById("heroScrollBtn");
  var arcSection = document.getElementById("introducing-arc");

  if (scrollBtn && arcSection) {
    scrollBtn.addEventListener("click", function () {
      arcSection.scrollIntoView({ behavior: "smooth" });
    });
  }

  var heroSeeHow = document.getElementById("heroSeeHow");
  var simplySpeakSection = document.getElementById("simply-speak");
  if (heroSeeHow && simplySpeakSection) {
    heroSeeHow.addEventListener("click", function (e) {
      e.preventDefault();
      simplySpeakSection.scrollIntoView({ behavior: "smooth" });
    });
  }

  function initHeaderScroll() {
    var header = document.getElementById("siteHeader");
    if (!header || header.classList.contains("site-header--page")) return;

    var hero = document.querySelector(".hero-home");
    if (!hero) return;

    function onScroll() {
      var headerHeight = header.offsetHeight || 80;
      var pastHero = hero.getBoundingClientRect().bottom <= headerHeight;
      header.classList.toggle("site-header--solid", pastHero);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("load", onScroll);
    onScroll();
  }

  initHeaderScroll();

  function initStoryImageReveal() {
    var storyMedia = document.querySelectorAll(".story-row__media");
    if (!storyMedia.length || !("IntersectionObserver" in window)) return;

    document.documentElement.classList.add("has-story-reveal");

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px"
    });

    storyMedia.forEach(function (media) {
      observer.observe(media);
    });
  }

  initStoryImageReveal();
})();
