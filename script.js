const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const validLocalSections = new Set(["#home", "#about", "#services", "#skills", "#projects", "#offers", "#process", "#why-choose-me", "#testimonials", "#contact"]);

function closeMenu() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
  navLinks.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
  navLinks.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});
navLinks.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const backToTop = document.querySelector(".back-to-top");
function updateBackToTop() {
  backToTop.classList.toggle("is-visible", window.scrollY > 500);
}
window.addEventListener("scroll", updateBackToTop, { passive: true });
updateBackToTop();
backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

let testimonialIndex = 0;
function bindTestimonialControls() {
  const track = document.querySelector(".testimonial-track");
  document.querySelectorAll("[data-slide]").forEach((button) => {
    button.onclick = () => {
      const cards = track.querySelectorAll(".testimonial-card");
      if (!cards.length) return;
      const visibleCount = window.matchMedia("(max-width: 620px)").matches ? 1 : 2;
      const maxIndex = Math.max(0, cards.length - visibleCount);
      testimonialIndex = Math.min(maxIndex, Math.max(0, testimonialIndex + Number(button.dataset.slide)));
      const cardWidth = cards[0].getBoundingClientRect().width;
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
      track.style.transform = `translateX(-${testimonialIndex * (cardWidth + gap)}px)`;
    };
  });
}
window.addEventListener("resize", () => {
  testimonialIndex = 0;
  const track = document.querySelector(".testimonial-track");
  if (track) track.style.transform = "translateX(0)";
});

function refreshReveals() {
  const revealItems = document.querySelectorAll(".reveal:not([data-reveal-bound])");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => {
      item.dataset.revealBound = "true";
      revealObserver.observe(item);
    });
  } else revealItems.forEach((item) => item.classList.add("is-visible"));
}

function safeLink(value, fallback = "#contact") {
  const link = String(value || "").trim();
  if (link.startsWith("#") && validLocalSections.has(link)) return link;
  if (link.startsWith("/") && !link.startsWith("//")) return link;
  if (/^data:application\/pdf;base64,/i.test(link)) return link;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(link)) return link;
  return fallback;
}

function safeImage(value, fallback = "/assets/ovi-profile.png") {
  const image = String(value || "").trim();
  if (image.startsWith("/") && !image.startsWith("//")) return image;
  if (/^data:image\/(?:jpeg|png|webp|gif|avif);base64,/i.test(image)) return image;
  if (/^(?:assets|uploads)\/[A-Za-z0-9._/-]+$/i.test(image)) return image;
  if (/^https:\/\/images\.unsplash\.com\//i.test(image)) return image;
  return fallback;
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element && value !== undefined && value !== null) element.textContent = value;
}

function setImage(selector, url, alt) {
  document.querySelectorAll(selector).forEach((image) => {
    image.src = safeImage(url);
    if (alt) image.alt = alt;
  });
}

function renderWordsHeading(element, value) {
  if (!element || !value) return;
  const words = String(value).trim().split(/\s+/);
  const splitAt = Math.max(1, Math.ceil(words.length * 0.64));
  const accentWord = words.at(-1);
  const beforeAccent = words.slice(0, -1);
  const fragment = document.createDocumentFragment();
  const firstLine = document.createElement("span");
  firstLine.textContent = beforeAccent.slice(0, splitAt).join(" ");
  fragment.append(firstLine, document.createElement("br"));
  const secondLine = document.createElement("span");
  secondLine.append(`${beforeAccent.slice(splitAt).join(" ")}${beforeAccent.length > splitAt ? " " : ""}`);
  const accent = document.createElement("span");
  accent.className = "gradient-text";
  accent.textContent = accentWord;
  secondLine.append(accent);
  fragment.append(secondLine);
  element.replaceChildren(fragment);
}

function makeTechnologyBadge(text) {
  const badge = document.createElement("span");
  badge.textContent = text;
  return badge;
}

