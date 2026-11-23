"use strict";

/* =========================================================
   CONFIG
   Change GITHUB_USER to your own GitHub username.
   ========================================================= */
const GITHUB_USER = "octocat";
const STORAGE_KEY = "grace-portfolio-prefs";

/* =========================================================
   DATA: projects stored as an array of objects (Week 4)
   ========================================================= */
const projects = [
  {
    id: 1,
    title: "AskHerlexa",
    category: "Business",
    summary: "Errand and delivery service for working mothers in Osogbo.",
    details: "Busy working mothers hand off errands and deliveries so they get their time back. I handle positioning, pricing and day-to-day operations.",
    tags: ["Service design", "Logistics", "Osogbo"]
  },
  {
    id: 2,
    title: "Corporate & Laptop Bags",
    category: "Business",
    summary: "Early-stage bag line for bankers, corporate and tech workers.",
    details: "Designing practical, professional bags for people who commute with laptops every day. Currently validating the idea with market research.",
    tags: ["Product", "Research", "Retail"]
  },
  {
    id: 3,
    title: "This Portfolio",
    category: "Web",
    summary: "Interactive portfolio built with semantic HTML, CSS and vanilla JS.",
    details: "Flexbox navbar, Grid card layout, DOM events with delegation, a validated contact form and a saved theme preference.",
    tags: ["HTML", "CSS", "JavaScript"]
  },
  {
    id: 4,
    title: "Repository Explorer",
    category: "Web",
    summary: "Live GitHub repositories with search and language filter.",
    details: "Fetches public repositories from the GitHub API and lets visitors search by name and filter by language.",
    tags: ["Fetch API", "async/await", "DOM"]
  }
];

/* =========================================================
   PURE HELPER FUNCTIONS (these RETURN values)
   ========================================================= */
function filterProjects(list, category) {
  if (category === "All") {
    return list;
  }
  return list.filter((project) => project.category === category);
}

function getCategories(list) {
  return ["All", ...new Set(list.map((project) => project.category))];
}

function countByCategory(list) {
  return list.reduce((counts, project) => {
    counts[project.category] = (counts[project.category] || 0) + 1;
    return counts;
  }, { All: list.length });
}

function filterRepos(repos, query, language) {
  const needle = query.trim().toLowerCase();
  return repos.filter((repo) => {
    const matchesText = needle === "" ||
      repo.name.toLowerCase().includes(needle) ||
      (repo.description || "").toLowerCase().includes(needle);
    const matchesLanguage = language === "all" || repo.language === language;
    return matchesText && matchesLanguage;
  });
}

function getLanguages(repos) {
  const languages = repos.map((repo) => repo.language).filter(Boolean);
  return [...new Set(languages)].sort();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function validateForm(values) {
  const errors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const message = values.message.trim();

  if (name.length < 2) {
    errors.name = "Please enter your name (at least 2 characters).";
  }
  if (email === "") {
    errors.email = "Please enter your email address.";
  } else if (!isValidEmail(email)) {
    errors.email = "Please enter a valid email, like name@example.com.";
  }
  if (message.length < 10) {
    errors.message = "Your message should be at least 10 characters.";
  }
  return errors;
}

/* =========================================================
   LOCAL STORAGE (JSON.stringify / JSON.parse / try-catch)
   ========================================================= */
function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
}

function savePrefs(patch) {
  try {
    const updated = { ...loadPrefs(), ...patch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    /* Storage unavailable or full: the site still works without it. */
  }
}

/* =========================================================
   DOM HELPERS: createElement + textContent only
   ========================================================= */
function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) {
    el.className = className;
  }
  if (text !== undefined) {
    el.textContent = text;
  }
  return el;
}

function createTagList(tags) {
  const list = createEl("ul", "tag-list");
  tags.forEach((tag) => list.append(createEl("li", "", tag)));
  return list;
}

/* =========================================================
   THEME TOGGLE
   ========================================================= */
const themeToggle = document.querySelector("#theme-toggle");
const themeLabel = document.querySelector("#theme-label");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
  themeLabel.textContent = theme === "dark" ? "Light mode" : "Dark mode";
}

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  savePrefs({ theme: next });
});

/* =========================================================
   PROJECTS: render, filter, and event delegation
   ========================================================= */
const projectList = document.querySelector("#project-list");
const projectFilters = document.querySelector("#project-filters");
const projectCount = document.querySelector("#project-count");
let activeCategory = "All";

function buildProjectCard(project) {
  const card = createEl("article", "project-card");
  card.dataset.id = String(project.id);

  const detailsId = `project-details-${project.id}`;
  const details = createEl("p", "card-details", project.details);
  details.id = detailsId;
  details.hidden = true;

  const toggle = createEl("button", "card-toggle", "Show details");
  toggle.type = "button";
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", detailsId);

  card.append(
    createEl("h3", "", project.title),
    createEl("p", "card-meta", project.category),
    createEl("p", "", project.summary),
    createTagList(project.tags),
    details,
    toggle
  );
  return card;
}

function renderProjects() {
  const visible = filterProjects(projects, activeCategory);
  projectList.replaceChildren(...visible.map(buildProjectCard));
  projectCount.textContent = `Showing ${visible.length} of ${projects.length} projects`;
}

