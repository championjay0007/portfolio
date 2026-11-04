(() => {
  const portfolioConfig = {
    contactEmail: "championjaytech@gmail.com",
    whatsappNumber: "2349138370625",
    socialLinks: {
      github: "",
      linkedin: "",
      instagram: ""
    }
  };

  const projects = [
    {
      title: "Healthcare Management Portal",
      description: "An illustrative concept for a healthcare portal, bringing patient information and everyday administrative workflows into one considered experience.",
      category: "applications",
      categoryLabel: "WEB APPLICATION",
      technologies: ["UI/UX", "JavaScript", "Backend"],
      thumbnail: "",
      demoUrl: "",
      sourceUrl: "",
      artwork: "health",
      accent: "#8da9ff",
      glow: "rgba(91,126,255,.25)"
    },
    {
      title: "AI SaaS Platform",
      description: "A placeholder exploration of an AI-enabled SaaS product, from a clear onboarding journey to an adaptable product dashboard.",
      category: "platforms",
      categoryLabel: "SAAS PLATFORM",
      technologies: ["Product design", "Python", "JavaScript"],
      thumbnail: "",
      demoUrl: "",
      sourceUrl: "",
      artwork: "platform",
      accent: "#b59cff",
      glow: "rgba(153,111,255,.25)"
    },
    {
      title: "Business Management System",
      description: "An illustrative business system concept for organizing operational information and making day-to-day work easier to navigate.",
      category: "applications",
      categoryLabel: "BUSINESS SOFTWARE",
      technologies: ["Laravel", "MySQL", "Bootstrap"],
      thumbnail: "",
      demoUrl: "",
      sourceUrl: "",
      artwork: "dashboard",
      accent: "#8bd6c0",
      glow: "rgba(81,198,168,.2)"
    },
    {
      title: "E-commerce Platform",
      description: "A storefront concept with a focus on product discovery, a calm shopping experience and a straightforward checkout journey.",
      category: "platforms",
      categoryLabel: "E-COMMERCE",
      technologies: ["WordPress", "JavaScript", "UI/UX"],
      thumbnail: "",
      demoUrl: "",
      sourceUrl: "",
      artwork: "store",
      accent: "#f0b495",
      glow: "rgba(235,152,112,.2)"
    },
    {
      title: "Interactive 3D Portfolio",
      description: "A creative web experiment exploring spatial interfaces, motion and interactive 3D storytelling in the browser.",
      category: "experiments",
      categoryLabel: "INTERACTIVE WEBSITE",
      technologies: ["Three.js", "JavaScript", "CSS"],
      thumbnail: "",
      demoUrl: "",
      sourceUrl: "",
      artwork: "globe",
      accent: "#b4a1ff",
      glow: "rgba(139,113,255,.27)"
    },
    {
      title: "Chess Game Application",
      description: "A chess application concept focused on a distraction-free board, clear game state and a polished play experience.",
      category: "experiments",
      categoryLabel: "GAME APPLICATION",
      technologies: ["JavaScript", "HTML", "CSS"],
      thumbnail: "",
      demoUrl: "",
      sourceUrl: "",
      artwork: "chess",
      accent: "#bdd1ff",
      glow: "rgba(132,163,255,.23)"
    },
    {
      title: "Beat Maker / Music Production Application",
      description: "A browser-based music-making concept with a tactile sequencer and a visual interface designed to invite experimentation.",
      category: "experiments",
      categoryLabel: "CREATIVE APPLICATION",
      technologies: ["JavaScript", "Web Audio", "UI/UX"],
      thumbnail: "",
      demoUrl: "",
      sourceUrl: "",
      artwork: "music",
      accent: "#e5a8ff",
      glow: "rgba(192,111,255,.23)"
    }
  ];

  function makeArtwork(project, index) {
    const artwork = document.createElement("div");
    artwork.className = "project-art";
    artwork.style.setProperty("--art-accent", project.accent);
    artwork.style.setProperty("--art-glow", project.glow);
    artwork.setAttribute("aria-hidden", "true");

    if (project.thumbnail) {
      artwork.classList.add("has-thumbnail");
      const image = document.createElement("img");
      image.src = project.thumbnail;
      image.alt = "";
      image.loading = "lazy";
      image.addEventListener("error", () => image.remove(), { once: true });
      artwork.append(image);
    }

    const label = document.createElement("span");
    label.className = "project-art-label";
    label.textContent = `CONCEPT / 0${index + 1}`;
    artwork.append(label);

    if (!project.thumbnail && project.artwork === "globe") {
      const globe = document.createElement("div");
      globe.className = "art-globe";
      artwork.append(globe);
    } else if (!project.thumbnail && project.artwork === "chess") {
      const board = document.createElement("div");
      board.className = "art-board";
      ["♜", "♞", "♝", "♛", "♚", "♟", "♟", "♟", "♟", "♟", "♙", "♙", "♙", "♙", "♙", "♖", "♘", "♗", "♕", "♔", "♙", "♙", "♙", "♙", "♙"].forEach((piece) => {
        const square = document.createElement("i");
        square.textContent = piece;
        board.append(square);
      });
      artwork.append(board);
    } else if (!project.thumbnail && project.artwork === "music") {
      const equalizer = document.createElement("div");
      equalizer.className = "art-equalizer";
      equalizer.innerHTML = Array.from({ length: 28 }, (_, bar) => `<i style="--bar:${8 + ((bar * 17) % 46)}%;--delay:${(bar % 7) * -0.13}s"></i>`).join("");
      artwork.append(equalizer);
    } else if (!project.thumbnail) {
      artwork.insertAdjacentHTML("beforeend", `
        <div class="project-art-visual">
          <div class="art-window-bar"><i></i><i></i><i></i><span></span></div>
          <div class="art-ui">
            <div class="art-sidebar"><i></i><i></i><i></i><i></i><i></i></div>
            <div class="art-main"><i class="art-heading"></i><div class="art-panels"><i></i><i></i><i></i></div><div class="art-chart"></div></div>
          </div>
        </div>`);
    }

    const artIndex = document.createElement("span");
    artIndex.className = "project-art-index";
    artIndex.textContent = "CJ — DIGITAL PRACTICE";
    artwork.append(artIndex);
    return artwork;
  }

  function renderProjects() {
    const container = document.querySelector("#projects-grid");
    if (!container) return;
    container.replaceChildren();

    projects.forEach((project, index) => {
      const card = document.createElement("article");
      card.className = "project-card";
      card.dataset.category = project.category;
      card.dataset.projectIndex = String(index);
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `View ${project.title} project details`);
      card.append(makeArtwork(project, index));

      const info = document.createElement("div");
      info.className = "project-info";
      const heading = document.createElement("div");
      const category = document.createElement("span");
      category.className = "project-category";
      category.textContent = project.categoryLabel;
      const title = document.createElement("h3");
      title.textContent = project.title;
      heading.append(category, title);
      const open = document.createElement("span");
      open.className = "project-open";
      open.setAttribute("aria-hidden", "true");
      open.textContent = "↗";
      info.append(heading, open);
      card.append(info);

      const tags = document.createElement("div");
      tags.className = "project-tags";
      project.technologies.forEach((technology) => {
        const tag = document.createElement("span");
        tag.textContent = technology;
        tags.append(tag);
      });
      card.append(tags);
      card.addEventListener("click", () => openProject(index));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openProject(index);
        }
      });
      container.append(card);
    });

    const count = document.querySelector('.filter-button[data-filter="all"] span');
    if (count) count.textContent = String(projects.length).padStart(2, "0");
  }

  function openProject(index) {
    const project = projects[index];
    const dialog = document.querySelector("#project-dialog");
    if (!project || !dialog) return;

    dialog.querySelector(".dialog-category").textContent = project.categoryLabel;
    dialog.querySelector("#dialog-title").textContent = project.title;
    dialog.querySelector(".dialog-description").textContent = project.description;
    const tags = dialog.querySelector(".dialog-tags");
    tags.replaceChildren();
    project.technologies.forEach((technology) => {
      const tag = document.createElement("span");
      tag.textContent = technology;
      tags.append(tag);
    });

    const links = dialog.querySelector(".dialog-links");
    links.replaceChildren();
    [
      { label: "Live demo ↗", url: project.demoUrl },
      { label: "Source code ↗", url: project.sourceUrl }
    ].forEach(({ label, url }) => {
      if (!url) {
        const placeholder = document.createElement("span");
        placeholder.className = "dialog-placeholder";
        placeholder.textContent = `${label.replace(" ↗", "")} not added yet`;
        links.append(placeholder);
        return;
      }
      const link = document.createElement("a");
      link.href = url;
      link.textContent = label;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      links.append(link);
    });

    const dialogArt = dialog.querySelector(".dialog-art");
    dialogArt.style.background = `radial-gradient(circle at 50% 55%,${project.glow},transparent 60%),linear-gradient(135deg,#1c2030,#0d0e13)`;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    dialog.querySelector(".dialog-close").focus();
  }

  function initProjectFilters() {
    document.querySelectorAll(".filter-button").forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        document.querySelectorAll(".filter-button").forEach((item) => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        document.querySelectorAll(".project-card").forEach((card) => {
          card.hidden = filter !== "all" && card.dataset.category !== filter;
        });
      });
    });
  }

  function initContact() {
    const email = portfolioConfig.contactEmail.trim();
    const emailElement = document.querySelector("[data-contact-email]");
    if (emailElement) {
      if (email) {
        emailElement.href = `mailto:${email}`;
        emailElement.querySelector("[data-contact-value]").textContent = email;
      } else {
        emailElement.removeAttribute("href");
      }
    }

    const phone = portfolioConfig.whatsappNumber.replace(/\D/g, "");
    const phoneElement = document.querySelector("[data-contact-phone]");
    if (phoneElement && phone) {
      const formattedPhone = phone.replace(/^234(\d{3})(\d{3})(\d{4})$/, "+234 $1 $2 $3");
      phoneElement.href = `tel:+${phone}`;
      phoneElement.querySelector("[data-contact-value]").textContent = formattedPhone;
    }

    const whatsapp = document.querySelector("[data-whatsapp]");
    if (whatsapp && phone) {
      whatsapp.href = `https://wa.me/${phone}`;
      whatsapp.target = "_blank";
      whatsapp.rel = "noopener noreferrer";
      whatsapp.querySelector("[data-whatsapp-label]").textContent = "Message me on WhatsApp";
    } else if (whatsapp) {
      whatsapp.removeAttribute("href");
    }

    document.querySelectorAll("[data-social]").forEach((link) => {
      const url = portfolioConfig.socialLinks[link.dataset.social];
      if (url) {
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.removeAttribute("aria-label");
        return;
      }
      link.href = "#contact";
      link.setAttribute("aria-label", `${link.dataset.social} profile URL not configured`);
      link.title = "Add your profile URL in js/main.js";
    });

    const form = document.querySelector("#contact-form");
    const status = document.querySelector("#form-status");
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      if (!email) {
        status.textContent = "The contact email is not configured yet. Add it to portfolioConfig in js/main.js.";
        status.className = "form-note is-error";
        return;
      }
      const values = new FormData(form);
      const subject = String(values.get("subject")).trim();
      const body = [
        `Name: ${String(values.get("name")).trim()}`,
        `Email: ${String(values.get("email")).trim()}`,
        "",
        String(values.get("message")).trim()
      ].join("\n");
      status.textContent = "Opening your email app with the project details...";
      status.className = "form-note is-success";
      window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  function initDialog() {
    const dialog = document.querySelector("#project-dialog");
    if (!dialog) return;
    dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("click", (event) => {
      if (event.target.closest(".dialog-links a")) dialog.close();
    });
  }

  function init() {
    document.querySelector("#current-year").textContent = String(new Date().getFullYear());
    renderProjects();
    initProjectFilters();
    initContact();
    initDialog();
    const loader = document.querySelector(".page-loader");
    const hideLoader = () => {
      loader?.classList.add("is-done");
      document.body.classList.remove("is-loading");
    };
    window.addEventListener("load", () => window.setTimeout(hideLoader, 300), { once: true });
    window.setTimeout(hideLoader, 1800);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
