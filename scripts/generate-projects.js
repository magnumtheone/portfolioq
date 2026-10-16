#!/usr/bin/env node
// Génère les études de cas dans projets/ à partir des données ci-dessous.
// Usage : node scripts/generate-projects.js
// Pour modifier une étude de cas, changez ses données ici puis relancez le script.

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://davidwawina.site';
const OUTPUT_DIR = path.join(__dirname, '..', 'projets');
const WHATSAPP = 'https://wa.me/243816684426';

const projects = [
  {
    slug: 'glodi-vip',
    name: 'Hôtel Glodi VIP',
    sector: 'Hôtellerie',
    city: 'Kisangani',
    type: 'Site hôtelier',
    stack: 'Django · React · Tailwind',
    status: 'En ligne',
    url: 'https://glodi-vip.com',
    image: 'glody.webp',
    imageSize: [1600, 767],
    imageAlt: "Page d'accueil du site de l'Hôtel Glodi VIP",
    lead: "Un hôtel haut de gamme de Kisangani qui propose chambres, appartements, entrepôts et espaces de réception, réunis dans une seule vitrine pensée pour déclencher la réservation.",
    need: [
      "L'hôtel ne vend pas qu'une chose : des chambres, des appartements à la nuit ou au mois, des entrepôts, un restaurant, des salles de réception. Il fallait présenter cette offre large sans perdre le visiteur, et l'amener vers une demande de réservation.",
    ],
    built: [
      "<strong>Accueil</strong> avec l'accroche « L'Art du Luxe à Kisangani » et deux appels à l'action",
      "<strong>Chambres et suites</strong> avec leur tarif affiché dès la carte (à partir de 30 $)",
      "<strong>Appartements</strong> à la nuit ou au mois, chacun avec sa page détaillée",
      "<strong>Entrepôts</strong> de 200 à 800 m² pour la clientèle professionnelle",
      "<strong>Restaurant et expériences</strong> : cuisine congolaise et internationale, bien-être, affaires, excursions",
      "<strong>Version française et anglaise</strong> du site",
      "<strong>Réservation</strong> par formulaire, WhatsApp ou téléphone",
    ],
    choices: [
      "Les prix sont visibles tout de suite : le visiteur sait à quoi s'attendre avant de contacter l'hôtel.",
      "WhatsApp et le téléphone sont proposés à côté de chaque offre, parce que c'est ainsi que la clientèle locale réserve.",
      "La bascule français / anglais s'adresse aux voyageurs d'affaires venus de l'étranger.",
    ],
  },
  {
    slug: 'hotel-eden',
    name: 'Hôtel Eden 24 Novembre',
    sector: 'Hôtellerie',
    city: 'Kinshasa',
    type: 'Site hôtelier',
    stack: 'HTML · CSS · JavaScript',
    status: 'En ligne',
    url: 'https://hotel-eden-24-novembre.onrender.com/',
    image: 'eden.webp',
    imageSize: [1600, 737],
    imageAlt: "Page d'accueil du site de l'Hôtel Eden 24 Novembre",
    lead: "Une présence en ligne élégante pour un hôtel de Kinshasa qui accueille aussi bien des voyageurs d'affaires que des clients de loisirs.",
    need: [
      "L'hôtel avait besoin d'un site qui inspire confiance à une clientèle exigeante, présente clairement ses chambres et ses services, et permette de demander une réservation en quelques secondes.",
    ],
    built: [
      "<strong>Accueil</strong> avec présentation de l'hôtel et photo de la façade",
      "<strong>Trois types de chambres</strong> avec leur tarif : Standard, Executive et Suite Royale",
      "<strong>Services</strong> : Wi-Fi fibre, restaurant, salle de sport et spa, navette, sécurité 24 h/24, service en chambre",
      "<strong>Galerie</strong> « L'Hôtel en images »",
      "<strong>Formulaire de réservation</strong> : date d'arrivée, date de départ, type de chambre",
      "<strong>Contact</strong> avec adresse, téléphone, email et WhatsApp",
    ],
    choices: [
      "Un formulaire de réservation réduit à l'essentiel : deux dates et un type de chambre.",
      "Un site statique en HTML, CSS et JavaScript : rapide à charger, même sur une connexion mobile, et simple à héberger.",
    ],
  },
  {
    slug: 'house-service',
    name: 'House Service',
    sector: 'Services',
    city: 'Kisangani · Kinshasa',
    type: 'Site institutionnel',
    stack: 'Site web · Paiement Mobile Money',
    status: 'En ligne',
    url: 'https://house-service-1omn.onrender.com/index.html',
    image: 'house.webp',
    imageSize: [1600, 762],
    imageAlt: 'Page de présentation du service House Service',
    lead: "Une entreprise de sous-traitance qui place du personnel de maison, d'entreprise et spécialisé. Le site devait rassurer les familles et les entreprises, puis transformer l'intérêt en demande de devis.",
    need: [
      "Confier sa maison ou ses locaux à une personne extérieure demande de la confiance. House Service avait besoin d'un site qui présente un catalogue de services large, prouve le sérieux de l'entreprise et simplifie la demande de devis et le paiement.",
    ],
    built: [
      "<strong>Catalogue de services</strong> : maison, entreprise, personnel spécialisé, sur mesure, offre premium et vidange",
      "<strong>Demande de devis gratuit</strong> en ligne et appel direct",
      "<strong>Paiement</strong> par Mobile Money (Airtel, M-Pesa, Orange) ou virement, avec envoi de la preuve par WhatsApp",
      "<strong>Vérification d'un agent</strong> par son nom, pour confirmer qu'il travaille bien pour l'entreprise",
      "<strong>Recrutement et formations</strong> pour les futurs agents",
      "<strong>Fiches d'évaluation</strong>, questions fréquentes, témoignages et blog",
      "<strong>Assistant conversationnel</strong> pour répondre aux premières questions",
    ],
    choices: [
      "Le paiement passe par Mobile Money, le moyen que les clients utilisent déjà au quotidien.",
      "La vérification d'agent répond directement à la première inquiétude des familles : « qui entre chez moi ? »",
    ],
  },
  {
    slug: 'masco',
    name: 'Masco Énergie et Construction',
    sector: 'Énergie et construction',
    city: 'Kisangani',
    type: 'Site institutionnel',
    stack: 'Next.js · Docker · Prisma',
    status: 'En ligne',
    url: 'https://energiesmasco.vercel.app',
    image: 'masco-site.webp',
    imageSize: [1600, 771],
    imageAlt: 'Page de présentation de Masco Energies et Construction',
    lead: "Une société d'infrastructures qui intervient sur des chantiers d'envergure. Le site structure ses domaines d'activité et met en avant ses projets auprès des institutions et des investisseurs.",
    need: [
      "Masco s'adresse à des interlocuteurs institutionnels : ministères, banques, partenaires internationaux. Il fallait une présentation sérieuse et structurée de ses métiers, de ses projets et de ses partenaires.",
    ],
    built: [
      "<strong>Domaines d'activité</strong> : génie civil et infrastructures, bureau d'études, accompagnement institutionnel, financement",
      "<strong>Projet phare</strong> : la réhabilitation de la voie ferrée Kisangani – Ubundu (115 km)",
      "<strong>Projets filtrables</strong> par type : ferroviaire, portuaire, bâtiments",
      "<strong>Équipe dirigeante et partenaires</strong>",
      "<strong>Questions fréquentes</strong> avec recherche",
      "<strong>Assistant IA</strong> qui oriente vers le contact quand il n'a pas la réponse",
    ],
    choices: [
      "Les projets sont classés par type pour qu'un partenaire trouve vite les références qui le concernent.",
      "Une base technique Next.js, Docker et Prisma, prévue pour faire évoluer le contenu sans tout reconstruire.",
    ],
  },
  {
    slug: 'hope-info-7',
    name: 'Hope Info 7',
    sector: 'Médias',
    city: 'Kisangani',
    type: 'Site média',
    stack: 'Identité visuelle · Design web',
    status: 'Démo sur demande',
    url: null,
    image: 'promo/jour.webp',
    imageSize: [1580, 762],
    imageAlt: 'Présentation du projet Hope Info 7 Médias',
    lead: "Une identité digitale pour un média basé à Kisangani, engagé dans l'information et la mise en valeur des réalités locales.",
    need: [
      "Un média local a besoin d'être reconnu au premier coup d'œil et de publier facilement. Le projet consistait à lui donner une identité visuelle et un site à la hauteur de sa ligne éditoriale.",
    ],
    built: [
      "<strong>Identité visuelle</strong> du média",
      "<strong>Site média</strong> pour publier et mettre en avant l'information locale",
      "<strong>Présence digitale</strong> cohérente entre le site et les autres supports",
    ],
    choices: [
      "Une mise en page qui laisse la place à l'actualité et à la mise en valeur des réalités locales.",
    ],
    note: "Ce site n'est pas consultable publiquement. Une démonstration est disponible sur demande.",
  },
  {
    slug: 'college-maele',
    name: 'Collège Maele',
    sector: 'Éducation',
    city: 'RDC',
    type: 'Site institutionnel',
    stack: 'Design web',
    status: 'Démo sur demande',
    url: null,
    image: 'promo/colap_small.webp',
    imageSize: [1582, 761],
    imageAlt: "Page d'accueil du Collège Maele",
    lead: "Une vitrine claire pour présenter un établissement scolaire, son environnement et sa vision éducative.",
    need: [
      "Les parents comparent les écoles avant de se déplacer. Le collège avait besoin d'un site qui présente simplement son cadre, son projet éducatif et la façon de le contacter.",
    ],
    built: [
      "<strong>Présentation de l'établissement</strong> et de sa vision éducative",
      "<strong>Mise en valeur de l'environnement</strong> scolaire",
      "<strong>Accès direct au contact</strong> pour les familles",
    ],
    choices: [
      "Un ton et une structure pensés pour les parents : l'essentiel d'abord, le détail ensuite.",
    ],
    note: "Ce site n'est pas consultable publiquement. Une démonstration est disponible sur demande.",
  },
  {
    slug: 'lina-mg',
    name: 'Lina Mg',
    sector: 'Culture',
    city: 'Kisangani',
    type: "Site d'artiste",
    stack: 'Design web · Maquette mobile',
    status: 'En ligne',
    url: '../lina-mg/lina.html',
    secondaryUrl: { href: '../maquette-clicable/maquette.html', label: 'Voir la maquette mobile' },
    image: 'lina-mg.webp',
    imageSize: [793, 638],
    imageAlt: "Page d'accueil du site de l'artiste Lina Mg",
    lead: "Une scène en ligne pour Lina Mg, artiste slameuse et oratrice : son univers, ses spectacles, ses prestations et un moyen simple de la réserver.",
    need: [
      "Une artiste vit de sa visibilité et des invitations qu'elle reçoit. Lina Mg avait besoin d'un lieu unique pour raconter son parcours, montrer son travail et permettre aux organisateurs de la contacter.",
    ],
    built: [
      "<strong>Biographie et univers</strong> : poésie, slam et art oratoire",
      "<strong>Prestations</strong> et masterclass d'art oratoire",
      "<strong>Page spectacles</strong> pour les prochaines scènes et rencontres",
      "<strong>Galerie, œuvres et témoignages</strong>",
      "<strong>Soutien et réservation</strong> de l'artiste",
      "<strong>Maquette mobile cliquable</strong> d'une application : profil de l'artiste, écoute audio et réservation",
    ],
    choices: [
      "Le site met la voix de l'artiste au premier plan, avec ses propres mots dès l'ouverture.",
      "La maquette mobile permet de tester le parcours de réservation avant de développer une application.",
    ],
  },
];

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// Les listes contiennent un peu de HTML volontaire (<strong>) : elles sont insérées telles quelles.
const list = (items) => `<ul class="case-list">${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
const paragraphs = (items) => items.map((item) => `<p>${item}</p>`).join('');

function renderProject(project, index) {
  const next = projects[(index + 1) % projects.length];
  const number = String(index + 1).padStart(2, '0');
  const total = String(projects.length).padStart(2, '0');
  const pageUrl = `${SITE_URL}/projets/${project.slug}.html`;
  const title = `${project.name} — Étude de cas · David Mbula Wawina`;
  const external = project.url && project.url.startsWith('http');
  const visit = project.url
    ? `<a class="button" href="${project.url}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>Visiter le site <span aria-hidden="true">↗</span>${external ? '<span class="visually-hidden"> (nouvel onglet)</span>' : ''}</a>`
    : `<a class="button" href="${WHATSAPP}?text=${encodeURIComponent(`Bonjour David, j'aimerais voir la démo du projet ${project.name}.`)}" target="_blank" rel="noopener noreferrer">Demander la démo <span aria-hidden="true">↗</span></a>`;
  const secondary = project.secondaryUrl
    ? `<a class="button button-ghost" href="${project.secondaryUrl.href}">${project.secondaryUrl.label} <span aria-hidden="true">↗</span></a>`
    : '';
  const [width, height] = project.imageSize;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(project.lead)}">
  <meta name="theme-color" content="#050505">
  <link rel="canonical" href="${pageUrl}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(project.lead)}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:image" content="${SITE_URL}/images/${project.image}">
  <meta property="og:locale" content="fr_FR">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/png" sizes="48x48" href="../images/favicon-48.png">
  <link rel="apple-touch-icon" href="../images/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Space+Grotesk:wght@500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/pages.css">
