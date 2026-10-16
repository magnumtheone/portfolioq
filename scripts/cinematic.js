// Couche cinématique : intro, défilement fluide, révélations de titres, parallaxe.
// Tout est optionnel : sans GSAP ou avec « réduire les animations », le site reste tel quel.
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (reduceMotion || !window.gsap || !window.ScrollTrigger) {
    root.classList.remove('is-intro');
    return;
  }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  // --- Défilement fluide (souris / pavé tactile uniquement, le tactile garde le défilement natif) ---
  let lenis = null;
  if (window.Lenis && finePointer) {
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || link.classList.contains('skip-link')) return;
      const hash = link.getAttribute('href');
      if (hash.length < 2) return;
      const target = hash === '#top' ? 0 : document.querySelector(hash);
      if (target === null) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: -80, duration: 1.4 });
      history.replaceState(null, '', hash);
    });

    // Bloque le défilement de la page quand le menu plein écran est ouvert.
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenu) {
      new MutationObserver(() => (mobileMenu.classList.contains('open') ? lenis.stop() : lenis.start()))
        .observe(mobileMenu, { attributes: true, attributeFilter: ['class'] });
    }
  }

  // --- Découpe des titres en lignes masquées (une ligne par <br>) ---
  function maskLines(element) {
    element.classList.remove('reveal');
    element.innerHTML = element.innerHTML
      .split(/<br\s*\/?>/i)
      .map((part) => `<span class="cine-line"><span>${part.trim()}</span></span>`)
      .join('');
    return element.querySelectorAll('.cine-line > span');
  }

  // --- Hero ---
  const hero = document.querySelector('.hero');
  const heroLines = [...document.querySelectorAll('.hero-title .line')].map((line) => {
    line.classList.remove('reveal', 'delay-1', 'delay-2', 'delay-3');
    line.classList.add('cine-line');
    line.innerHTML = `<span>${line.innerHTML}</span>`;
    return line.firstElementChild;
  });
  const heroExtras = ['.hero > .eyebrow', '.hero-bottom', '.hero-meta']
    .map((selector) => document.querySelector(selector))
    .filter(Boolean);
  heroExtras.forEach((element) => element.classList.remove('reveal', 'delay-1', 'delay-2', 'delay-3'));
  if (hero) hero.insertAdjacentHTML('afterbegin', '<div class="hero-vignette" aria-hidden="true"></div>');

  gsap.set(heroLines, { yPercent: 115 });
  gsap.set(heroExtras, { autoAlpha: 0, y: 24 });

  function playHero(delay = 0) {
    const timeline = gsap.timeline({ delay });
    timeline
      .to(heroLines, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.11 })
      .to(heroExtras, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.12 }, '-=0.9')
      .from('.hero-orbit', { autoAlpha: 0, duration: 2, ease: 'power2.out' }, 0);
    return timeline;
  }

  // --- Intro (une fois par session) ---
  if (root.classList.contains('is-intro')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="curtain" aria-hidden="true">
        <div class="curtain-panel"></div><div class="curtain-panel"></div>
        <div class="curtain-content">
          <span class="curtain-name"><span>DAVID <em>MBULA</em></span></span>
          <span class="curtain-count">000</span>
        </div>
        <span class="curtain-line"></span>
      </div>`);
    root.classList.remove('is-intro');
    lenis?.stop();

    const curtain = document.querySelector('.curtain');
    const counter = { value: 0 };
    const count = curtain.querySelector('.curtain-count');
    const panels = curtain.querySelectorAll('.curtain-panel');

    const intro = gsap.timeline({
      onComplete: () => {
        curtain.remove();
        lenis?.start();
        try { sessionStorage.setItem('dm-intro', '1'); } catch (error) { /* stockage indisponible */ }
      },
    })
      .from('.curtain-name > span', { yPercent: 110, duration: 0.9, ease: 'expo.out' })
      .to('.curtain-line', { scaleX: 1, duration: 1.1, ease: 'expo.inOut' }, 0.1)
      .to(counter, {
        value: 100,
        duration: 1.1,
        ease: 'power2.inOut',
        onUpdate: () => { count.textContent = String(Math.round(counter.value)).padStart(3, '0'); },
      }, 0.1)
      .to(['.curtain-name > span', '.curtain-count'], { yPercent: -110, autoAlpha: 0, duration: 0.55, ease: 'power3.in' }, '+=0.15')
      .to('.curtain-line', { scaleX: 0, transformOrigin: 'right center', duration: 0.5, ease: 'power3.in' }, '<')
      .to(panels[0], { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '-=0.1')
      .to(panels[1], { yPercent: 100, duration: 1.1, ease: 'expo.inOut' }, '<')
      .add(playHero(), '-=0.55');

    // Filet de sécurité : si l'animation n'a pas pu se dérouler (onglet en arrière-plan…), on affiche la page.
    setTimeout(() => {
      if (document.body.contains(curtain)) intro.progress(1);
    }, 6000);
  } else {
    playHero(0.15);
  }

  // --- Sortie du hero : le titre recule et s'efface pendant que l'orbite monte ---
  if (hero) {
    gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
      .to('.hero-title', { yPercent: -18, scale: 0.92, autoAlpha: 0.15, transformOrigin: 'left center', ease: 'none' }, 0)
      .to('.hero-orbit', { yPercent: -35, scale: 1.15, ease: 'none' }, 0);
  }

  // --- Titres de section : lignes qui montent depuis leur masque ---
  document.querySelectorAll('main section:not(.hero) .display-title, .contact-title').forEach((title) => {
    const lines = maskLines(title);
    gsap.from(lines, {
      yPercent: 115,
      duration: 1.2,
      ease: 'expo.out',
      stagger: 0.12,
      scrollTrigger: { trigger: title, start: 'top 85%' },
    });
  });

  // --- Images de projets : ouverture du cadre et léger dézoom ---
  document.querySelectorAll('.project-image').forEach((frame) => {
    const image = frame.querySelector('img');
    const trigger = { trigger: frame, start: 'top 88%' };
    gsap.fromTo(frame, { clipPath: 'inset(12% 12% 12% 12%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.out', scrollTrigger: trigger });
    // clearProps rend la main au zoom CSS du survol une fois l'animation finie.
    if (image) gsap.fromTo(image, { scale: 1.3 }, { scale: 1, duration: 1.8, ease: 'expo.out', clearProps: 'transform', scrollTrigger: { ...trigger } });
  });

  // --- Portrait : rideau vertical puis parallaxe ---
  const aboutPhoto = document.querySelector('.about-photo');
  if (aboutPhoto) {
    const photo = aboutPhoto.querySelector('img');
    aboutPhoto.classList.remove('reveal');
    gsap.fromTo(aboutPhoto, { clipPath: 'inset(100% 0% 0% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut',
      scrollTrigger: { trigger: aboutPhoto, start: 'top 80%' },
    });
    if (photo) {
      gsap.fromTo(photo, { yPercent: -8, scale: 1.18 }, {
        yPercent: 8, ease: 'none',
        scrollTrigger: { trigger: aboutPhoto, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }
  }

  // --- Couverture d'ebook : arrivée en rotation puis inclinaison 3D à la souris ---
  const cover = document.querySelector('.ebook-cover');
  if (cover) {
    cover.classList.remove('reveal');
    gsap.set(cover, { rotation: -4 });
    gsap.from(cover, {
      y: 120, rotation: -16, autoAlpha: 0, duration: 1.6, ease: 'expo.out',
      scrollTrigger: { trigger: cover, start: 'top 85%' },
    });
    if (finePointer) {
      const offer = document.querySelector('.ebooks-offer');
      const tiltX = gsap.quickTo(cover, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      const tiltY = gsap.quickTo(cover, 'rotationY', { duration: 0.6, ease: 'power3.out' });
      offer?.addEventListener('pointermove', (event) => {
        const box = cover.getBoundingClientRect();
        tiltY(((event.clientX - (box.left + box.width / 2)) / window.innerWidth) * 30);
        tiltX(-((event.clientY - (box.top + box.height / 2)) / window.innerHeight) * 24);
      });
      offer?.addEventListener('pointerleave', () => { tiltX(0); tiltY(0); });
    }
  }

  // --- Orbite du hero qui suit légèrement la souris ---
  if (finePointer && hero) {
    const orbitX = gsap.quickTo('.hero-orbit', 'x', { duration: 1.2, ease: 'power3.out' });
    const orbitY = gsap.quickTo('.hero-orbit', 'y', { duration: 1.2, ease: 'power3.out' });
    hero.addEventListener('pointermove', (event) => {
      orbitX((event.clientX / window.innerWidth - 0.5) * 60);
      orbitY((event.clientY / window.innerHeight - 0.5) * 40);
    });
  }

  // --- Boutons magnétiques ---
  if (finePointer) {
    document.querySelectorAll('.header-cta, .hero-action-link, .circle-link-next, .contact-submit, .ebook-buy').forEach((button) => {
      button.classList.add('is-magnetic');
      const moveX = gsap.quickTo(button, 'x', { duration: 0.5, ease: 'power3.out' });
      const moveY = gsap.quickTo(button, 'y', { duration: 0.5, ease: 'power3.out' });
      button.addEventListener('pointermove', (event) => {
        const box = button.getBoundingClientRect();
        moveX((event.clientX - (box.left + box.width / 2)) * 0.3);
        moveY((event.clientY - (box.top + box.height / 2)) * 0.3);
      });
      button.addEventListener('pointerleave', () => { moveX(0); moveY(0); });
    });
  }

  // --- Barre de progression de lecture ---
  document.body.insertAdjacentHTML('beforeend', '<div class="scroll-progress" aria-hidden="true"></div>');
  gsap.to('.scroll-progress', {
    scaleX: 1, ease: 'none',
    scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
  });

  // Les polices et images changent les hauteurs : on recalcule les déclencheurs.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
