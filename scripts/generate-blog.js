// Générateur de pages de blog à partir des fichiers Markdown du dossier blog/posts/.
// Usage : node scripts/generate-blog.js
const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '..', 'blog');
const postsDir = path.join(blogDir, 'posts');
const outputDir = blogDir;
const rootDir = path.join(__dirname, '..');
const siteUrl = 'https://davidwawina.site';
const defaultImage = { url: `${siteUrl}/images/og-image.jpg`, width: 1200, height: 630, alt: '' };

// Lit la largeur et la hauteur d'une image JPEG, PNG ou WebP sans dépendance externe.
function readImageSize(file) {
  try {
    const buf = fs.readFileSync(file);
    if (buf.toString('ascii', 1, 4) === 'PNG') {
      return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
    }
    if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
      const chunk = buf.toString('ascii', 12, 16);
      if (chunk === 'VP8X') return [1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3)];
      if (chunk === 'VP8 ') return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
      if (chunk === 'VP8L') {
        const bits = buf.readUInt32LE(21);
        return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
      }
    }
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i < buf.length) {
        const marker = buf[i + 1];
        const length = buf.readUInt16BE(i + 2);
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
        }
        i += 2 + length;
      }
    }
  } catch (error) {
    console.warn(`Image introuvable ou illisible : ${file}`);
  }
  return null;
}

// Photo de l'article : la couverture déclarée dans les métadonnées (champ image),
// sinon la première image du texte. C'est elle qui sert d'aperçu quand on partage le lien.
function findArticleImage(meta, content, title) {
  let src = meta.image;
  let alt = meta.imageAlt || title;
  if (!src) {
    const inline = content.match(/!\[([^\]]*)\]\(([^\)\s]+)/);
    if (!inline) return null;
    [, alt, src] = inline;
    alt = alt || title;
  }
  if (/^https?:\/\//.test(src)) {
    return { url: src, pageSrc: src, alt, width: null, height: null };
  }
  // Les chemins sont relatifs à la racine du site (images/…) ou à la page du blog (../images/…).
  const sitePath = path.posix.normalize(src.startsWith('../') ? src.slice(3) : src.replace(/^\//, ''));
  const size = readImageSize(path.join(rootDir, sitePath)) || [null, null];
  return { url: `${siteUrl}/${sitePath}`, pageSrc: `../${sitePath}`, alt, width: size[0], height: size[1] };
}

// Lit tous les fichiers Markdown du dossier blog/posts/ et extrait leurs métadonnées et contenu.
// Les fichiers sont nommés AAAA-MM-JJ-slug.md : ce préfixe sert au tri (le plus récent d'abord).
function readMarkdownFiles() {
  return fs.readdirSync(postsDir)
    .filter((file) => file.endsWith('.md'))
    .sort()
    .reverse()
    .map((file) => {
      const text = fs.readFileSync(path.join(postsDir, file), 'utf8');
      const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);

      if (!match) {
        throw new Error(`Fichier Markdown mal formé : ${file}`);
      }

      const rawMeta = match[1];
      const content = match[2].trim();
      const meta = Object.fromEntries(
        rawMeta.split(/\r?\n/).map((line) => {
          const [key, ...rest] = line.split(':');
          return [key.trim(), rest.join(':').trim().replace(/^"|"$/g, '')];
        })
      );
      const slug = meta.slug || path.basename(file, '.md');
      const isoDate = (file.match(/^(\d{4}-\d{2}-\d{2})/) || [])[1] || '';

      return {
        title: meta.title || 'Sans titre',
        date: meta.date || '',
        isoDate,
        description: meta.description || '',
        readingTime: getReadingTime(content, meta.readingTime),
        slug,
        hasCover: Boolean(meta.image),
        image: findArticleImage(meta, content, meta.title || 'Sans titre'),
        fullUrl: `${siteUrl}/blog/${slug}.html`,
        content,
      };
    });
}

// Calcule un temps de lecture estimé si aucune valeur n'est fournie dans les métadonnées.
function getReadingTime(text, override) {
  if (override && override.trim().length > 0) {
    return override;
  }
  const words = text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/<[^>]+>/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const minutes = Math.max(1, Math.round(words / 180));
  return `${minutes} min de lecture`;
}