</head>
<body>
  <a class="skip-link" href="#contenu">Aller au contenu</a>
  <header class="page-header dark">
    <a class="brand" href="../index.html">DAVID <span>MBULA</span></a>
    <a class="back-link" href="../index.html#work"><span aria-hidden="true">←</span>&nbsp;Tous les projets</a>
  </header>

  <main id="contenu">
    <section class="case-hero dark">
      <p class="case-kicker"><strong>Étude de cas ${number} / ${total}</strong><span>${escapeHtml(project.sector)}</span></p>
      <h1>${escapeHtml(project.name)}</h1>
      <p class="case-lead">${escapeHtml(project.lead)}</p>
      <dl class="case-meta">
        <div><dt>Secteur</dt><dd>${escapeHtml(project.sector)}</dd></div>
        <div><dt>Lieu</dt><dd>${escapeHtml(project.city)}</dd></div>
        <div><dt>Réalisation</dt><dd>${escapeHtml(project.type)}</dd></div>
        <div><dt>Statut</dt><dd>${escapeHtml(project.status)}</dd></div>
      </dl>
      <figure class="case-figure">
        <img src="../images/${project.image}" width="${width}" height="${height}" alt="${escapeHtml(project.imageAlt)}">
      </figure>
    </section>

    <div class="case-body">
      <section class="case-section">
        <h2><span>01</span>Le besoin</h2>
        <div>${paragraphs(project.need)}</div>
      </section>
      <section class="case-section">
        <h2><span>02</span>Ce que j'ai construit</h2>
        <div>${list(project.built)}</div>
      </section>
      <section class="case-section">
        <h2><span>03</span>Les choix de conception</h2>
        <div>${list(project.choices)}</div>
      </section>
      <section class="case-section">
        <h2><span>04</span>${project.url ? 'Le site en ligne' : 'Voir le projet'}</h2>
        <div>
          <p>Technologies et outils : <strong>${escapeHtml(project.stack)}</strong>.</p>
          ${project.note ? `<p class="case-note">${escapeHtml(project.note)}</p>` : ''}
          <div class="button-row">${visit}${secondary}</div>
        </div>
      </section>
    </div>

    <a class="case-next" href="${next.slug}.html">
      <span>Projet suivant</span>
      <strong>${escapeHtml(next.name)} <span aria-hidden="true">→</span></strong>
    </a>

    <section class="case-cta">
      <h2>Un projet du même genre ?<br><em>Parlons-en.</em></h2>
      <p>Vous n'avez pas besoin de savoir comment le construire. Dites-moi simplement ce que vous voulez améliorer.</p>
      <div class="button-row">
        <a class="button" href="../index.html#contact">Me contacter <span aria-hidden="true">↗</span></a>
        <a class="button button-ghost" href="${WHATSAPP}" target="_blank" rel="noopener noreferrer">WhatsApp <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  </main>

  <footer class="page-footer">
    <span>© ${new Date().getFullYear()} David Mbula · Développeur web et consultant digital</span>
    <nav aria-label="Liens du pied de page"><a href="../index.html">Accueil</a><a href="../index.html#work">Projets</a><a href="../blog/">Blog</a><a href="../index.html#contact">Contact</a></nav>
  </footer>
</body>
</html>
`;
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
projects.forEach((project, index) => {
  fs.writeFileSync(path.join(OUTPUT_DIR, `${project.slug}.html`), renderProject(project, index));
});
console.log(`${projects.length} études de cas générées dans projets/`);
