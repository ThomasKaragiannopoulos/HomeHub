import { useEffect, useState } from "react";
import { NEWS_REFRESH_MS } from "./config.js";
import { getNews } from "./news.js";

const SECONDS_PER_HEADLINE = 9;

export default function News() {
  const [news, setNews] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = () =>
      getNews()
        .then((n) => {
          setNews(n);
          setError(null);
        })
        .catch(setError);
    load();
    const id = setInterval(load, NEWS_REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const headlines = (
    <>
      {news?.map((n) => (
        <a key={n.link} href={n.link} target="_blank" rel="noreferrer">
          {n.title}
        </a>
      ))}
    </>
  );

  return (
    <div className="ticker">
      <span className="label">Νέα AI · AI news</span>
      {error && <span className="ticker-msg">Δεν φορτώθηκαν τα νέα / Could not load news.</span>}
      {!error && news === null && <span className="ticker-msg">Φόρτωση… / Loading…</span>}
      {!error && news?.length === 0 && <span className="ticker-msg">Καμία είδηση / No news.</span>}
      {!error && news?.length > 0 && (
        <div className="track-wrap">
          <div className="track" style={{ animationDuration: `${news.length * SECONDS_PER_HEADLINE}s` }}>
            {headlines}
            {headlines}
          </div>
        </div>
      )}
    </div>
  );
}
