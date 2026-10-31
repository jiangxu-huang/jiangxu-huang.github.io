import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const profile = JSON.parse(await readFile(path.join(root, 'homepage/profile.json'), 'utf8'));
const publications = JSON.parse(await readFile(path.join(root, 'homepage/publications.json'), 'utf8'));
const news = JSON.parse(await readFile(path.join(root, 'homepage/news.json'), 'utf8'));
const template = await readFile(path.join(root, 'homepage/template.html'), 'utf8');
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const bilingual = value => `<span class="i18n-en" lang="en">${escape(value.en)}</span><span class="i18n-zh" lang="zh-CN">${escape(value.zh)}</span>`;
const research = profile.research.map(item => `<article class="research-item"><h3>${bilingual(item.title)}</h3><p>${bilingual(item.description)}</p></article>`).join('\n');

const seen = new Set();
for (const publication of publications) {
  if (!publication.title || !publication.authors?.length || !publication.year || !publication.venue || !publication.url || !['journal', 'preprint'].includes(publication.type)) throw new Error(`Incomplete publication: ${publication.title}`);
  const url = new URL(publication.url);
  if (url.protocol !== 'https:') throw new Error('Publication links must use HTTPS');
  const key = publication.doi || publication.title.toLowerCase();
  if (seen.has(key)) throw new Error(`Duplicate publication: ${key}`);
  seen.add(key);
}
publications.sort((a, b) => b.year - a.year || (a.type === b.type ? 0 : a.type === 'journal' ? -1 : 1));
const publicationHTML = publications.map((item, index) => {
  const authors = item.authors.map(name => name === profile.name ? `<strong>${escape(name)}</strong>` : escape(name)).join(', ');
  const badge = item.type === 'journal' ? bilingual({ en: 'Journal article', zh: '期刊论文' }) : bilingual({ en: 'Preprint', zh: '预印本' });
  const search = [item.title, item.authors.join(' '), item.year, item.venue, item.doi || ''].join(' ').toLocaleLowerCase();
  const doiLink = item.doi ? `<p class="publication-doi">DOI: <a href="https://doi.org/${escape(item.doi)}" target="_blank" rel="noopener noreferrer">${escape(item.doi)}</a></p>` : '';
  return `<article class="publication-item" data-type="${item.type}" data-search="${escape(search)}"><span class="publication-number">[${index + 1}]</span><div class="publication-content"><h3><a href="${escape(item.url)}" target="_blank" rel="noopener noreferrer">${escape(item.title)}</a></h3><p class="publication-authors">${authors}</p><div class="publication-meta"><span class="publication-venue">${escape(item.venue)}, ${item.year}.</span><span class="publication-badge ${item.type}">${badge}</span></div>${doiLink}</div></article>`;
}).join('\n');

const newsHTML = news.map(item => {
  const publication = publications.find(record => record.doi === item.publicationDoi);
  if (!publication) throw new Error(`News references an unknown publication: ${item.publicationDoi}`);
  if (!/^\d{4}-\d{2}$/.test(item.date) || !item.prefix?.en || !item.prefix?.zh || !item.label?.en || !item.label?.zh) throw new Error('Incomplete news entry');
  return `<article class="news-item"><time class="news-date" datetime="${escape(item.date)}">${bilingual(item.label)}</time><div class="news-content"><p>${bilingual(item.prefix)}<a href="${escape(publication.url)}" target="_blank" rel="noopener noreferrer">${escape(publication.title)}</a>.</p></div></article>`;
}).join('\n');

const tokens = {
  SITE_URL: escape(profile.siteUrl), EMAIL: escape(profile.email), ROLE: bilingual(profile.role), AFFILIATION: bilingual(profile.affiliation),
  BIOGRAPHY: profile.biography.map(paragraph => `<p>${bilingual(paragraph)}</p>`).join('\n'),
  SCHOLAR: escape(profile.scholar), RESEARCHGATE: escape(profile.researchgate), GITHUB: escape(profile.github),
  RESEARCH: research, PUBLICATIONS: publicationHTML, NEWS: newsHTML,
  PERSON_JSON: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Person', name: profile.name, url: `${profile.siteUrl}/`, email: `mailto:${profile.email}`, affiliation: { '@type': 'CollegeOrUniversity', name: profile.affiliation.en }, sameAs: [profile.scholar, profile.researchgate, profile.github] }).replaceAll('<', '\\u003c')
};
const html = template.replace(/\{\{T:([^|]+)\|([^|]*)\|([^}]+)\}\}/g, (_, key, en, zh) => bilingual({ en, zh })).replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
  if (!(key in tokens)) throw new Error(`Unknown template token: ${key}`);
  return tokens[key];
});
if (/\{\{/.test(html)) throw new Error('Unresolved template token');
if (/<(?:img|svg|canvas|picture)\b/i.test(html)) throw new Error('The academic homepage must remain text-only');
if (process.argv.includes('--check')) {
  if (await readFile(path.join(root, 'index.html'), 'utf8') !== html) throw new Error('index.html is stale: run node scripts/build-homepage.mjs');
  console.log(`Homepage is current; ${publications.length} unique publications and ${news.length} news entries validated.`);
} else {
  await writeFile(path.join(root, 'index.html'), html, 'utf8');
  await writeFile(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${profile.siteUrl}/</loc></url></urlset>\n`, 'utf8');
  await writeFile(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${profile.siteUrl}/sitemap.xml\n`, 'utf8');
  for (const [route, anchor] of [['about', 'home'], ['publications', 'publications']]) {
    await mkdir(path.join(root, route), { recursive: true });
    const sitePath = new URL(profile.siteUrl).pathname.replace(/\/$/, '');
    await writeFile(path.join(root, route, 'index.html'), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Jiangxu Huang</title><link rel="canonical" href="${profile.siteUrl}/"><meta http-equiv="refresh" content="0;url=${sitePath}/#${anchor}"><p><a href="${sitePath}/#${anchor}">Continue to Jiangxu Huang’s homepage / 进入个人主页</a></p></html>\n`, 'utf8');
  }
  console.log(`Built text-only homepage with ${publications.length} publications and ${news.length} news entries.`);
}
