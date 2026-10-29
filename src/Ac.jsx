import { useEffect, useState } from "react";
import { FAN_SPEEDS, MODES, TEMP_RANGE, getAc, setAc } from "./ac.js";
import AnimatedNumber from "./ambient/AnimatedNumber.jsx";
import { Icon, Toggle } from "./ui.jsx";

const MODE_LABELS = {
  auto: { en: "Auto", el: "Αυτόματο" },
  cool: { en: "Cool", el: "Ψύξη" },
  heat: { en: "Heat", el: "Θέρμανση" },
  dry: { en: "Dry", el: "Αφύγρανση" },
  fan: { en: "Fan", el: "Ανεμιστήρας" },
};

const FAN_LABELS = {
  auto: { en: "Auto", el: "Αυτόματο" },
  low: { en: "Low", el: "Χαμηλή" },
  medium: { en: "Medium", el: "Μέση" },
  high: { en: "High", el: "Υψηλή" },
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
    <section className="panel ac">
      <header className="panel-head">
        <h2>
          Toyotomi AC<small>Κλιματιστικό</small>
        </h2>
        <Toggle checked={ac.on} label="Κλιματιστικό / AC" onChange={(on) => update({ on })} />
      </header>
      <p className="demo">Demo, not connected · Δοκιμαστικό, δεν ελέγχει το κλιματιστικό</p>

      <div className={ac.on ? "" : "dim"}>
        <div className="temp-row">
          <button className="round" disabled={!ac.on} onClick={() => setTemp(ac.temp - 1)} aria-label="Lower · Χαμηλότερα">
            <Icon name="minus" />
          </button>
          <span className="big">
            <AnimatedNumber value={ac.temp} duration={250} />
            <sup>°</sup>
          </span>
          <button className="round" disabled={!ac.on} onClick={() => setTemp(ac.temp + 1)} aria-label="Higher · Υψηλότερα">
            <Icon name="plus" />
          </button>
        </div>

        <div className="mode-row">
          {MODES.map((id) => (
            <button
              key={id}
              className={`mode ${ac.mode === id ? "active" : ""}`}
              disabled={!ac.on}
              onClick={() => update({ mode: id })}
            >
              <Icon name={id} size={26} />
              <span>{MODE_LABELS[id].en}</span>
              <small>{MODE_LABELS[id].el}</small>
            </button>
          ))}
        </div>

        <div className="seg-row">
          <span className="row-label">
            Fan speed<small>Ανεμιστήρας</small>
          </span>
          <div className="segments">
            {FAN_SPEEDS.map((id) => (
              <button
                key={id}
                className={`pill ${ac.fan === id ? "active" : ""}`}
                disabled={!ac.on}
                onClick={() => update({ fan: id })}
              >
                {FAN_LABELS[id].en}
                <small>{FAN_LABELS[id].el}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="seg-row">
          <span className="row-label">
            Swing<small>Κίνηση πτερυγίων</small>
          </span>
          <Toggle checked={ac.swing} disabled={!ac.on} label="Swing" onChange={(swing) => update({ swing })} />
        </div>
      </div>
    </section>
  );
}
