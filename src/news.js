const MAX_ITEMS = 12;
const FEEDS = ["/news/techcrunch", "/news/mit"];

// The feeds are AI category feeds, but they cross-post off-topic stories (e.g. security
// breaches tagged "AI"), so headlines must also name an AI term.
const AI_TITLE =
  /\b(AI|A\.I\.|artificial intelligence|machine learning|deep learning|LLMs?|GPT[\w-]*|ChatGPT|OpenAI|Anthropic|Claude|Gemini|Grok|xAI|DeepMind|DeepSeek|Mistral|Llama|Qwen|Copilot|chatbots?|generative|neural)\b/i;

const getFeed = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`News feed ${url} failed: ${res.status}`);
  const xml = new DOMParser().parseFromString(await res.text(), "text/xml");
  return [...xml.querySelectorAll("item")].map((item) => ({
    title: item.querySelector("title")?.textContent.trim(),
    link: item.querySelector("link")?.textContent.trim(),
    date: new Date(item.querySelector("pubDate")?.textContent ?? 0),
  }));
};

// Feeds are proxied through the dev server because they send no CORS headers.
export const getNews = async () => {
  const results = await Promise.allSettled(FEEDS.map(getFeed));
  const ok = results.filter((r) => r.status === "fulfilled");
  if (ok.length === 0) throw results[0].reason;
  return ok
    .flatMap((r) => r.value)
    .filter((n) => n.title && n.link && AI_TITLE.test(n.title))
    .sort((a, b) => b.date - a.date)
    .slice(0, MAX_ITEMS);
};