function makeServiceCard(service) {
  const article = document.createElement("article");
  article.className = "service-card reveal";
  if (service.image) {
    const image = document.createElement("img");
    image.className = "service-image";
    image.src = safeImage(service.image);
    image.alt = "";
    article.append(image);
  }
  const top = document.createElement("div");
  top.className = "card-top";
  const icon = document.createElement("span");
  icon.className = "line-icon";
  icon.textContent = service.icon || "✳";
  const number = document.createElement("span");
  number.className = "card-number";
  number.textContent = String(service.order || "").padStart(2, "0");
  top.append(icon, number);
  const title = document.createElement("h3");
  title.textContent = service.title;
  const description = document.createElement("p");
  description.textContent = service.shortDescription;
  const link = document.createElement("a");
  link.className = "card-link";
  link.href = safeLink(service.buttonLink);
  link.append(service.buttonText || "Learn More", " ");
  const arrow = document.createElement("span");
  arrow.textContent = "↗";
  link.append(arrow);
  article.append(top, title, description, link);
  if (service.fullDescription || service.features?.length || service.startingPrice) {
    const details = document.createElement("details");
    details.className = "service-extra";
    const summary = document.createElement("summary");
    summary.textContent = "More details";
    details.append(summary);
    if (service.fullDescription) {
      const fullDescription = document.createElement("p");
      fullDescription.textContent = service.fullDescription;
      details.append(fullDescription);
    }
    if (service.features?.length) {
      const featureList = document.createElement("ul");
      service.features.forEach((feature) => {
        const item = document.createElement("li");
        item.textContent = feature;
        featureList.append(item);
      });
      details.append(featureList);
    }
    if (service.startingPrice) {
      const price = document.createElement("div");
      price.className = "service-price";
      price.textContent = `Starting at ${service.startingPrice}`;
      details.append(price);
    }
    article.append(details);
  }
  return article;
}

function renderServices(content) {
  const grid = document.querySelector(".services-grid");
  grid.replaceChildren(...content.services.filter((item) => item.active !== false).sort((a, b) => a.order - b.order).map(makeServiceCard));
}

function renderSkills(content) {
  const grid = document.querySelector(".skills-grid");
  const groups = new Map();
  content.skills.filter((item) => item.visible !== false).sort((a, b) => a.order - b.order).forEach((skill) => {
    if (!groups.has(skill.category)) groups.set(skill.category, []);
    groups.get(skill.category).push(skill);
  });
  const dots = { Frontend: "skill-dot--blue", Backend: "skill-dot--purple", Database: "skill-dot--pink", Integration: "skill-dot--cyan" };
  grid.replaceChildren(...[...groups.entries()].map(([category, skills]) => {
    const article = document.createElement("article");
    article.className = "skill-group reveal";
    const heading = document.createElement("h3");
    const dot = document.createElement("span");
    dot.className = `skill-dot ${dots[category] || "skill-dot--blue"}`;
    heading.append(dot, document.createTextNode(category));
    const tags = document.createElement("div");
    tags.className = "skill-tags";
    skills.forEach((skill) => {
      const tag = document.createElement("span");
      if (skill.logo) {
        const logo = document.createElement("img");
        logo.src = safeImage(skill.logo);
        logo.alt = "";
        tag.append(logo);
      } else if (skill.icon) {
        const icon = document.createElement("i");
        icon.textContent = skill.icon;
        tag.append(icon, document.createTextNode(" "));
      }
      tag.append(skill.name);
      tags.append(tag);
    });
    article.append(heading, tags);
    return article;
  }));
}

function projectImage(imageUrl, projectUrl, name) {
  const link = document.createElement("a");
  link.className = "project-image";
  link.href = safeLink(projectUrl);
  link.setAttribute("aria-label", `View ${name}`);
  const image = document.createElement("img");
  image.src = safeImage(imageUrl, "/assets/ovi-profile.png");
  image.alt = `${name} project preview`;
  const open = document.createElement("span");
  open.className = "project-open";
  open.textContent = "↗";
  link.append(image, open);
  return link;
}

