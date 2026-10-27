import { useEffect, useState } from "react";
import { FAN_SPEEDS, MODES, TEMP_RANGE, getAc, setAc } from "./ac.js";

const MODE_LABELS = {
  auto: { icon: "🔄", el: "Αυτόματο", en: "Auto" },
  cool: { icon: "❄️", el: "Ψύξη", en: "Cool" },
  heat: { icon: "🔥", el: "Θέρμανση", en: "Heat" },
  dry: { icon: "💧", el: "Αφύγρανση", en: "Dry" },
  fan: { icon: "🌀", el: "Ανεμιστήρας", en: "Fan" },
};

const FAN_LABELS = {
  auto: { el: "Αυτόματο", en: "Auto" },
  low: { el: "Χαμηλή", en: "Low" },
  medium: { el: "Μέση", en: "Medium" },
  high: { el: "Υψηλή", en: "High" },
};

export default function Ac() {
  const [ac, setState] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAc().then(setState).catch(setError);
  }, []);

  const update = (patch) => {
    setState((s) => ({ ...s, ...patch }));
    setAc(patch).then(setState).catch(setError);
  };

  if (error) return <p className="error">Δεν φορτώθηκε το κλιματιστικό / Could not load AC.</p>;
  if (!ac) return <p className="muted">Φόρτωση… / Loading…</p>;

  const setTemp = (t) => update({ temp: Math.min(TEMP_RANGE.max, Math.max(TEMP_RANGE.min, t)) });

  return (
    <section className="remote">
      <header>
        <h2>Κλιματιστικό · Toyotomi AC</h2>
        <label className="switch">
          <input type="checkbox" checked={ac.on} onChange={(e) => update({ on: e.target.checked })} />
          <span>{ac.on ? "Ανοιχτό / On" : "Κλειστό / Off"}</span>
        </label>
      </header>
      <p className="muted">Δοκιμαστικό, δεν ελέγχει το κλιματιστικό / Demo, not connected to the AC.</p>

      <div className={ac.on ? "" : "dim"}>
        <div className="temp-row">
          <button disabled={!ac.on} onClick={() => setTemp(ac.temp - 1)} aria-label="Χαμηλότερα / Lower">−</button>
          <span className="big">{ac.temp}°</span>
          <button disabled={!ac.on} onClick={() => setTemp(ac.temp + 1)} aria-label="Υψηλότερα / Higher">+</button>
        </div>

        <div className="scenes">
          {MODES.map((id) => (
            <button
              key={id}
              className={ac.mode === id ? "active" : ""}
              disabled={!ac.on}
              onClick={() => update({ mode: id })}
            >
              <span className="icon">{MODE_LABELS[id].icon}</span>
              <span>{MODE_LABELS[id].el}</span>
              <small>{MODE_LABELS[id].en}</small>
            </button>
          ))}
        </div>

        <p className="muted">Ανεμιστήρας / Fan</p>
        <div className="scenes">
          {FAN_SPEEDS.map((id) => (
            <button
              key={id}
              className={ac.fan === id ? "active" : ""}
              disabled={!ac.on}
              onClick={() => update({ fan: id })}
            >
              <span>{FAN_LABELS[id].el}</span>
              <small>{FAN_LABELS[id].en}</small>
            </button>
          ))}
        </div>

        <div className="scenes">
          <button
            className={ac.swing ? "active" : ""}
            disabled={!ac.on}
            onClick={() => update({ swing: !ac.swing })}
          >
            <span>Κίνηση πτερυγίων</span>
            <small>Swing</small>
          </button>
        </div>
      </div>
    </section>
  );
}
