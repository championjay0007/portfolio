(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.add("js-ready");

  function setupIntersectionAnimations() {
    const elements = document.querySelectorAll(".reveal");
    if (reducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });

    elements.forEach((element) => observer.observe(element));
  }

  function setupGsapAnimations() {
    if (reducedMotion || !window.gsap || !window.ScrollTrigger) return false;
    window.gsap.registerPlugin(window.ScrollTrigger);

    window.gsap.from(".room-intro > *", {
      y: 20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.09,
      ease: "power2.out",
      delay: 0.15
    });

    window.gsap.utils.toArray(".expertise-card").forEach((card, index) => {
      window.gsap.fromTo(card,
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          delay: (index % 4) * 0.07,
          ease: "power2.out",
          scrollTrigger: { trigger: card, start: "top 88%", once: true }
        }
      );
    });

    window.gsap.utils.toArray(".process-marker").forEach((marker) => {
      window.gsap.fromTo(marker,
        { scale: 0.6, opacity: 0.35 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          ease: "back.out(2)",
          scrollTrigger: { trigger: marker, start: "top 82%", once: true }
        }
      );
    });

    return true;
  }

  function init() {
    setupIntersectionAnimations();
    setupGsapAnimations();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
