// Générateur de pages de blog à partir des fichiers Markdown du dossier blog/posts/.
const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '..', 'blog');
const postsDir = path.join(blogDir, 'posts');
const outputDir = blogDir;
const siteRoot = '/';

// Lit tous les fichiers Markdown du dossier blog/posts/ et extrait leurs métadonnées et contenu.
function readMarkdownFiles() {
  return fs.readdirSync(postsDir)
    .filter((file) => file.endsWith('.md'))
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

      return {
        title: meta.title || 'Sans titre',
        date: meta.date || '',
        description: meta.description || '',
        readingTime: getReadingTime(content, meta.readingTime),
        slug: meta.slug || path.basename(file, '.md'),
        fullUrl: `https://davidwawina.site/blog/${meta.slug || path.basename(file, '.md')}.html`,
        content,
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
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
    .replace(/!\[([^\]]*)\]\(([^\)\s]+)(?:\s+"([^"]*)")?\)/g, '<img src="$2" alt="$1" class="my-8 rounded-3xl border border-google-border max-w-full h-auto" />')
    .replace(/```\r?\n([\s\S]*?)```/g, (_, code) => `<pre class="rounded-xl bg-slate-950 text-slate-100 p-4 overflow-x-auto"><code>${escapeHtml(code)}</code></pre>`)
    .replace(/^######\s+(.*)$/gm, '<h6>$1</h6>')
    .replace(/^#####\s+(.*)$/gm, '<h5>$1</h5>')
    .replace(/^####\s+(.*)$/gm, '<h4>$1</h4>')
    .replace(/^###\s+(.*)$/gm, '<h3>$1</h3>')
    .replace(/^##\s+(.*)$/gm, '<h2>$1</h2>')
    .replace(/^#\s+(.*)$/gm, '<h1>$1</h1>')
    .replace(/^\-\s+(.*)$/gm, '<li>$1</li>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" class="text-google-blue hover:text-google-blueDark">$1</a>');

  html = html.replace(/(?:^<li>.*<\/li>\r?\n?)+/gm, (match) => `<ul>${match.trim()}</ul>\n`);

  return html
    .split(/\r?\n\r?\n+/)
    .map((block) => {
      if (block.startsWith('<h1') || block.startsWith('<h2') || block.startsWith('<h3') || block.startsWith('<h4') || block.startsWith('<h5') || block.startsWith('<h6') || block.startsWith('<pre')) {
        return block;
      }
      if (block.startsWith('<img')) {
        return block;
      }
      if (block.startsWith('<ul>')) {
        return block;
      }
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');

  return html;
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[char];
  });
}

function buildPostPage(post) {
  const html = `<!DOCTYPE html>
<html lang="fr" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${post.title} — Blog de David Wawina</title>
  <meta name="description" content="${post.description}" />
  <link rel="canonical" href="https://davidwawina.site/blog/${post.slug}.html" />
  <link rel="icon" href="../images/logof.jpg" type="image/svg+xml">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="stylesheet" href="../css/h-styles.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Roboto', 'sans-serif'],
            display: ['Outfit', 'sans-serif'],
          },
          colors: {
            google: {
              blue: '#1a73e8',
              blueDark: '#174ea6',
              green: '#3ddc84',
              gray: '#f8f9fa',
              text: '#202124',
              textSec: '#5f6368',
              border: '#dadce0',
            }
          },
          boxShadow: {
            'google': '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
          }
        }
      }
    }
  </script>
</head>
<body class="bg-white dark:bg-slate-950 text-google-text dark:text-white">
  <!-- Page générée automatiquement par scripts/generate-blog.js -->
  <header class="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-google-border dark:border-slate-800 h-16 flex items-center">
    <div class="container mx-auto px-4 max-w-7xl flex justify-between items-center">
      <a href="../" class="flex items-center gap-2">
        <img src="../images/logof.jpg" alt="Logo David Wawina" class="h-8 w-8 rounded-full" loading="lazy" />
        <span class="font-display font-medium text-xl tracking-tight">David<span class="text-google-textSec dark:text-slate-400 font-normal">Wawina</span></span>
      </a>
      <nav class="hidden md:flex items-center gap-1" role="navigation" aria-label="Navigation principale">
        <a href="../#about" class="nav-link">À propos</a>
        <a href="../#skills" class="nav-link">Compétences</a>
        <a href="../#projets" class="nav-link">Projets</a>
        <a href="./" class="nav-link font-semibold text-google-blue">Blog</a>
        <a href="../#contact" class="nav-link">Contact</a>
      </nav>
      <a href="../#contact" class="btn btn-primary h-9 px-4 text-sm hidden sm:inline-flex">Me contacter</a>
    </div>
  </header>
  <main class="container mx-auto px-4 max-w-4xl py-16">
    <article class="prose prose-lg dark:prose-invert">
      <p class="text-sm uppercase tracking-[0.3em] text-google-blue font-semibold mb-4">Blog statique</p>
      <h1 class="text-4xl font-bold mb-6">${post.title}</h1>
      <p class="text-google-textSec mb-1">${post.date} • ${post.readingTime}</p>
      <p class="text-sm text-google-textSec mb-8"><a href="${post.fullUrl}" class="text-google-blue hover:text-google-blueDark">${post.fullUrl}</a></p>
      ${renderMarkdown(post.content)}
      <div class="mt-12 pt-8 border-t border-google-border">
        <a href="./" class="text-google-blue font-semibold">← Retour au blog</a>
      </div>
    </article>
  </main>
</body>
</html>`;

  const filePath = path.join(outputDir, `${post.slug}.html`);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`Généré : ${filePath}`);
}

function buildIndexPage(posts) {
  const recentItems = posts.slice(0, 3).map((post) => `      <article class="rounded-3xl border border-google-border bg-white p-6 shadow-google transition hover:-translate-y-1">
        <p class="text-sm text-google-textSec uppercase tracking-[0.25em] mb-2">${post.date} • ${post.readingTime}</p>
        <h2 class="text-2xl font-semibold mb-3">${post.title}</h2>
        <p class="text-google-textSec mb-4">${post.description}</p>
        <a href="./${post.slug}.html" class="text-google-blue font-semibold hover:text-google-blueDark">Lire l’article →</a>
      </article>`).join('\n');

  const listItems = posts.map((post) => `      <article class="rounded-3xl border border-google-border bg-white p-8 shadow-google transition hover:-translate-y-1">
        <p class="text-sm text-google-textSec uppercase tracking-[0.25em] mb-3">${post.date}</p>
        <h2 class="text-2xl font-semibold mb-3">${post.title}</h2>
        <p class="text-google-textSec mb-6">${post.description}</p>
        <a href="./${post.slug}.html" class="text-google-blue font-semibold hover:text-google-blueDark">Lire l’article →</a>
      </article>`).join('\n');

  return `<!DOCTYPE html>
<html lang="fr" class="scroll-smooth">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Blog — David Wawina MBULA</title>
  <meta name="description" content="Blog de David Wawina : articles sur le développement web, les sites statiques et les bonnes pratiques sans back-end." />
  <link rel="canonical" href="https://davidwawina.site/blog/" />
  <link rel="icon" href="../images/logof.jpg" type="image/svg+xml">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="stylesheet" href="../css/h-styles.css">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Roboto', 'sans-serif'],
            display: ['Outfit', 'sans-serif'],
          },
          colors: {
            google: {
              blue: '#1a73e8',
              blueDark: '#174ea6',
              green: '#3ddc84',
              gray: '#f8f9fa',
              text: '#202124',
              textSec: '#5f6368',
              border: '#dadce0',
            }
          },
          boxShadow: {
            'google': '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
          }
        }
      }
    }
  </script>
</head>
<body class="bg-white dark:bg-slate-950 text-google-text dark:text-white">
  <header class="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-google-border dark:border-slate-800 h-16 flex items-center">
    <div class="container mx-auto px-4 max-w-7xl flex justify-between items-center">
      <a href="../" class="flex items-center gap-2">
        <img src="../images/logof.jpg" alt="Logo David Wawina" class="h-8 w-8 rounded-full" loading="lazy" />
        <span class="font-display font-medium text-xl tracking-tight">David<span class="text-google-textSec dark:text-slate-400 font-normal">Wawina</span></span>
      </a>
      <nav class="hidden md:flex items-center gap-1" role="navigation" aria-label="Navigation principale">
        <a href="../#about" class="nav-link">À propos</a>
        <a href="../#skills" class="nav-link">Compétences</a>
        <a href="../#projets" class="nav-link">Projets</a>
        <a href="./" class="nav-link font-semibold text-google-blue">Blog</a>
        <a href="../#contact" class="nav-link">Contact</a>
      </nav>
      <a href="../#contact" class="btn btn-primary h-9 px-4 text-sm hidden sm:inline-flex">Me contacter</a>
    </div>
  </header>

  <main class="container mx-auto px-4 max-w-6xl py-16">
    <section class="mb-16 text-center">
      <p class="text-sm uppercase tracking-[0.3em] text-google-blue font-semibold mb-4">Blog statique</p>
      <h1 class="text-4xl sm:text-5xl font-bold mb-4">Articles sur le développement web sans back-end</h1>
      <p class="max-w-2xl mx-auto text-google-textSec">Des guides pratiques, des conseils de structure et des bonnes pratiques pour garder votre blog léger, rapide et facile à maintenir.</p>
    </section>

    <section class="mb-16">
      <div class="flex items-center justify-between mb-8">
        <div>
          <p class="text-sm uppercase tracking-[0.3em] text-google-blue font-semibold">Articles récents</p>
          <h2 class="text-3xl font-bold">Les derniers articles</h2>
        </div>
      </div>
      <div class="grid gap-6 lg:grid-cols-3">
${recentItems}
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-2">
${listItems}
    </section>

    <section class="mt-16 rounded-3xl border border-google-border bg-slate-50 dark:bg-slate-900 p-8">
      <h3 class="text-xl font-semibold mb-3">Comment ça marche ?</h3>
      <p class="text-google-textSec">Les articles sont écrits en Markdown dans <code class="rounded bg-slate-100 px-2 py-1">blog/posts/</code>. Lancez <code class="rounded bg-slate-100 px-2 py-1">node scripts/generate-blog.js</code> pour créer les pages HTML automatiquement.</p>
    </section>
  </main>
</body>
</html>`;
}

function main() {
  if (!fs.existsSync(postsDir)) {
    console.error(`Le dossier ${postsDir} est introuvable.`);
    process.exit(1);
  }

  const posts = readMarkdownFiles();
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  posts.forEach(buildPostPage);
  fs.writeFileSync(path.join(outputDir, 'index.html'), buildIndexPage(posts), 'utf8');
  console.log('Blog généré avec succès.');
}

main();
