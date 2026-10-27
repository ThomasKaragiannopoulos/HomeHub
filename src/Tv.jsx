import { useState } from "react";
import { sendKey } from "./tv.js";

// Stateless remote: every button just sends a key.
const ROWS = [
  [
    { key: "power", label: "⏻", title: "Ενεργοποίηση / Power", cls: "power" },
    { key: "input", label: "Είσοδος · Input" },
    { key: "mute", label: "🔇", title: "Σίγαση / Mute" },
  ],
  [
    null,
    { key: "up", label: "▲", title: "Πάνω / Up" },
    null,
    { key: "left", label: "◀", title: "Αριστερά / Left" },
    { key: "ok", label: "OK", cls: "ok" },
    { key: "right", label: "▶", title: "Δεξιά / Right" },
    null,
    { key: "down", label: "▼", title: "Κάτω / Down" },
    null,
  ],
  [
    { key: "back", label: "↩ Πίσω · Back" },
    { key: "home", label: "⌂ Αρχική · Home" },
  ],
];

const PAIRS = [
  { up: "volume_up", down: "volume_down", label: "Ένταση / Vol" },
  { up: "channel_up", down: "channel_down", label: "Κανάλι / Ch" },
];

export default function Tv() {
  const [error, setError] = useState(null);

  const press = (key) =>
    sendKey(key)
      .then(() => setError(null))
      .catch(setError);

  const button = (b, i) =>
    b ? (
      <button key={b.key} className={b.cls} title={b.title} onClick={() => press(b.key)}>
        {b.label}
      </button>
    ) : (
      <span key={`gap-${i}`} />
    );

  return (
    <section className="remote tv">
      <h2>Τηλεόραση · Sony TV</h2>
      <p className="muted">Δοκιμαστικό, δεν ελέγχει την τηλεόραση / Demo, not connected to the TV.</p>
      {error && <p className="error">Αποτυχία εντολής / Command failed.</p>}

      <div className="pad top">{ROWS[0].map(button)}</div>
      <div className="pad dpad">{ROWS[1].map(button)}</div>
      <div className="pad top">{ROWS[2].map(button)}</div>

      <div className="pairs">
        {PAIRS.map((p) => (
          <div key={p.label} className="pair">
            <button onClick={() => press(p.up)} aria-label={`${p.label} +`}>+</button>
            <small className="muted">{p.label}</small>
            <button onClick={() => press(p.down)} aria-label={`${p.label} −`}>−</button>
          </div>
        ))}
      </div>
    </section>
  );
}