function makeProjectCard(project, featured) {
  const article = document.createElement("article");
  article.className = `project-card${featured ? " project-card--featured" : ""} reveal`;
  article.append(projectImage(project.image, project.projectUrl || project.liveDemoUrl || project.customUrl, project.name));
  const info = document.createElement("div");
  info.className = "project-info";
  const description = document.createElement("div");
  const category = document.createElement("span");
  category.className = "project-category";
  category.textContent = project.category || "PROJECT";
  const name = document.createElement("h3");
  name.textContent = project.name;
  const summary = document.createElement("p");
  summary.textContent = project.shortDescription;
  description.append(category, name, summary);
  if (project.client || project.date) {
    const meta = document.createElement("div");
    meta.className = "project-meta";
    [project.client, project.date].filter(Boolean).forEach((value) => {
      const entry = document.createElement("span");
      entry.textContent = value;
      meta.append(entry);
    });
    description.append(meta);
  }
  const technologies = document.createElement("div");
  technologies.className = "project-tech";
  (project.technologies || []).forEach((technology) => technologies.append(makeTechnologyBadge(technology)));
  const actions = document.createElement("div");
  actions.className = "project-actions";
  const live = document.createElement("a");
  live.className = "button button--outline button--tiny";
  live.href = safeLink(project.liveDemoUrl);
  live.textContent = "Live Demo ↗";
  const projectLink = project.projectUrl || project.customUrl;
  if (projectLink) {
    const view = document.createElement("a");
    view.className = "text-link";
    view.href = safeLink(projectLink);
    view.append("View Project ", document.createTextNode("↗"));
    actions.append(view);
  }
  if (project.githubUrl) {
    const github = document.createElement("a");
    github.className = "text-link";
    github.href = safeLink(project.githubUrl);
    github.append("GitHub ", document.createTextNode("↗"));
    actions.append(github);
  }
  actions.prepend(live);
  (project.images || []).slice(0, 4).forEach((imageUrl, index) => {
    const imageLink = document.createElement("a");
    imageLink.className = "project-gallery-link";
    imageLink.href = safeLink(projectLink || project.liveDemoUrl);
    imageLink.textContent = `Image ${index + 2} ↗`;
    actions.append(imageLink);
  });
  info.append(description, technologies, actions);
  article.append(info);
  return article;
}

function renderProjects(content) {
  const grid = document.querySelector(".projects-grid");
  const projects = content.projects.filter((project) => project.visible !== false && project.status !== "Draft").sort((a, b) => a.order - b.order);
  if (!projects.length) {
    const empty = document.createElement("p");
    empty.className = "project-disclaimer";
    empty.textContent = "New portfolio projects will be added here soon.";
    grid.replaceChildren(empty);
    return;
  }
  const featured = projects.findIndex((project) => project.featured);
  const ordered = [...projects];
  if (featured > 0) ordered.unshift(ordered.splice(featured, 1)[0]);
  grid.replaceChildren(...ordered.map((project, index) => makeProjectCard(project, index === 0)));
}

function renderProcess(content) {
  document.querySelector(".process-grid").replaceChildren(...content.process.filter((step) => step.visible !== false).sort((a, b) => a.order - b.order).map((step) => {
    const article = document.createElement("article");
    article.className = "process-step reveal";
    const number = document.createElement("span");
    number.className = "step-no";
    number.textContent = step.number;
    const icon = document.createElement("span");
    icon.className = "step-symbol";
    icon.textContent = step.icon || "✳";
    const title = document.createElement("h3");
    title.textContent = step.title;
    const description = document.createElement("p");
    description.textContent = step.description;
    article.append(number, icon, title, description);
    return article;
  }));
}

function renderFeatures(content) {
  document.querySelector(".features-grid").replaceChildren(...content.features.filter((feature) => feature.visible !== false).sort((a, b) => a.order - b.order).map((feature) => {
    const article = document.createElement("article");
    article.className = "feature-card reveal";
    const icon = document.createElement("span");
    icon.className = "feature-icon";
    icon.textContent = feature.icon || "✳";
    const title = document.createElement("h3");
    title.textContent = feature.title;
    const description = document.createElement("p");
    description.textContent = feature.description;
    article.append(icon, title, description);
    return article;
  }));
}

