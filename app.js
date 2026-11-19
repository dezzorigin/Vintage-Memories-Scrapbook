// Landing Vintage Memories Scrapbook — interaksi kecil saja:
// toggle menu mobile + tutup menu setelah link diklik.
// Tidak ada data, tidak ada fetch: halaman ini statis penuh.
(function () {
  var toggle = document.getElementById("nav-toggle");
  var menu = document.getElementById("nav-mobile");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
  });

  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Buka menu");
    });
  });
})();
