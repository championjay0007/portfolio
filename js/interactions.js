(() => {
  const initCursor = () => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    if (!dot || !ring) return;

    let pointerX = -100;
    let pointerY = -100;
    let ringX = pointerX;
    let ringY = pointerY;
    let cursorFrame = 0;

    document.addEventListener("pointermove", (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      dot.style.opacity = "1";
      ring.style.opacity = "1";
      dot.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
      if (!cursorFrame) cursorFrame = requestAnimationFrame(moveRing);
    }, { passive: true });

    function moveRing() {
      ringX += (pointerX - ringX) * 0.18;
      ringY += (pointerY - ringY) * 0.18;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      if (Math.abs(pointerX - ringX) > 0.3 || Math.abs(pointerY - ringY) > 0.3) {
        cursorFrame = requestAnimationFrame(moveRing);
      } else {
        cursorFrame = 0;
      }
    }

    document.addEventListener("pointerover", (event) => {
      if (event.target.closest("a, button, [data-card], .project-card")) ring.classList.add("is-hover");
    });
    document.addEventListener("pointerout", (event) => {
      if (event.target.closest("a, button, [data-card], .project-card")) ring.classList.remove("is-hover");
    });
  };

  const initNavigation = () => {
    const toggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector("#primary-nav");
    if (!toggle || !nav) return;

    const closeMenu = () => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
      nav.classList.remove("is-open");
    };

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
      nav.classList.toggle("is-open", isOpen);
    });
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) closeMenu();
    }, { passive: true });
  };

  const initCards = () => {
    document.querySelectorAll("[data-card]").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        if (event.pointerType === "touch") return;
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width;
        const y = (event.clientY - bounds.top) / bounds.height;
        card.style.setProperty("--pointer-x", `${x * 100}%`);
        card.style.setProperty("--pointer-y", `${y * 100}%`);
        card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 4}deg) rotateY(${(x - 0.5) * 5}deg)`;
      }, { passive: true });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  };

  const init = () => {
    initCursor();
    initNavigation();
    initCards();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