function renderTestimonials(content) {
  const track = document.querySelector(".testimonial-track");
  track.replaceChildren();
  const testimonials = content.testimonials.filter((item) => item.visible !== false);
  if (!testimonials.length) {
    const empty = document.createElement("article");
    empty.className = "testimonial-card";
    const title = document.createElement("p");
    title.textContent = "Verified client testimonials will be added here with permission.";
    empty.append(title);
    track.append(empty);
    document.querySelector(".testimonial-note").textContent = "No client reviews published yet.";
  } else {
    testimonials.forEach((item) => {
      const card = document.createElement("article");
      card.className = "testimonial-card";
      const rating = document.createElement("div");
      rating.className = "stars";
      rating.setAttribute("aria-label", `${item.rating || 5} out of 5 stars`);
      rating.textContent = "★".repeat(Math.max(1, Math.min(5, Number(item.rating) || 5)));
      const review = document.createElement("p");
      review.textContent = `“${item.review}”`;
      const client = document.createElement("div");
      client.className = "client";
      const avatar = document.createElement("span");
      avatar.className = "client-avatar";
      if (item.photo) {
        const image = document.createElement("img");
        image.src = safeImage(item.photo);
        image.alt = "";
        avatar.append(image);
      } else avatar.textContent = (item.clientName || "C").slice(0, 1);
      const info = document.createElement("span");
      const name = document.createElement("b");
      name.textContent = item.clientName;
      const role = document.createElement("small");
      role.textContent = [item.role, item.business].filter(Boolean).join(" · ");
      info.append(name, role);
      client.append(avatar, info);
      card.append(rating, review, client);
      track.append(card);
    });
    document.querySelector(".testimonial-note").textContent = "Testimonials are published only after client approval.";
  }
  testimonialIndex = 0;
  track.style.transform = "translateX(0)";
  bindTestimonialControls();
}

