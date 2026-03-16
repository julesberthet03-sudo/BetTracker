import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { parseStringPromise } from "xml2js";

const app  = express();
const PORT = 3001;

app.use(cors());

const FEEDS = [
  { id: "footmercato", name: "Foot Mercato", url: "https://www.footmercato.net/rss",         color: "#3b82f6" },
  { id: "lequipe",     name: "L'Équipe",     url: "https://www.lequipe.fr/rss/actu_rss.xml", color: "#ef4444" },
  { id: "rmcsport",    name: "RMC Sport",    url: "https://www.rmcsport.fr/rss.xml",          color: "#f97316" },
];

function stripHtml(html) {
  if (!html) return "";
  return String(html)
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, "")
    .trim();
}

function extractText(val) {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return extractText(val[0]);
  if (typeof val === "object") return val._ || val["#text"] || "";
  return String(val);
}

async function fetchFeed(feed) {
  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(feed.url, {
      signal:  controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BetTracker/1.0; +https://github.com)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml    = await res.text();
    const parsed = await parseStringPromise(xml, { explicitArray: true, trim: true });
    const items  = parsed?.rss?.channel?.[0]?.item ?? [];

    return items.slice(0, 5).map((item, i) => {
      const title       = stripHtml(extractText(item.title));
      const description = stripHtml(extractText(item.description)).slice(0, 200);
      const pubDate     = extractText(item.pubDate);
      const guid        = extractText(item.guid);

      // <link> in RSS 2.0 is awkward in xml2js: it may be parsed as an empty
      // object when the text sits between <link/> tags. Fall back to guid.
      let link = extractText(item.link);
      if (!link || link === "") link = guid;

      return {
        id:          `${feed.id}-${i}`,
        source:      feed.name,
        sourceId:    feed.id,
        sourceColor: feed.color,
        title,
        description,
        link,
        pubDate,
        isPlaceholder: false,
      };
    });
  } finally {
    clearTimeout(timeout);
  }
}

app.get("/api/news", async (_req, res) => {
  const results  = await Promise.allSettled(FEEDS.map(fetchFeed));
  const articles = [];
  const errors   = {};

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      articles.push(...result.value);
    } else {
      errors[FEEDS[i].id] = result.reason?.message ?? "Erreur inconnue";
      console.error(`[${FEEDS[i].name}] ${result.reason?.message}`);
    }
  });

  articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  res.json({ articles, errors });
});

app.listen(PORT, () => {
  console.log(`BetTracker news server → http://localhost:${PORT}`);
});
