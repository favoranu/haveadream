(function () {
  const nav = document.querySelector(".site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-menu");
  const scrollLinks = document.querySelectorAll('a[href*="#"]');

  if (!nav || !toggle || !menu) return;

  function setMenuOpen(open) {
    nav.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("nav-menu-open", open);
  }

  toggle.addEventListener("click", () => {
    setMenuOpen(!nav.classList.contains("nav-open"));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });

  document.addEventListener("click", (event) => {
    if (!nav.classList.contains("nav-open")) return;
    if (!nav.contains(event.target)) setMenuOpen(false);
  });

  function scrollToTarget(target) {
    const navHeight = nav.offsetHeight || 72;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  scrollLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || !href.includes("#")) return;

      const hash = href.startsWith("#") ? href : href.slice(href.indexOf("#"));
      if (!hash || hash === "#") return;

      const target = document.querySelector(hash);
      if (!target) return;

      const samePage =
        href.startsWith("#") ||
        link.pathname === window.location.pathname ||
        link.pathname.endsWith(window.location.pathname.split("/").pop());

      if (!samePage) return;

      event.preventDefault();
      setMenuOpen(false);
      scrollToTarget(target);
      history.pushState(null, "", hash);
    });
  });

  const heroScroll = document.querySelector(".hero-scroll");
  if (heroScroll) {
    heroScroll.addEventListener("click", (event) => {
      const about = document.getElementById("about");
      if (!about) return;
      event.preventDefault();
      scrollToTarget(about);
      history.pushState(null, "", "#about");
    });
  }
})();