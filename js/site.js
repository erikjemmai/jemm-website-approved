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
  if (heroSeeHow && arcSection) {
    heroSeeHow.addEventListener("click", function (e) {
      e.preventDefault();
      arcSection.scrollIntoView({ behavior: "smooth" });
    });
  }
})();
