import { useEffect, useState } from "react";
import { WEATHER, WEATHER_REFRESH_MS } from "./config.js";
import AnimatedNumber from "./ambient/AnimatedNumber.jsx";
import { describe, getWeather } from "./weather.js";

const Deg = ({ value }) => (
  <>
    <AnimatedNumber value={Math.round(value)} />°
  </>
);

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
    return (
      <section className="weather">
        <p className="muted">Δεν έχει οριστεί τοποθεσία καιρού / Weather location not set (VITE_WEATHER).</p>
      </section>
    );
  }
  if (error) {
    return (
      <section className="weather">
        <p className="error">Δεν φορτώθηκε ο καιρός / Could not load weather.</p>
      </section>
    );
  }
  if (!weather) {
    return (
      <section className="weather">
        <p className="muted">Φόρτωση… / Loading…</p>
      </section>
    );
  }

  const now = describe(weather.code);
  return (
    <section className="weather">
      <div className="now">
        <div className="temp">
          <AnimatedNumber value={Math.round(weather.temp)} />
          <sup>°</sup>
        </div>
        <div className="cond fade-in" key={now.en}>
          {now.en}
          <small>{now.el}</small>
        </div>
        <div className="loc">{WEATHER.name}</div>
        <dl className="metrics">
          <div>
            <dt>
              Feels like<small>Αίσθηση</small>
            </dt>
            <dd>
              <Deg value={weather.feels} />
            </dd>
          </div>
          <div>
            <dt>
              Wind<small>Άνεμος</small>
            </dt>
            <dd>
              <AnimatedNumber value={Math.round(weather.wind)} /> <span>km/h</span>
            </dd>
          </div>
          <div>
            <dt>
              High<small>Μέγ</small>
            </dt>
            <dd>
              <Deg value={weather.hi} />
            </dd>
          </div>
          <div>
            <dt>
              Low<small>Ελάχ</small>
            </dt>
            <dd>
              <Deg value={weather.lo} />
            </dd>
          </div>
        </dl>
      </div>
      <ul className="hours">
        {weather.hours.map((h) => (
          <li key={h.time}>
            <span>{h.time.slice(11, 16)}</span>
            {h.nextDay && <small>tmrw · αύριο</small>}
            <span className="icon fade-in" key={describe(h.code).icon}>
              {describe(h.code).icon}
            </span>
            <b>
              <Deg value={h.temp} />
            </b>
          </li>
        ))}
      </ul>
    </section>
  );
}
