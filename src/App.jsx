import { useEffect, useState } from "react";
import { STOP_CODE, REFRESH_MS } from "./config.js";
import { getArrivals, getStop } from "./oasa.js";

export default function App() {
  const [stop, setStop] = useState(null);
  const [arrivals, setArrivals] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStop(STOP_CODE).then(setStop).catch(setError);
  }, []);

  useEffect(() => {
    const load = () =>
      getArrivals(STOP_CODE)
        .then((a) => {
          setArrivals(a);
          setError(null);
        })
        .catch(setError);
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <main>
      <h1>{stop ? `${stop.name} · ${stop.nameEn}` : `Στάση ${STOP_CODE}`}</h1>
      {error && <p className="error">Δεν φορτώθηκαν οι αφίξεις / Could not load arrivals.</p>}
      {!error && arrivals === null && <p className="muted">Φόρτωση… / Loading…</p>}
      {!error && arrivals?.length === 0 && (
        <p className="muted">Κανένα λεωφορείο σύντομα / No buses due soon.</p>
      )}
      <ul>
        {arrivals?.map((a) => (
          <li key={`${a.vehicle}-${a.route}`}>
            <span className="route">{a.route}</span>
            <span className="eta">{a.minutes} λεπτά</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