// Transforme un Markdown simple en HTML pour l'insertion dans les pages du blog.
function renderMarkdown(text) {
  let html = text
    .replace(/!\[([^\]]*)\]\(([^\)\s]+)(?:\s+"([^"]*)")?\)/g, '<img src="$2" alt="$1" loading="lazy" />')
    .replace(/```\r?\n([\s\S]*?)```/g, (_, code) => `<pre><code>${escapeHtml(code)}</code></pre>`)
    .replace(/^######\s+(.*)$/gm, '<h6>$1</h6>')
    .replace(/^#####\s+(.*)$/gm, '<h5>$1</h5>')
    .replace(/^####\s+(.*)$/gm, '<h4>$1</h4>')
    .replace(/^###\s+(.*)$/gm, '<h3>$1</h3>')
    .replace(/^##\s+(.*)$/gm, '<h2>$1</h2>')
    .replace(/^#\s+(.*)$/gm, '<h2>$1</h2>')
    .replace(/^\-\s+(.*)$/gm, '<li>$1</li>')
    .replace(/^\d+\.\s+(.*)$/gm, '<li data-ordered>$1</li>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');

  // Les listes à puces sont regroupées avant les listes numérotées pour ne pas les mélanger.
  html = html
    .replace(/(?:^<li>.*<\/li>\r?\n?)+/gm, (match) => `<ul>${match.trim()}</ul>\n`)
    .replace(/(?:^<li data-ordered>.*<\/li>\r?\n?)+/gm, (match) => `<ol>${match.replace(/ data-ordered/g, '').trim()}</ol>\n`);

  return html
    .split(/\r?\n\r?\n+/)
    .map((block) => (/^<(h[1-6]|pre|img|ul|ol)/.test(block) ? block : `<p>${block.replace(/\n/g, '<br>')}</p>`))
    .join('\n');
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

// En-tête HTML commun aux pages du blog, aligné sur le design du portfolio.
function pageHead({ title, description, canonical, image }) {
  const preview = image || defaultImage;
  const size = preview.width && preview.height
    ? `\n  <meta property="og:image:width" content="${preview.width}">\n  <meta property="og:image:height" content="${preview.height}">`
    : '';
  const alt = escapeHtml(preview.alt || title);
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="theme-color" content="#f5f5f2">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="David Mbula Wawina">
  <meta property="og:image" content="${preview.url}">${size}
  <meta property="og:image:alt" content="${alt}">
  <meta property="og:locale" content="fr_FR">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${preview.url}">
  <meta name="twitter:image:alt" content="${alt}">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" type="image/png" sizes="48x48" href="../images/favicon-48.png">
  <link rel="apple-touch-icon" href="../images/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/blog.css">
</head>
<body>
  <!-- Page générée automatiquement par scripts/generate-blog.js — ne pas modifier à la main. -->
  <header class="blog-header">
    <a class="brand" href="../">DAVID <span>MBULA</span></a>
    <nav aria-label="Navigation du blog"><a href="./">Journal</a><a href="../#work">Projets</a><a class="blog-header-cta" href="../#contact">Parlons-en <span>↗</span></a></nav>
  </header>`;
}

const pageFooter = `
  <footer class="blog-footer">
    <a class="brand" href="../">DAVID <span>MBULA</span></a>
    <small>© ${new Date().getFullYear()} David Mbula. Tous droits réservés.</small>
  </footer>
</body>
</html>
`;

function buildPostPage(post) {
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.isoDate || undefined,
    url: post.fullUrl,
    image: post.image ? post.image.url : undefined,
    author: { '@type': 'Person', name: 'David Mbula Wawina', url: `${siteUrl}/` },
  });

  const html = `${pageHead({ title: `${post.title} — Journal de David Mbula`, description: post.description, canonical: post.fullUrl, image: post.image })}
  <main class="blog-main">
    <article class="post">
      <a class="post-back" href="./">← Tous les articles</a>
      <div class="post-meta"><time datetime="${post.isoDate}">${post.date}</time><span>${post.readingTime}</span></div>
      <h1>${post.title}</h1>
      <p class="post-lead">${post.description}</p>${post.hasCover ? `
      <figure class="post-cover"><img src="${post.image.pageSrc}" alt="${escapeHtml(post.image.alt)}"${post.image.width ? ` width="${post.image.width}" height="${post.image.height}"` : ''}></figure>` : ''}
      <div class="post-body">
${renderMarkdown(post.content)}
      </div>
      <aside class="post-cta">
        <p>Vous avez un projet en tête ?</p>
        <a href="../#contact">Construisons-le ensemble <span>↗</span></a>
      </aside>
    </article>
  </main>
  <script type="application/ld+json">${jsonLd}</script>${pageFooter}`;

  const filePath = path.join(outputDir, `${post.slug}.html`);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`Généré : ${filePath}`);
}

function buildIndexPage(posts) {
  const items = posts.map((post) => `      <article class="blog-card">
        <div class="blog-card-meta"><time datetime="${post.isoDate}">${post.date}</time><span>${post.readingTime}</span></div>
        <h2><a href="./${post.slug}.html">${post.title}</a></h2>
        <p>${post.description}</p>
        <span class="blog-card-link" aria-hidden="true">Lire l’article ↗</span>
      </article>`).join('\n');

  return `${pageHead({ title: 'Journal — David Mbula', description: 'Le journal de David Mbula Wawina : idées et retours d’expérience sur le développement web et le digital.', canonical: `${siteUrl}/blog/` })}
  <main class="blog-main">
    <section class="blog-intro">
      <p class="kicker">Journal</p>
      <h1>Quelques idées<br><em>pour mieux construire.</em></h1>
      <p>Des notes courtes sur le développement web, les outils et la manière de faire des projets digitaux utiles.</p>
    </section>
    <section class="blog-list" aria-label="Articles">
${items}
    </section>
  </main>${pageFooter}`;
}

function main() {
  if (!fs.existsSync(postsDir)) {
    console.error(`Le dossier ${postsDir} est introuvable.`);
    process.exit(1);
  }

  const posts = readMarkdownFiles();
  posts.forEach(buildPostPage);
  fs.writeFileSync(path.join(outputDir, 'index.html'), buildIndexPage(posts), 'utf8');
  console.log('Blog généré avec succès.');
}

main();
