(function () {
  var mount = document.getElementById("site-footer-mount");
  if (!mount) return;

  mount.innerHTML =
    '<footer class="site-footer">' +
      '<div class="container">' +
        '<div class="site-footer__grid">' +
          '<div class="site-footer__brand">' +
            '<a href="index.html" class="site-footer__logo-link" aria-label="Jemm home">' +
              '<img class="site-footer__logo" src="assets/logo-vertical.svg" alt="" width="56" height="47" />' +
            "</a>" +
          "</div>" +
          '<div class="site-footer__col">' +
            '<h4 class="site-footer__heading">Product</h4>' +
            '<a href="index.html#simply-speak">How it works</a>' +
            '<a href="jemm-arc.html">Jemm Arc</a>' +
          "</div>" +
          '<div class="site-footer__col">' +
            '<h4 class="site-footer__heading">Company</h4>' +
            '<a href="about.html">About</a>' +
            '<a href="contact.html">Contact</a>' +
          "</div>" +
          '<div class="site-footer__col">' +
            '<h4 class="site-footer__heading">Legal</h4>' +
            '<a href="privacy.html">Privacy Policy</a>' +
            '<a href="terms.html">Terms &amp; Conditions</a>' +
          "</div>" +
        "</div>" +
        '<div class="site-footer__bar">' +
          '<p class="site-footer__copy">© 2026 Jemm Tec LLC. All rights reserved.</p>' +
        "</div>" +
      "</div>" +
    "</footer>" +
    '<section class="site-disclaimer" aria-label="Site disclaimer">' +
      '<div class="container">' +
        "<p>Disclaimer: All hardware renderings, lifestyle videos, ambient interface sequences, and person portrayals displayed on this site are AI-generated conceptual simulations for illustration purposes only. They do not represent final physical product designs, actual system user interfaces, or real individuals. Not actual property or operational footage. Subject to change during product development.</p>" +
      "</div>" +
    "</section>";
})();
