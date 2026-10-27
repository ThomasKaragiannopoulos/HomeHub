import { useEffect, useState } from "react";
import { WEATHER, WEATHER_REFRESH_MS } from "./config.js";
import { describe, getWeather } from "./weather.js";

const deg = (n) => `${Math.round(n)}°`;

export default function Weather() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!WEATHER) return;
    const load = () =>
      getWeather(WEATHER)
        .then((w) => {
          setWeather(w);
          setError(null);
        })
        .catch(setError);
    load();
    const id = setInterval(load, WEATHER_REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  if (!WEATHER) {
    return <p className="muted">Δεν έχει οριστεί τοποθεσία καιρού / Weather location not set (VITE_WEATHER).</p>;
  }
  if (error) return <p className="error">Δεν φορτώθηκε ο καιρός / Could not load weather.</p>;
  if (!weather) return <p className="muted">Φόρτωση… / Loading…</p>;

  const now = describe(weather.code);
  return (
    <section className="weather">
      <h2>{WEATHER.name}</h2>
      <div className="now">
        <span className="icon">{now.icon}</span>
        <span className="temp">{deg(weather.temp)}</span>
        <div>
          <div>{now.el} · {now.en}</div>
          <div className="muted">
            Αίσθηση / Feels {deg(weather.feels)} · Άνεμος / Wind {Math.round(weather.wind)} km/h
          </div>
          <div className="muted">Μέγ / High {deg(weather.hi)} · Ελάχ / Low {deg(weather.lo)}</div>
        </div>
      </div>
      <ul className="hours">
        {weather.hours.map((h) => (
          <li key={h.time}>
            <span className="muted">{h.time.slice(11, 16)}</span>
            {h.nextDay && <small className="muted">αύριο / tmrw</small>}
            <span>{describe(h.code).icon}</span>
            <b>{deg(h.temp)}</b>
          </li>
        ))}
      </ul>
    </section>
  );
}
