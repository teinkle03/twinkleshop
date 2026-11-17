// sitemap.xml ও robots.txt নিজে বানায়। চালাতে: node generate-seo.mjs
// পণ্যের তালিকা Firestore থেকে পড়ে (পণ্য সবার জন্য পড়ার-যোগ্য থাকতে হবে)।
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const cfg = html.match(/const firebaseConfig\s*=\s*\{[\s\S]*?apiKey:\s*"([^"]+)"[\s\S]*?projectId:\s*"([^"]+)"/);
if (!cfg) throw new Error('index.html-এ firebaseConfig (apiKey, projectId) পাওয়া যায়নি');
const [, apiKey, projectId] = cfg;

// সাইটের ঠিকানা: SITE_URL দেওয়া থাকলে সেটা, নইলে GitHub রিপো থেকে github.io ঠিকানা
function siteUrl() {
  let u = process.env.SITE_URL;
  if (!u && process.env.GITHUB_REPOSITORY) {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    u = repo.toLowerCase() === `${owner.toLowerCase()}.github.io` ? `https://${owner}.github.io/` : `https://${owner}.github.io/${repo}/`;
  }
  if (!u) throw new Error('SITE_URL দিন, যেমন: SITE_URL=https://example.com/ node generate-seo.mjs');
  return u.endsWith('/') ? u : u + '/';
}
const SITE = siteUrl();

async function fetchProducts() {
  const out = [];
  let token = '';
  do {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/products?pageSize=300&key=${apiKey}` + (token ? `&pageToken=${encodeURIComponent(token)}` : '');
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Firestore ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = await res.json();
    (data.documents || []).forEach(d => out.push({ id: d.name.split('/').pop(), updated: (d.updateTime || '').slice(0, 10) }));
    token = data.nextPageToken || '';
  } while (token);
  return out;
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const products = await fetchProducts();
const today = new Date().toISOString().slice(0, 10);
const urls = [{ loc: SITE, lastmod: today, pr: '1.0' }].concat(
  products.map(p => ({ loc: `${SITE}?product=${encodeURIComponent(p.id)}`, lastmod: p.updated || today, pr: '0.8' })));

writeFileSync('sitemap.xml',
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(u => `  <url><loc>${esc(u.loc)}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.pr}</priority></url>`).join('\n') +
  '\n</urlset>\n');
writeFileSync('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);
console.log(`sitemap.xml: ${urls.length}টি লিংক | সাইট: ${SITE}`);