function renderProjectFilters() {
  const counts = countByCategory(projects);
  const buttons = getCategories(projects).map((category) => {
    const btn = createEl("button", "filter-btn", `${category} (${counts[category]})`);
    btn.type = "button";
    btn.dataset.category = category;
    btn.setAttribute("aria-pressed", String(category === activeCategory));
    return btn;
  });
  projectFilters.replaceChildren(...buttons);
}

/* Event delegation: ONE listener handles every card's toggle button. */
projectList.addEventListener("click", (event) => {
  const toggle = event.target.closest(".card-toggle");
  if (!toggle) {
    return;
  }
  const card = toggle.closest(".project-card");
  const details = card.querySelector(".card-details");
  const willOpen = details.hidden;
  details.hidden = !willOpen;
  toggle.setAttribute("aria-expanded", String(willOpen));
  toggle.textContent = willOpen ? "Hide details" : "Show details";
});

/* Event delegation again for the filter buttons. */
projectFilters.addEventListener("click", (event) => {
  const btn = event.target.closest(".filter-btn");
  if (!btn) {
    return;
  }
  activeCategory = btn.dataset.category;
  renderProjectFilters();
  renderProjects();
});

/* =========================================================
   GITHUB API: fetch, search, filter
   ========================================================= */
const repoList = document.querySelector("#repo-list");
const repoStatus = document.querySelector("#repo-status");
const repoSearch = document.querySelector("#repo-search");
const repoLanguage = document.querySelector("#repo-language");
const repoForm = repoSearch.closest("form");
let allRepos = [];

function buildRepoCard(repo) {
  const card = createEl("article", "repo-card");
  const heading = createEl("h3");
  const link = createEl("a", "", repo.name);
  link.href = repo.html_url;
  link.rel = "noopener noreferrer";
  heading.append(link);

  card.append(
    heading,
    createEl("p", "", repo.description || "No description provided."),
    createEl("p", "card-meta", `${repo.language || "Unknown language"} | ${repo.stargazers_count} stars`)
  );
  return card;
}

function renderRepos() {
  const visible = filterRepos(allRepos, repoSearch.value, repoLanguage.value);
  repoList.replaceChildren(...visible.map(buildRepoCard));
  repoStatus.textContent = visible.length === 0
    ? "No repositories match your search."
    : `Showing ${visible.length} of ${allRepos.length} repositories`;
}

function fillLanguageOptions() {
  const options = getLanguages(allRepos).map((language) => {
    const option = createEl("option", "", language);
    option.value = language;
    return option;
  });
  repoLanguage.append(...options);
}

async function loadRepos() {
  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(GITHUB_USER)}/repos?per_page=100&sort=updated`
    );
    if (!response.ok) {
      throw new Error(`GitHub responded with status ${response.status}`);
    }
    allRepos = await response.json();
    fillLanguageOptions();
    renderRepos();
  } catch (error) {
    repoStatus.textContent = "Sorry, repositories could not be loaded right now. Please try again later.";
  }
}

repoSearch.addEventListener("input", renderRepos);
repoLanguage.addEventListener("change", renderRepos);
repoForm.addEventListener("submit", (event) => event.preventDefault());

/* =========================================================
   CONTACT FORM: validation, accessible errors, saved draft
   ========================================================= */
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const fieldNames = ["name", "email", "message"];

function getFormValues() {
  return {
    name: contactForm.elements.name.value,
    email: contactForm.elements.email.value,
    message: contactForm.elements.message.value
  };
}

function showErrors(errors) {
  fieldNames.forEach((fieldName) => {
    const input = contactForm.elements[fieldName];
    const errorEl = document.querySelector(`#${fieldName}-error`);
    const message = errors[fieldName] || "";
    errorEl.textContent = message;
    input.setAttribute("aria-invalid", String(message !== ""));
  });
}

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formStatus.textContent = "";

  const values = getFormValues();
  const errors = validateForm(values);
  showErrors(errors);

  const firstInvalid = fieldNames.find((fieldName) => errors[fieldName]);
  if (firstInvalid) {
    contactForm.elements[firstInvalid].focus();
    return;
  }

  /* No server is connected yet. Hook up a form service (e.g. Formspree) here. */
  formStatus.textContent = `Thanks, ${values.name.trim()}! Your message passed validation. (Demo only: no server is connected yet.)`;
  contactForm.reset();
  savePrefs({ draft: null });
});

contactForm.addEventListener("input", () => {
  savePrefs({ draft: getFormValues() });
});

function restoreDraft(draft) {
  if (!draft || typeof draft !== "object") {
    return;
  }
  fieldNames.forEach((fieldName) => {
    if (typeof draft[fieldName] === "string") {
      contactForm.elements[fieldName].value = draft[fieldName];
    }
  });
}

/* =========================================================
   INIT
   ========================================================= */
function init() {
  const prefs = loadPrefs();
  applyTheme(prefs.theme === "dark" ? "dark" : "light");
  restoreDraft(prefs.draft);
  renderProjectFilters();
  renderProjects();
  loadRepos();
}

init();