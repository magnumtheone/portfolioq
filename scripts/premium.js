const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const cursor = document.querySelector('.cursor');
const projectFilters = document.querySelectorAll('.project-filter');
const projects = document.querySelectorAll('.project');
const contactForm = document.querySelector('#premiumContactForm');
const processSection = document.querySelector('.process');
const processSteps = processSection ? [...processSection.querySelectorAll('.process-step')] : [];
const voicesGrid = document.querySelector('.voices-grid');

if (voicesGrid) {
  [...voicesGrid.querySelectorAll('.voice')].forEach((voice) => {
    const clone = voice.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('a, button, input, textarea, select').forEach((control) => control.setAttribute('tabindex', '-1'));
    voicesGrid.append(clone);
  });
}

// Bouton pause du défilement automatique des témoignages.
const voicesToggle = document.querySelector('[data-voices-toggle]');
voicesToggle?.addEventListener('click', () => {
  const paused = voicesGrid.classList.toggle('is-paused');
  voicesToggle.setAttribute('aria-pressed', String(paused));
  voicesToggle.textContent = paused ? 'Reprendre le défilement' : 'Mettre en pause';
});
document.querySelectorAll('main > section > .section-kicker').forEach((kicker, index) => {
  const number = kicker.querySelector('span');
  if (number) number.textContent = String(index + 1).padStart(2, '0');
});
const projectCarousel = document.querySelector('.project-list');
const carouselPrevious = document.querySelector('[data-carousel-prev]');
const carouselNext = document.querySelector('[data-carousel-next]');
const manifest = document.querySelector('[data-manifest]');
const manifestWords = manifest ? [...manifest.querySelectorAll('.manifest-word')] : [];
const manifestProgress = document.querySelector('.manifest-progress span');
const manifestFill = document.querySelector('.manifest-fill');
const manifestTiles = [];

if (manifestFill) {
  for (let index = 0; index < 48; index += 1) {
    const tile = document.createElement('span');
    tile.className = 'manifest-tile';
    tile.dataset.index = String(index);
    manifestFill.append(tile);
    manifestTiles.push(tile);
  }
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

// Paiement Stripe de l'ebook : le bouton carte n'apparaît que si un lien Payment Link est renseigné.
const stripeEbookButton = document.querySelector('[data-stripe-ebook]');
const stripeEbookLink = stripeEbookButton?.dataset.stripeEbook.trim();
if (stripeEbookButton && stripeEbookLink?.startsWith('https://buy.stripe.com/')) {
  stripeEbookButton.href = stripeEbookLink;
  stripeEbookButton.hidden = false;
  const whatsappButton = document.querySelector('[data-ebook-whatsapp]');
  if (whatsappButton) {
    whatsappButton.className = 'ebook-contact';
    whatsappButton.textContent = 'Mobile Money via WhatsApp';
  }
  const ebookNote = document.querySelector('[data-ebook-note]');
  if (ebookNote) ebookNote.textContent = 'Paiement sécurisé par Stripe · Livraison par email';
}

const yearLabel = document.querySelector('[data-year]');
if (yearLabel) yearLabel.textContent = String(new Date().getFullYear());

function updateManifest() {
  if (!manifest || !manifestWords.length) return;

  const section = manifest.closest('.manifest');
  const scrollableDistance = section.offsetHeight - window.innerHeight;
  const progress = Math.min(1, Math.max(0, (window.scrollY - section.offsetTop) / scrollableDistance));
  const activeIndex = Math.min(manifestWords.length - 1, Math.floor(progress * manifestWords.length));

  manifestWords.forEach((word, index) => word.classList.toggle('is-active', index === activeIndex));
  if (manifestProgress) manifestProgress.style.transform = `scaleX(${progress})`;
  manifestTiles.forEach((tile, index) => {
    const tileProgress = Math.min(1, Math.max(0, (progress - (index / manifestTiles.length) * 0.72) * 3.6));
    const horizontalOrigin = index % 2 === 0 ? -110 : 110;
    const verticalOrigin = index % 3 === 0 ? 70 : -70;
    tile.style.opacity = String(tileProgress);
    tile.style.transform = `translate(${(1 - tileProgress) * horizontalOrigin}%, ${(1 - tileProgress) * verticalOrigin}%) scale(${0.78 + tileProgress * 0.22})`;
  });
}

function updateProcess() {
  if (!processSection || !processSteps.length) return;

  const scrollableDistance = processSection.offsetHeight - window.innerHeight;
  const progress = Math.min(1, Math.max(0, (window.scrollY - processSection.offsetTop) / scrollableDistance));
  const activeIndex = Math.min(processSteps.length - 1, Math.floor(progress * processSteps.length));
  processSteps.forEach((step, index) => step.classList.toggle('is-active', index === activeIndex));
}

// Regroupe les calculs liés au défilement dans une seule frame d'animation.
let scrollFrame = null;
function onScroll() {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = null;
    header.classList.toggle('scrolled', window.scrollY > 30);
    updateManifest();
    updateProcess();
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

function setMenu(open) {
  mobileMenu.classList.toggle('open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  mobileMenu.inert = !open;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.querySelector('.visually-hidden').textContent = open ? 'Fermer le menu' : 'Ouvrir le menu';
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) mobileMenu.querySelector('a')?.focus();
}

mobileMenu.inert = true;
menuToggle.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
document.querySelectorAll('.mobile-menu a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mobileMenu.classList.contains('open')) {
    setMenu(false);
    menuToggle.focus();
  }
});

