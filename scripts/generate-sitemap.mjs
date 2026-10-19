import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SERVICE_DETAILS } from '../src/data/serviceDetails.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');

const BASE_URL = 'https://sreerajarajeswarimotors.com';
const TODAY = new Date().toISOString().split('T')[0];

function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// 1. Generate Master Sitemap Index (public/sitemap.xml)
function generateSitemapIndex() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap-pages.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap-services.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
</sitemapindex>
`;
}

// 2. Generate Pages Sitemap (public/sitemap-pages.xml)
function generatePagesSitemap() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${BASE_URL}/srm-logo.png</image:loc>
      <image:title>SREE RAJA RAJESWARI MOTORS - Tirupati Car Service &amp; Repairs</image:title>
      <image:caption>SREE RAJA RAJESWARI MOTORS Logo - Leading multi-brand car repair and service workshop in S.V. Autonagar, Tirupati</image:caption>
    </image:image>
    <image:image>
      <image:loc>${BASE_URL}/emergency-breakdown.webp</image:loc>
      <image:title>24/7 Car Breakdown &amp; Towing Service Tirupati</image:title>
      <image:caption>24/7 Emergency car breakdown assistance, mechanical repairs and towing in Tirupati</image:caption>
    </image:image>
  </url>
</urlset>
`;
}

// 3. Generate Services Sitemap (public/sitemap-services.xml)
function generateServicesSitemap() {
  const serviceEntries = Object.values(SERVICE_DETAILS).map((service) => {
    const loc = `${BASE_URL}/services/${service.slug}`;
    const title = escapeXml(service.title || service.name);
    const caption = escapeXml(service.metaDescription || service.tagline);
    const imageLoc = escapeXml(service.image);

    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${imageLoc}</image:loc>
      <image:title>${title}</image:title>
      <image:caption>${caption}</image:caption>
    </image:image>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${serviceEntries}
</urlset>
`;
}

// 4. Generate robots.txt
function generateRobotsTxt() {
  return `# SREE RAJA RAJESWARI MOTORS - robots.txt
# Controls search engine crawler indexing and discovery for https://sreerajarajeswarimotors.com

User-agent: *
Allow: /
Allow: /services/
Disallow: /admin
Disallow: /admin/
Disallow: /billing
Disallow: /billing/

# Crawl Delay
Crawl-delay: 1

# Master Sitemap Index
Sitemap: ${BASE_URL}/sitemap.xml

# Direct Sub-Sitemaps for Fast Indexing
Sitemap: ${BASE_URL}/sitemap-pages.xml
Sitemap: ${BASE_URL}/sitemap-services.xml

# Googlebot specific rules
User-agent: Googlebot
Allow: /
Allow: /services/
Disallow: /admin
Disallow: /admin/
Disallow: /billing
Disallow: /billing/

# Googlebot-Image specific rules
User-agent: Googlebot-Image
Allow: /
Allow: /*.png$
Allow: /*.jpg$
Allow: /*.jpeg$
Allow: /*.webp$
Allow: /*.svg$

# Bingbot specific rules
User-agent: Bingbot
Allow: /
Allow: /services/
Disallow: /admin
Disallow: /admin/
Disallow: /billing
Disallow: /billing/

Host: ${BASE_URL}
`;
}

// Main execution
function main() {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapXmlPath = path.join(publicDir, 'sitemap.xml');
  const sitemapPagesPath = path.join(publicDir, 'sitemap-pages.xml');
  const sitemapServicesPath = path.join(publicDir, 'sitemap-services.xml');
  const robotsTxtPath = path.join(publicDir, 'robots.txt');

  fs.writeFileSync(sitemapXmlPath, generateSitemapIndex(), 'utf8');
  console.log(`[SEO] Generated: ${sitemapXmlPath}`);

  fs.writeFileSync(sitemapPagesPath, generatePagesSitemap(), 'utf8');
  console.log(`[SEO] Generated: ${sitemapPagesPath}`);

  fs.writeFileSync(sitemapServicesPath, generateServicesSitemap(), 'utf8');
  console.log(`[SEO] Generated: ${sitemapServicesPath} (${Object.keys(SERVICE_DETAILS).length} services)`);

  fs.writeFileSync(robotsTxtPath, generateRobotsTxt(), 'utf8');
  console.log(`[SEO] Generated: ${robotsTxtPath}`);

  console.log('[SEO] All XML sitemaps and robots.txt generated successfully!');
}

main();
