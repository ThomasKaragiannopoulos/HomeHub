import { useEffect, useState } from "react";
import { STOPS, REFRESH_MS } from "./config.js";
import { getArrivals, getStop } from "./oasa.js";
import Clock from "./Clock.jsx";
import Lights from "./Lights.jsx";
import News from "./News.jsx";
import Weather from "./Weather.jsx";

function StopCard({ stop: { code, note, lineCodes }, tick }) {
  const [stop, setStop] = useState(null);
  const [arrivals, setArrivals] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStop(code).then(setStop).catch(setError);
  }, [code]);

  useEffect(() => {
    getArrivals(code, lineCodes)
      .then((a) => {
        setArrivals(a);
        setError(null);
      })
      .catch(setError);
  }, [code, tick]);

  return (
    <section>
      <h2>{stop ? `${stop.name} · ${stop.nameEn}` : `Στάση ${code}`}</h2>
      {note && <p className="muted">{note}</p>}
      {error && <p className="error">Δεν φορτώθηκαν οι αφίξεις / Could not load arrivals.</p>}
      {!error && arrivals === null && <p className="muted">Φόρτωση… / Loading…</p>}
      {!error && arrivals?.length === 0 && (
        <p className="muted">Κανένα λεωφορείο σύντομα / No buses due soon.</p>
      )}
      <ul>
        {arrivals?.map((a) => (
          <li key={`${a.vehicle}-${a.route}-${a.minutes}`}>
            <span className="route">
              {a.line && <b className="line">{a.line}</b>}
              {a.route}
            </span>
            <span className="eta">{a.minutes} λεπτά</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function App() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <News />
      <main>
        <header>
          <h1>HomeHub</h1>
          <span className="timer" title="Next refresh">
            <span key={tick} style={{ animationDuration: `${REFRESH_MS}ms` }} />
          </span>
        </header>
        <Clock />
        <Weather />
        <div className="slides">
          {STOPS.map((s) => (
            <StopCard key={s.code} stop={s} tick={tick} />
          ))}
        </div>
        <Lights />
      </main>
    </>
  );
}