function updateContact(content) {
  const contact = content.contact;
  const options = document.querySelector(".contact-options");
  const links = {
    whatsapp: { href: contact.whatsapp ? `https://wa.me/${contact.whatsapp.replace(/\D/g, "").replace(/^0/, "880")}` : "", label: contact.whatsapp },
    phone: { href: contact.phone ? `tel:${contact.phone.startsWith("+") ? contact.phone : `+88${contact.phone}`}` : "", label: contact.phone },
    messenger: { href: contact.messenger, label: contact.messenger ? "Message me" : "Messenger" },
    email: { href: contact.email ? `mailto:${contact.email}` : "", label: contact.email }
  };
  Object.entries(links).forEach(([key, value]) => {
    const anchor = options.querySelector(`[data-contact="${key}"]`);
    anchor.href = safeLink(value.href, "#contact");
    anchor.hidden = !value.href;
    const text = anchor.querySelector("b");
    if (value.label) text.textContent = value.label;
  });
  const note = document.querySelector(".contact-placeholder-note");
  note.textContent = [contact.location, contact.phone].filter(Boolean).join(" · ");
  const email = document.querySelector('.footer-social a[href^="mailto:"]');
  if (email && contact.email) {
    email.href = `mailto:${contact.email}`;
    email.textContent = contact.email;
  }
  const phoneFooter = document.querySelector(".footer-social > small");
  if (phoneFooter) {
    phoneFooter.replaceChildren();
    if (contact.phone) {
      const tel = document.createElement("a");
      tel.href = links.phone.href;
      tel.textContent = contact.phone;
      phoneFooter.append("Phone: ", tel);
    }
    if (contact.phone && contact.email) phoneFooter.append(" · ");
    if (contact.email) {
      const mail = document.createElement("a");
      mail.href = `mailto:${contact.email}`;
      mail.textContent = contact.email;
      phoneFooter.append(mail);
    }
  }
  const socialMap = { facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn", github: "GitHub" };
  Object.entries(socialMap).forEach(([key, label]) => {
    const anchor = document.querySelector(`.footer-social a[aria-label="${label}"]`);
    if (!anchor) return;
    const url = contact.social?.[key];
    anchor.href = url ? safeLink(url, "#") : "#";
    anchor.hidden = !url;
  });
  const whatsapp = document.querySelector('.footer-social a[aria-label="WhatsApp"]');
  whatsapp.href = links.whatsapp.href;
  whatsapp.hidden = !links.whatsapp.href;
}

function renderNavigation(content) {
  const menu = document.querySelector("#nav-links");
  const hireButton = menu.querySelector(".nav-cta");
  menu.querySelectorAll("a:not(.nav-cta)").forEach((item) => item.remove());
  content.navbar.menu.filter((item) => item.visible !== false).forEach((item) => {
    const link = document.createElement("a");
    link.href = safeLink(item.href, "#home");
    link.textContent = item.label;
    menu.insertBefore(link, hireButton);
  });
  hireButton.textContent = content.navbar.hireMe.label;
  const arrow = document.createElement("span");
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "↗";
  hireButton.append(" ", arrow);
  hireButton.href = safeLink(content.navbar.hireMe.href);
  hireButton.hidden = content.navbar.hireMe.visible === false;

  const brand = document.querySelector(".site-header .brand");
  const mark = brand.querySelector(".brand-mark");
  mark.replaceChildren(document.createTextNode(content.navbar.logo.replace(/\.$/, "")));
  const dot = document.createElement("span");
  dot.textContent = ".";
  mark.append(dot);
  setText(".site-header .brand-copy strong", content.navbar.name);
  setText(".site-header .brand-copy small", content.navbar.subtitle);
  const footerBrand = document.querySelector(".footer-brand .brand");
  footerBrand.querySelector(".brand-mark").replaceChildren(document.createTextNode(content.navbar.logo.replace(/\.$/, "")), dot.cloneNode(true));
  setText(".footer-brand .brand-copy strong", content.footer.name);
  setText(".footer-brand .brand-copy small", content.footer.title);
}

function renderFooter(content) {
  setText(".footer-brand > p", content.footer.description);
  setText(".footer-bottom > span", content.footer.copyright);
  const nav = document.querySelector(".footer-nav");
  nav.querySelectorAll("a").forEach((link) => link.remove());
  content.footer.links.filter((item) => item.visible !== false).forEach((item) => {
    const link = document.createElement("a");
    link.href = safeLink(item.href, "#home");
    link.textContent = item.label;
    nav.append(link);
  });
}

function updateSectionVisibilityAndOrder(content) {
  const mapping = {
    hero: ["#home"], offers: ["#offers", "#offer-details"], about: ["#about"], services: ["#services"],
    skills: ["#skills"], projects: ["#projects"], process: ["#process"], features: ["#why-choose-me"],
    testimonials: ["#testimonials"], contact: ["#contact"]
  };
  Object.entries(mapping).forEach(([key, selectors]) => {
    selectors.forEach((selector) => {
      const section = document.querySelector(selector);
      if (section) section.hidden = content.sections.visibility[key] === false;
    });
  });
  document.querySelector("#site-footer").hidden = content.sections.visibility.footer === false;
  const main = document.querySelector("main");
  const cta = main.querySelector(".final-cta");
  for (const key of content.sections.order) {
    const selectors = mapping[key];
    if (!selectors) continue;
    selectors.forEach((selector) => {
      const section = document.querySelector(selector);
      if (section && !section.hidden) main.insertBefore(section, cta);
    });
  }
  if (content.sections.visibility.contact === false) cta.hidden = true;
  else cta.hidden = false;
}

function applySiteContent(content) {
  if (!content || !content.hero || !content.sections) return;
  renderNavigation(content);
  setText(".hero .eyebrow", content.hero.eyebrow);
  const eyebrow = document.querySelector(".hero .eyebrow");
  const eyebrowDot = document.createElement("span");
  eyebrowDot.className = "eyebrow-dot";
  eyebrow.prepend(eyebrowDot, document.createTextNode(" "));
  renderWordsHeading(document.querySelector(".hero h1"), content.hero.heading);
  setText(".hero-intro", content.hero.role);
  setText(".hero-description", content.hero.description);
  setText(".availability", content.hero.availability);
  const availability = document.querySelector(".availability");
  availability.prepend(Object.assign(document.createElement("span"), { className: "status-pulse" }));
  setImage(".portrait-frame img", content.hero.photo);
  document.querySelector(".hero-tech").replaceChildren(...content.hero.technologies.map(makeTechnologyBadge));
  const heroButtons = document.querySelectorAll(".hero-actions .button");
  [
    { data: content.hero.primaryButton, fallback: heroButtons[0] },
    { data: content.hero.secondaryButton, fallback: heroButtons[1] }
  ].forEach(({ data, fallback }) => {
    fallback.textContent = data.label;
    fallback.append(" ↗");
    fallback.href = safeLink(data.href);
    fallback.hidden = data.visible === false;
  });
  document.documentElement.style.setProperty("--bg", /^#[\da-f]{3,8}$/i.test(content.hero.background) ? content.hero.background : "#080a12");
  document.body.style.backgroundColor = /^#[\da-f]{3,8}$/i.test(content.appearance.background) ? content.appearance.background : "";
  document.documentElement.style.setProperty("--cms-radius", `${Math.max(0, Math.min(32, Number(content.appearance.borderRadius) || 13))}px`);
  document.documentElement.style.setProperty("--cms-primary", /^#[\da-f]{3,8}$/i.test(content.appearance.primaryColor) ? content.appearance.primaryColor : "#627dff");
  document.documentElement.style.setProperty("--cms-secondary", /^#[\da-f]{3,8}$/i.test(content.appearance.secondaryColor) ? content.appearance.secondaryColor : "#a477ff");

  setText(".about-copy .section-label", content.about.label);
  renderWordsHeading(document.querySelector(".about-copy .section-title"), content.about.heading);
  setText(".about-short-intro", content.about.shortIntroduction);
  setText(".about-description", content.about.description);
  const aboutHighlights = document.querySelector(".about-highlights");
  aboutHighlights.replaceChildren(...[content.about.experience, content.about.skills, content.about.clientFocused].filter(Boolean).map((value) => {
    const line = document.createElement("span");
    line.textContent = value;
    return line;
  }));
  setImage(".about-image img", content.about.photo);
  const stats = document.querySelector(".stats-grid");
  stats.replaceChildren(...content.about.stats.map((stat) => {
    const wrapper = document.createElement("div");
    wrapper.className = "stat";
    const value = document.createElement("strong");
    value.textContent = stat.value;
    const label = document.createElement("small");
    label.textContent = stat.label;
    wrapper.append(value, label);
    return wrapper;
  }));
  const cvLink = document.querySelector(".about-copy .text-link");
  cvLink.href = safeLink(content.about.cvUrl || content.cv?.url, "#contact");
  cvLink.hidden = !(content.about.cvUrl || content.cv?.url);
  if (content.about.cvName || content.cv?.name) {
    cvLink.replaceChildren(`Download ${content.about.cvName || content.cv.name} `, document.createTextNode("↓"));
    cvLink.setAttribute("download", content.about.cvName || content.cv.name);
  }

  renderServices(content);
  renderSkills(content);
  renderProjects(content);
  renderProcess(content);
  renderFeatures(content);
  renderTestimonials(content);

  document.querySelectorAll(".offer-copy h2").forEach((element) => { element.textContent = content.offer.heading; });
  document.querySelectorAll(".offer-copy p, .special-copy p").forEach((element) => { element.textContent = content.offer.description; });
  setText(".offer-kicker > span:last-child", content.offer.label);
  const discount = document.querySelector(".offer-discount strong");
  discount.textContent = content.offer.discount.replace("%", "");
  const percent = document.createElement("span");
  percent.textContent = "%";
  discount.append(percent);
  setText(".offer-discount small", "OFF");
  const stripButton = document.querySelector(".offer-strip-inner > .button");
  stripButton.textContent = content.offer.buttonText;
  stripButton.href = safeLink(content.offer.buttonLink);
  const stripArrow = document.createElement("span");
  stripArrow.textContent = "↗";
  stripButton.append(" ", stripArrow);
  const specialHeading = document.querySelector(".special-copy h2");
  specialHeading.replaceChildren(document.createTextNode(`${content.offer.heading} `));
  const offerAccent = document.createElement("span");
  offerAccent.className = "gradient-text";
  offerAccent.textContent = `${content.offer.discount} OFF`;
  specialHeading.append(offerAccent);
  const specialLink = document.querySelector(".special-copy .button");
  specialLink.href = safeLink(content.offer.buttonLink);
  specialLink.replaceChildren(document.createTextNode(content.offer.buttonText), document.createTextNode(" ↗"));
  document.querySelector(".offer-checklist").replaceChildren(
    ...content.offer.features.map((feature) => {
      const item = document.createElement("span");
      item.textContent = `✓ ${feature}`;
      return item;
    }),
    Object.assign(document.createElement("small"), { textContent: "Offer details are subject to confirmation." })
  );
  document.querySelector(".offer-strip").hidden = content.offer.active === false;
  document.querySelector("#offer-details").hidden = content.offer.active === false;
  updateContact(content);
  renderFooter(content);
  document.title = content.seo.title || content.site.title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", content.seo.description || content.site.description);
  document.querySelector('meta[name="keywords"]')?.setAttribute("content", content.seo.keywords || content.site.keywords);
  document.querySelector('meta[name="author"]')?.setAttribute("content", content.seo.author || content.site.author);
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", content.seo.title || content.site.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", content.seo.description || content.site.description);
  document.querySelector('meta[property="og:image"]')?.setAttribute("content", safeImage(content.seo.ogImage, ""));
  if (content.seo.favicon) {
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.append(favicon);
    }
    favicon.href = safeImage(content.seo.favicon, "");
  }
  const style = document.documentElement.style;
  if (/^#[\da-f]{3,8}$/i.test(content.appearance.accentColor)) style.setProperty("--cms-accent", content.appearance.accentColor);
  document.body.dataset.buttonStyle = content.appearance.buttonStyle || "Rounded";
  document.body.dataset.cardStyle = content.appearance.cardStyle || "Glass";
  document.body.classList.toggle("no-motion", content.appearance.animations === false);
  updateSectionVisibilityAndOrder(content);
  refreshReveals();
}

async function loadPublishedContent() {
  const preview = new URLSearchParams(window.location.search).get("preview") === "1";
  if (window.location.protocol === "file:") {
    try {
      const encodedPreview = window.location.hash.match(/^#cms-preview=([A-Za-z0-9_-]+)$/)?.[1];
      if (preview && encodedPreview) {
        const binary = atob(encodedPreview.replace(/-/g, "+").replace(/_/g, "/"));
        const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
        applySiteContent(JSON.parse(new TextDecoder().decode(bytes)));
      } else {
        const key = preview ? "md-ovi-cms-draft" : "md-ovi-cms-published";
        const stored = window.localStorage.getItem(key);
        if (stored) applySiteContent(JSON.parse(stored));
        else if (window.MD_OVI_DEFAULTS) applySiteContent(window.MD_OVI_DEFAULTS);
      }
      if (preview) {
        const banner = document.createElement("div");
        banner.className = "private-preview-banner";
        banner.textContent = "LOCAL PREVIEW · Browser-only changes";
        document.body.append(banner);
      }
    } catch (error) {
      console.error("Unable to load local portfolio preview:", error.message);
    }
    return;
  }
  if (!["http:", "https:"].includes(window.location.protocol)) return;
  if (!preview && window.MD_OVI_DEFAULTS) applySiteContent(window.MD_OVI_DEFAULTS);
  try {
    const response = await fetch(`/api/public/content${preview ? "?preview=1" : ""}`, { cache: "no-store", credentials: "same-origin" });
    if (!response.ok) {
      if (preview && response.status === 401) {
        window.location.replace("/admin-login.html");
        return;
      }
      throw new Error(`Content request failed (${response.status}).`);
    }
    const result = await response.json();
    applySiteContent(result.content);
    if (result.preview) {
      const banner = document.createElement("div");
      banner.className = "private-preview-banner";
      banner.textContent = "PRIVATE DRAFT PREVIEW · Not published";
      document.body.append(banner);
    }
  } catch (error) {
    console.error("Unable to load published portfolio content:", error.message);
  }
}

const form = document.querySelector("#project-form");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const feedback = document.querySelector("#form-feedback");
  if (!form.reportValidity()) {
    feedback.textContent = "Please complete the required fields with a valid email.";
    feedback.classList.add("is-error");
    return;
  }
  const formData = new FormData(form);
  const request = Object.fromEntries(formData.entries());
  delete request.companyWebsite;
  feedback.classList.remove("is-error");
  feedback.textContent = "Sending your request…";
  try {
    if (window.location.protocol === "file:") {
      const key = "md-ovi-cms-inquiries";
      const saved = window.localStorage.getItem(key);
      const inquiries = saved ? JSON.parse(saved) : [];
      inquiries.unshift({
        id: crypto.randomUUID(),
        name: request.name,
        email: request.email,
        phone: request.phone || "",
        business_type: request.business || "",
        website_type: request.websiteType || "",
        budget: request.budget || "",
        message: request.message,
        status: "New",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      window.localStorage.setItem(key, JSON.stringify(inquiries));
      feedback.textContent = "Saved in this browser's local preview only. This request was not sent to Md Ovi.";
      form.reset();
      return;
    }
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Unable to send your request.");
    feedback.textContent = result.message;
    form.reset();
  } catch (error) {
    feedback.textContent = `${error.message} Please email ovim3015@gmail.com instead.`;
    feedback.classList.add("is-error");
  }
});

bindTestimonialControls();
refreshReveals();
loadPublishedContent();
