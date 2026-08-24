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

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

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

window.addEventListener('scroll', updateManifest, { passive: true });
window.addEventListener('scroll', updateProcess, { passive: true });
window.addEventListener('resize', updateManifest);
window.addEventListener('resize', updateProcess);
updateManifest();
updateProcess();

function setMenu(open) {
  mobileMenu.classList.toggle('open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  menuToggle.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
}

menuToggle.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
document.querySelectorAll('.mobile-menu a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

document.querySelectorAll('[data-cursor]').forEach((project) => {
  project.addEventListener('mouseenter', () => cursor.classList.add('active'));
  project.addEventListener('mouseleave', () => cursor.classList.remove('active'));
});

projectFilters.forEach((filter) => {
  filter.addEventListener('click', () => {
    const selectedCategory = filter.dataset.filter;

    projectFilters.forEach((item) => item.classList.toggle('is-active', item === filter));
    projects.forEach((project) => {
      const matches = selectedCategory === 'all' || project.dataset.category === selectedCategory;
      project.classList.toggle('is-hidden', !matches);
      project.setAttribute('aria-hidden', String(!matches));
    });
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

contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
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

document.addEventListener('mousemove', (event) => {
  cursor.style.transform = `translate3d(${event.clientX - cursor.offsetWidth / 2}px, ${event.clientY - cursor.offsetHeight / 2}px, 0)`;
});
