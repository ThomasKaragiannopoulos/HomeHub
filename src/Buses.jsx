import { useEffect, useState } from "react";
import { STOPS } from "./config.js";
import { getArrivals, getStop } from "./oasa.js";
import AnimatedNumber from "./ambient/AnimatedNumber.jsx";
import { Icon } from "./ui.jsx";

const MAX_ROWS = 3;

const titleCase = (s) => s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

function StopCard({ stop: { code, title, note, lineCodes }, tick }) {
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
    <article className="stop panel">
      <header>
        <div>
          <h3>
            {title ?? (stop ? titleCase(stop.nameEn) : `Stop ${code}`)}
            {stop && <small>{stop.name}</small>}
          </h3>
          {note && <p className="towards">{note}</p>}
        </div>
        <Icon name="arrow" size={18} />
      </header>
      {error && <p className="error">Δεν φορτώθηκαν οι αφίξεις / Could not load arrivals.</p>}
      {!error && arrivals === null && <p className="muted">Φόρτωση… / Loading…</p>}
      {!error && arrivals?.length === 0 && (
        <p className="muted">Κανένα λεωφορείο σύντομα / No buses due soon.</p>
      )}
      <ul>
        {arrivals?.slice(0, MAX_ROWS).map((a, i) => (
          <li key={`${a.vehicle}-${a.route}-${i}`}>
            {a.line && <b className="line">{a.line}</b>}
            <span className="dest" title={a.route}>
              {a.route}
            </span>
            <span className="eta">
              <b>
                <AnimatedNumber value={a.minutes} />
              </b>{" "}
              min <small>λεπτά</small>
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function Buses({ tick }) {
  return (
    <section className="buses">
      <div className="slides">
        {STOPS.map((s) => (
          <StopCard key={s.code} stop={s} tick={tick} />
        ))}
      </div>
    </section>
  );
}
