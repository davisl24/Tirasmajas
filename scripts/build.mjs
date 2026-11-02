import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";

const root = process.cwd();
const out = join(root, "dist");
const source = readFileSync(join(root, "js/main.js"), "utf8");
const template = readFileSync(join(root, "index.html"), "utf8");
const end = source.indexOf("function render(){");
if (end < 0 || !source.startsWith("(function(){")) throw new Error("Cannot locate page renderers");
const definition = source.slice("(function(){".length, end);
const fakeDocument = { getElementById: () => ({}) };
const pages = new Function("document", definition + "\nreturn {services,nav,groupedServices,home,servicesPage,detailPage,worksPage,aboutPage,contactsPage,privacyPage,pageSeo};")(fakeDocument);

const routes = [
  ["", () => pages.home()],
  ["pakalpojumi", () => pages.servicesPage()],
  ...pages.services.map(service => ["pakalpojumi/" + service.slug, () => pages.detailPage(service.slug)]),
  ["musu-darbi", () => pages.worksPage()],
  ["par-mums", () => pages.aboutPage()],
  ["kontakti", () => pages.contactsPage()],
  ["privatums", () => pages.privacyPage()]
];
const siteUrl = (process.env.SITE_URL || "").replace(/\/+$/, "");
const sharingBase = siteUrl || (process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "");
const publicReady = process.env.PUBLIC_SITE_READY === "true" && /^https:\/\/[^/]+$/.test(siteUrl);
const escapeAttr = value => String(value).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
const navHtml = pages.nav.map(([name,href]) => '<a href="' + href + '">' + name + '</a>').join("");
const mobileNav = navHtml + '<a class="btn" href="/kontakti">Pieteikt apsekošanu</a>';
function seoFor(path) {
  const service = path.startsWith("pakalpojumi/") ? pages.services.find(s => path === "pakalpojumi/" + s.slug) : null;
  return service
    ? { title: service.name + " | Tīras Mājas", description: service.description.slice(0,190) }
    : (pages.pageSeo[path] || pages.pageSeo[""]);
}
const organization = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: "Tīras Mājas",
  areaServed: { "@type":"Country", name:"Latvia" },
  hasOfferCatalog: { "@type":"OfferCatalog", name:"Pakalpojumi", itemListElement: pages.services.map(s => ({ "@type":"OfferCatalog", name:s.name })) }
};
if (publicReady) organization.url = siteUrl + "/";
rmSync(out, {recursive:true,force:true});
mkdirSync(out, {recursive:true});
for (const folder of ["assets","css","js"]) cpSync(join(root,folder), join(out,folder), {recursive:true});
for (const [path,makeContent] of routes) {
  const seo = seoFor(path);
  const url = siteUrl + "/" + (path ? path + "/" : "");
  const ld = path === "" ? '<script type="application/ld+json">' + JSON.stringify(organization).replace(/</g,"\\u003c") + '</script>' : "";
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, "<title>" + escapeAttr(seo.title) + (publicReady ? "" : " — demo") + "</title>")
    .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="' + escapeAttr(seo.description) + '">')
    .replace(/<meta name="robots" content="[^"]*">/, '<meta name="robots" content="' + (publicReady ? "index, follow" : "noindex, nofollow") + '">')
    .replace(/<meta property="og:title" content="[^"]*">/, '<meta property="og:title" content="' + escapeAttr(seo.title) + '">')
    .replace(/<meta property="og:description" content="[^"]*">/, '<meta property="og:description" content="' + escapeAttr(seo.description) + '">')
    .replace(/<meta name="twitter:title" content="[^"]*">/, '<meta name="twitter:title" content="' + escapeAttr(seo.title) + '">')
    .replace(/<meta name="twitter:description" content="[^"]*">/, '<meta name="twitter:description" content="' + escapeAttr(seo.description) + '">')
    .replace(/<meta property="og:image" content="[^"]*">/, '<meta property="og:image" content="' + escapeAttr((sharingBase || "") + '/assets/tiras-majas-logo-apals.png') + '">')
    .replace(/<meta name="twitter:image" content="[^"]*">/, '<meta name="twitter:image" content="' + escapeAttr((sharingBase || "") + '/assets/tiras-majas-logo-apals.png') + '">')
    .replace("</head>", (sharingBase ? '<meta property="og:url" content="' + escapeAttr(sharingBase + "/" + (path ? path + "/" : "")) + '">' : "") + "</head>")
    .replace("</head>", (publicReady ? '<link rel="canonical" href="' + escapeAttr(url) + '">' : "") + ld + "</head>")
    .replace('<main id="app"></main>', '<main id="app">' + makeContent() + '</main>')
    .replace('<nav class="nav" id="nav" aria-label="Galvenā navigācija"></nav>', '<nav class="nav" id="nav" aria-label="Galvenā navigācija">' + navHtml + '</nav>')
    .replace('<nav class="mobile-nav" id="mobileNav" aria-label="Mobilā navigācija"></nav>', '<nav class="mobile-nav" id="mobileNav" aria-label="Mobilā navigācija">' + mobileNav + '</nav>');
  const filename = join(out, path, "index.html");
  mkdirSync(dirname(filename), {recursive:true});
  writeFileSync(filename,html);
}
writeFileSync(join(out,"robots.txt"), publicReady
  ? "User-agent: *\nAllow: /\nSitemap: " + siteUrl + "/sitemap.xml\n"
  : "User-agent: *\nAllow: /\n");
if (publicReady) {
  const urls = routes.filter(([path]) => path !== "privatums").map(([path]) => "<url><loc>" + escapeAttr(siteUrl + "/" + (path ? path + "/" : "")) + "</loc></url>").join("");
  writeFileSync(join(out,"sitemap.xml"), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + urls + '</urlset>');
}
console.log("Built " + routes.length + " static HTML routes in dist/. " + (publicReady ? "Public SEO enabled." : "Demo noindex active."));