document.querySelectorAll('[data-cursor]').forEach((project) => {
  project.addEventListener('mouseenter', () => cursor.classList.add('active'));
  project.addEventListener('mouseleave', () => cursor.classList.remove('active'));
});

const carouselCount = document.querySelector('[data-carousel-count]');
const visibleProjects = () => [...projects].filter((project) => !project.classList.contains('is-hidden'));

// Met à jour le compteur « 01 — 06 » selon la carte la plus proche du centre du carrousel.
function updateCarouselCount() {
  if (!projectCarousel || !carouselCount) return;
  const cards = visibleProjects();
  const center = projectCarousel.getBoundingClientRect().left + projectCarousel.clientWidth / 2;
  let current = 0;
  let closest = Infinity;
  cards.forEach((card, index) => {
    const rect = card.getBoundingClientRect();
    const distance = Math.abs(rect.left + rect.width / 2 - center);
    if (distance < closest) {
      closest = distance;
      current = index;
    }
  });
  const pad = (value) => String(value).padStart(2, '0');
  carouselCount.innerHTML = `${pad(cards.length ? current + 1 : 0)} <i></i> ${pad(cards.length)}`;
}

projectFilters.forEach((filter) => {
  const count = filter.dataset.filter === 'all'
    ? projects.length
    : [...projects].filter((project) => project.dataset.category === filter.dataset.filter).length;
  const label = filter.querySelector('span');
  if (label) label.textContent = String(count).padStart(2, '0');
  filter.setAttribute('aria-pressed', String(filter.classList.contains('is-active')));

  filter.addEventListener('click', () => {
    const selectedCategory = filter.dataset.filter;

    projectFilters.forEach((item) => {
      item.classList.toggle('is-active', item === filter);
      item.setAttribute('aria-pressed', String(item === filter));
    });
    projects.forEach((project) => {
      const matches = selectedCategory === 'all' || project.dataset.category === selectedCategory;
      project.classList.toggle('is-hidden', !matches);
      project.setAttribute('aria-hidden', String(!matches));
    });
    projectCarousel?.scrollTo({ left: 0 });
    updateCarouselCount();
  });
});

function moveProjectCarousel(direction) {
  if (!projectCarousel) return;
  const card = projectCarousel.querySelector('.project:not(.is-hidden)');
  const distance = card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(projectCarousel).gap || '0') : projectCarousel.clientWidth;
  projectCarousel.scrollBy({ left: direction * distance, behavior: 'smooth' });
}

carouselPrevious?.addEventListener('click', () => moveProjectCarousel(-1));
carouselNext?.addEventListener('click', () => moveProjectCarousel(1));
projectCarousel?.addEventListener('scroll', () => requestAnimationFrame(updateCarouselCount), { passive: true });
updateCarouselCount();

// Messages d'erreur affichés sous chaque champ obligatoire.
const fieldMessages = {
  nom: { valueMissing: 'Indiquez votre nom.' },
  email: { valueMissing: 'Indiquez votre email.', typeMismatch: 'Cet email ne semble pas valide (exemple : nom@domaine.com).' },
  message: { valueMissing: 'Décrivez votre projet en quelques mots.', tooShort: 'Ajoutez quelques mots de plus (10 caractères minimum).' },
};

function validateField(field) {
  const messages = fieldMessages[field.name];
  if (!messages) return true;
  const error = document.getElementById(field.getAttribute('aria-describedby'));
  const failure = Object.keys(messages).find((key) => field.validity[key]);
  field.setAttribute('aria-invalid', String(Boolean(failure)));
  if (error) error.textContent = failure ? messages[failure] : '';
  return !failure;
}

contactForm?.querySelectorAll('[aria-describedby]').forEach((field) => {
  field.addEventListener('blur', () => { if (field.value) validateField(field); });
  field.addEventListener('input', () => { if (field.getAttribute('aria-invalid') === 'true') validateField(field); });
});

contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const invalidFields = [...contactForm.querySelectorAll('[aria-describedby]')].filter((field) => !validateField(field));
  if (invalidFields.length) {
    invalidFields[0].focus();
    return;
  }
  const submit = contactForm.querySelector('button[type="submit"]');
  const status = contactForm.querySelector('.form-status');
  const originalLabel = submit.innerHTML;
  submit.disabled = true;
  submit.textContent = 'Envoi en cours...';
  status.textContent = '';

  try {
    const formData = new FormData(contactForm);
    formData.append('access_key', 'db97ebd6-8125-4d33-b78a-507f224beb4f');
    const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Envoi impossible');
    window.location.href = 'thanks.html';
  } catch (error) {
    status.textContent = 'Une erreur est survenue. Écrivez directement à contact@davidwawina.site.';
  } finally {
    submit.disabled = false;
    submit.innerHTML = originalLabel;
  }
});

if (window.matchMedia('(hover: hover)').matches) {
  document.addEventListener('mousemove', (event) => {
    cursor.style.transform = `translate3d(${event.clientX - cursor.offsetWidth / 2}px, ${event.clientY - cursor.offsetHeight / 2}px, 0)`;
  });
}
