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
      title: "Allegiance Heart & Home Care Management Portal",
      categoryLabel: "HEALTHCARE TECHNOLOGY / MANAGEMENT SYSTEM",
      categories: ["web-applications", "management-systems"],
      description: "A digital platform for an aged care and disability support organization, combining a corporate website with management portal workflows for participant onboarding, document submissions, invoices, approvals, budget monitoring and workforce-related records.",
      technologies: ["Laravel", "PHP", "MySQL", "Filament"],
      liveUrl: "https://allegiancehearthomecare.com.au/"
    },
    {
      title: "Aged Care Link",
      categoryLabel: "HEALTHCARE TECHNOLOGY / PROVIDER MATCHING",
      categories: ["web-applications"],
      description: "A Support at Home provider-matching platform designed to connect older Australians and their families with suitable care providers. It includes participant enquiry and referral processes, provider network workflows and information for people changing providers.",
      technologies: ["Laravel", "PHP", "MySQL"],
      liveUrl: "https://agedcarelink.com.au/"
    },
    {
      title: "Regulated Services Advisory",
      categoryLabel: "CORPORATE WEBSITE / PROFESSIONAL SERVICES",
      categories: ["corporate-websites"],
      description: "A professional corporate website presenting advisory services for aged care and NDIS providers, including information about compliance, governance, risk management and operational support.",
      technologies: [],
      liveUrl: "https://regulatedservicesadvisory.com.au/"
    },
    {
      title: "PECY UGO",
      categoryLabel: "E-COMMERCE / FASHION & RETAIL",
      categories: ["e-commerce"],
      description: "An online fashion and footwear store presenting product categories, collections and shopping-related information.",
      technologies: [],
      liveUrl: "https://pecyugo.com/"
    },
    {
      title: "Center-ECD",
      categoryLabel: "EDUCATION / ENTERPRISE DEVELOPMENT",
      categories: ["corporate-websites"],
      description: "A human-capacity and enterprise development organization offering executive education, business incubation, youth programs and professional training.",
      technologies: [],
      liveUrl: "https://centerecd.org/"
    },
    {
      title: "Lorem Foundation",
      categoryLabel: "FOUNDATION / NONPROFIT WEBSITE",
      categories: ["corporate-websites"],
      description: "An organizational website providing an online presence for the foundation.",
      technologies: [],
      liveUrl: "https://loremfoundation.org/"
    },
    {
      title: "Think Electric Africa",
      categoryLabel: "ORGANIZATIONAL WEBSITE",
      categories: ["corporate-websites"],
      description: "An organizational website project presenting the identity and information of Think Electric Africa.",
      technologies: [],
      liveUrl: "https://thinkelectricafrica.org/"
    },
    {
      title: "Childcare Management System",
      categoryLabel: "SOFTWARE DEVELOPMENT / MANAGEMENT APPLICATION",
      categories: ["web-applications", "management-systems"],
      description: "A custom software project focused on childcare-related management and administrative processes.",
      technologies: []
    },
    {
      title: "DtalentHub",
      categoryLabel: "WEB APPLICATION / STAFFING & WORKFORCE MANAGEMENT",
      categories: ["web-applications", "management-systems"],
      description: "A staffing platform connecting Australian businesses with talent and helping job seekers find opportunities, with services for employers and candidates.",
      technologies: [],
      liveUrl: "https://dtalenthub.com/"
    },
    {
      title: "Miracle Assembly",
      categoryLabel: "CHURCH / COMMUNITY WEBSITE",
      categories: ["corporate-websites"],
      description: "A church website for Miracle Assembly in Benin City, featuring its services, live broadcasts, teachings and community information.",
      technologies: [],
      liveUrl: "https://miracleassembly.org/"
    }
  ];

  function makeProjectPreview(project) {
    if (!project.liveUrl) return null;

    const preview = document.createElement("div");
    preview.className = "project-preview";
    const frame = document.createElement("iframe");
    frame.className = "project-preview-frame";
    frame.src = project.liveUrl;
    frame.title = `${project.title} live website preview`;
    frame.loading = "lazy";
    frame.referrerPolicy = "no-referrer";
    frame.setAttribute("sandbox", "allow-forms allow-scripts allow-same-origin");
    frame.setAttribute("aria-hidden", "true");
    frame.tabIndex = -1;

    const openPreview = document.createElement("a");
    openPreview.className = "project-preview-link";
    openPreview.href = project.liveUrl;
    openPreview.target = "_blank";
    openPreview.rel = "noopener noreferrer";
    openPreview.setAttribute("aria-label", `Open ${project.title} website in a new tab`);
    const label = document.createElement("span");
    label.className = "project-preview-action";
    label.textContent = "OPEN LIVE SITE";
    openPreview.append(label);

    preview.append(frame, openPreview);
    return preview;
  }
  function renderProjects() {
    const container = document.querySelector("#projects-grid");
    if (!container) return;
    container.replaceChildren();

    projects.forEach((project, index) => {
      const card = document.createElement("article");
      card.className = "project-card";
      card.dataset.categories = project.categories.join(" ");
      card.style.setProperty("--project-delay", `${Math.min(index, 6) * 55}ms`);
      const preview = makeProjectPreview(project);
      if (preview) {
        card.classList.add("has-preview");
        card.append(preview);
      }

      const meta = document.createElement("div");
      meta.className = "project-meta";
      const category = document.createElement("span");
      category.className = "project-category";
      category.textContent = project.categoryLabel;
      const number = document.createElement("span");
      number.className = "project-number";
      number.textContent = String(index + 1).padStart(2, "0");
      meta.append(category, number);

      const title = document.createElement("h3");
      title.className = "project-title";
      title.textContent = project.title;
      const description = document.createElement("p");
      description.className = "project-description";
      description.textContent = project.description;
      card.append(meta, title, description);

      if (project.technologies.length) {
        const tags = document.createElement("ul");
      tags.className = "project-tags";
        tags.setAttribute("aria-label", "Confirmed technologies");
        project.technologies.forEach((technology) => {
          const tag = document.createElement("li");
          tag.textContent = technology;
          tags.append(tag);
        });
        card.append(tags);
      }

      if (project.liveUrl) {
        const link = document.createElement("a");
        link.className = "project-live-link";
        link.href = project.liveUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", `View ${project.title} live website (opens in a new tab)`);
        const label = document.createElement("span");
        label.textContent = "View live website";
        const arrow = document.createElement("span");
        arrow.className = "project-live-arrow";
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "↗";
        link.append(label, arrow);
        card.append(link);
      }

      container.append(card);
    });

    document.querySelectorAll(".filter-button").forEach((button) => {
      const filter = button.dataset.filter;
      const count = filter === "all"
        ? projects.length
        : projects.filter((project) => project.categories.includes(filter)).length;
      const countElement = button.querySelector("[data-filter-count]");
      if (countElement) countElement.textContent = String(count).padStart(2, "0");
    });
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
          card.hidden = filter !== "all" && !card.dataset.categories.split(" ").includes(filter);
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

  function init() {
    document.querySelector("#current-year").textContent = String(new Date().getFullYear());
    renderProjects();
    initProjectFilters();
    initContact();
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
