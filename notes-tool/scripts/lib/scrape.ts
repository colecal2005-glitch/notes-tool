import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { load } from "cheerio";

export type ScrapedImage = {
  url: string;
  alt: string;
  caption: string;
  surrounding_text: string;
  position: number;
};

export type ScrapedPost = {
  url: string;
  slug: string;
  title: string;
  text: string;
  images: ScrapedImage[];
};

function deriveSlug(url: string): string {
  const u = new URL(url);
  const segments = u.pathname.split("/").filter(Boolean);
  return segments[segments.length - 1] ?? "post";
}

function resolveUrl(src: string, base: string): string {
  try {
    return new URL(src, base).href;
  } catch {
    return src;
  }
}

function parseSrcset(srcset: string): string {
  // Substack CDN URLs contain commas in path params (w_1456,c_limit,f_auto,...).
  // Split only on commas that are immediately followed by whitespace + an absolute URL
  // so we don't shred CDN paths.
  const candidates = srcset.split(/,\s+(?=https?:\/\/)/);

  let maxWidth = -1;
  let maxUrl = "";
  for (const candidate of candidates) {
    const trimmed = candidate.trim();
    const lastSpace = trimmed.lastIndexOf(" ");
    if (lastSpace === -1) {
      if (!maxUrl) maxUrl = trimmed;
      continue;
    }
    const entryUrl = trimmed.slice(0, lastSpace);
    const descriptor = trimmed.slice(lastSpace + 1);
    const w = parseInt(descriptor);
    if (!isNaN(w) && w > maxWidth) {
      maxWidth = w;
      maxUrl = entryUrl;
    }
  }
  return maxUrl;
}

function shouldSkipImage(url: string, width?: string, height?: string): boolean {
  if (url.startsWith("data:")) return true;
  if (url.includes("/icons/") || url.includes("/avatars/")) return true;
  if (/\/(profile|user)\//i.test(url)) return true;
  if (width && height) {
    const w = parseInt(width);
    const h = parseInt(height);
    if (!isNaN(w) && !isNaN(h) && (w < 100 || h < 100)) return true;
  }
  return false;
}

function extFromUrl(url: string, contentType: string): string {
  try {
    const pathname = new URL(url).pathname;
    const dotIdx = pathname.lastIndexOf(".");
    if (dotIdx !== -1) {
      const ext = pathname.slice(dotIdx + 1).toLowerCase();
      if (["jpg", "jpeg", "png", "gif", "webp", "avif"].includes(ext)) {
        return ext === "jpeg" ? "jpg" : ext;
      }
    }
  } catch {}

  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  if (contentType.includes("avif")) return "avif";
  return "jpg";
}

async function downloadImage(url: string, imagesDir: string, position: number): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[scrape] Failed to download image ${url}: HTTP ${res.status}`);
      return false;
    }
    const contentType = res.headers.get("content-type") ?? "";
    const ext = extFromUrl(url, contentType);
    const destPath = join(imagesDir, `img-${position}.${ext}`);
    const buf = await res.arrayBuffer();
    writeFileSync(destPath, Buffer.from(buf));
    return true;
  } catch (err) {
    console.warn(`[scrape] Error downloading image ${url}: ${err}`);
    return false;
  }
}

export async function scrapePost(url: string): Promise<ScrapedPost> {
  const slug = deriveSlug(url);
  const cacheDir = join(process.cwd(), "data/scraped", slug);
  const cacheFile = join(cacheDir, "post.json");

  if (existsSync(cacheFile)) {
    console.log(`[cache] using data/scraped/${slug}/`);
    return JSON.parse(readFileSync(cacheFile, "utf-8")) as ScrapedPost;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${res.status}`);
  }
  const html = await res.text();
  const $ = load(html);

  // Title
  let title = $("h1").first().text().trim();
  if (!title) {
    title = $('meta[property="og:title"]').attr("content") ?? "";
  }

  // Article container — try in priority order
  let articleEl = $(".available-content");
  if (!articleEl.length) articleEl = $(".body.markup");
  if (!articleEl.length) articleEl = $("article");

  // Plain text
  const articleClone = articleEl.clone();
  articleClone.find("script, style").remove();
  const text = articleClone.text().replace(/\s+/g, " ").trim();

  // Images
  const images: ScrapedImage[] = [];
  let position = 0;

  articleEl.find("img").each((_, el) => {
    const imgEl = $(el);
    let src = imgEl.attr("src") ?? "";
    const srcset = imgEl.attr("srcset") ?? "";
    const widthAttr = imgEl.attr("width");
    const heightAttr = imgEl.attr("height");

    if (srcset) {
      const best = parseSrcset(srcset);
      if (best) src = best;
    }

    if (!src) return;
    src = resolveUrl(src, url);
    if (shouldSkipImage(src, widthAttr, heightAttr)) return;

    const alt = imgEl.attr("alt")?.trim() ?? "";

    let caption = "";
    const figure = imgEl.closest("figure");
    if (figure.length) {
      caption = figure.find("figcaption").first().text().trim();
    }
    if (!caption) {
      const nextEl = imgEl.next();
      const nextText = nextEl.text().trim();
      if (nextText && nextText.length < 200) caption = nextText;
    }

    const parent = figure.length ? figure : imgEl.parent();
    const parentText = parent.text().replace(/\s+/g, " ").trim();
    const prevText = parent.prev().text().replace(/\s+/g, " ").trim();
    const surrounding_text = `${prevText} ${parentText}`.trim().slice(0, 200);

    images.push({ url: src, alt, caption, surrounding_text, position });
    position++;
  });

  // Write cache and download images
  mkdirSync(join(cacheDir, "images"), { recursive: true });

  for (const img of images) {
    await downloadImage(img.url, join(cacheDir, "images"), img.position);
  }

  const scraped: ScrapedPost = { url, slug, title, text, images };
  writeFileSync(cacheFile, JSON.stringify(scraped, null, 2));
  return scraped;
}
