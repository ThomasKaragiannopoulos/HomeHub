import { useEffect, useRef, useState } from "react";
import { SCENES, getLights, setDevice, setLights } from "./lights.js";

const SCENE_LABELS = {
  tv: { icon: "📺", el: "Συγχρονισμός TV", en: "TV sync" },
  colour: { icon: "🎨", el: "Χρώμα", en: "Colour" },
  white: { icon: "⚪", el: "Λευκό", en: "White" },
  music: { icon: "🎵", el: "Μουσική", en: "Music show" },
  individual: { icon: "💡", el: "Μεμονωμένα", en: "Individual" },
};

const CHANNELS = [
  { key: "r", label: "Κόκκινο / Red" },
  { key: "g", label: "Πράσινο / Green" },
  { key: "b", label: "Μπλε / Blue" },
];

function ColourSliders({ color, onChange }) {
  return CHANNELS.map(({ key, label }) => (
    <label key={key}>
      <span>{label} · {color[key]}</span>
      <input
        type="range"
        min="0"
        max="255"
        className={`channel ${key}`}
        value={color[key]}
        onChange={(e) => onChange({ ...color, [key]: Number(e.target.value) })}
      />
    </label>
  ));
}

function DeviceMenu({ devices, onChange, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    ref.current.showModal();
  }, []);

  return (
    <dialog ref={ref} className="device-menu" onClose={onClose}>
      <header>
        <h2>Μεμονωμένα φώτα · Individual lights</h2>
        <button onClick={() => ref.current.close()}>Κλείσιμο / Close</button>
      </header>
      {devices.map((d) => (
        <div key={d.id} className="device">
          <label className="switch">
            <input type="checkbox" checked={d.on} onChange={(e) => onChange(d.id, { on: e.target.checked })} />
            <b>{d.name}</b>
          </label>
          {d.on && (
            <div className="controls">
              <label>
                <span>Φωτεινότητα / Brightness · {d.brightness}%</span>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={d.brightness}
                  onChange={(e) => onChange(d.id, { brightness: Number(e.target.value) })}
                />
              </label>
              <ColourSliders color={d.color} onChange={(color) => onChange(d.id, { color })} />
              <div
                className="swatch"
                style={{ background: `rgb(${d.color.r} ${d.color.g} ${d.color.b})` }}
                title="Χρώμα / Colour"
              />
            </div>
          )}
        </div>
      ))}
    </dialog>
  );
}

export default function Lights() {
  const [lights, setState] = useState(null);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    getLights().then(setState).catch(setError);
  }, []);

  const update = (patch) => {
    setState((s) => ({ ...s, ...patch }));
    setLights(patch).then(setState).catch(setError);
  };

  const updateDevice = (id, patch) => {
    setState((s) => ({ ...s, devices: s.devices.map((d) => (d.id === id ? { ...d, ...patch } : d)) }));
    setDevice(id, patch).then(setState).catch(setError);
  };

  const selectScene = (id) => {
    update({ scene: id });
    setMenuOpen(id === "individual");
  };

  if (error) return <p className="error">Δεν φορτώθηκαν τα φώτα / Could not load lights.</p>;
  if (!lights) return <p className="muted">Φόρτωση… / Loading…</p>;

  return (
    <section className="lights">
      <header>
        <h2>Σαλόνι · Living room</h2>
        <label className="switch">
          <input type="checkbox" checked={lights.on} onChange={(e) => update({ on: e.target.checked })} />
          <span>{lights.on ? "Ανοιχτά / On" : "Κλειστά / Off"}</span>
        </label>
      </header>
      <p className="muted">Δοκιμαστικό, δεν ελέγχει φώτα / Demo, not connected to lights.</p>

      <div className={`scenes ${lights.on ? "" : "off"}`}>
        {SCENES.map((id) => (
          <button
            key={id}
            className={lights.scene === id ? "active" : ""}
            disabled={!lights.on}
            onClick={() => selectScene(id)}
          >
            <span className="icon">{SCENE_LABELS[id].icon}</span>
            <span>{SCENE_LABELS[id].el}</span>
            <small>{SCENE_LABELS[id].en}</small>
          </button>
        ))}
      </div>

      {lights.on && (lights.scene === "colour" || lights.scene === "white") && (
        <div className="controls">
          <label>
            <span>Φωτεινότητα / Brightness · {lights.brightness}%</span>
            <input
              type="range"
              min="1"
              max="100"
              value={lights.brightness}
              onChange={(e) => update({ brightness: Number(e.target.value) })}
            />
          </label>
          {lights.scene === "white" && (
            <label>
              <span>Θερμοκρασία / Temperature · {lights.kelvin}K (ζεστό / warm → ψυχρό / cold)</span>
              <input
                type="range"
                min="2000"
                max="9000"
                step="100"
                className="kelvin"
                value={lights.kelvin}
                onChange={(e) => update({ kelvin: Number(e.target.value) })}
              />
            </label>
          )}
          {lights.scene === "colour" && (
            <>
              <ColourSliders color={lights.color} onChange={(color) => update({ color })} />
              <div
                className="swatch"
                style={{ background: `rgb(${lights.color.r} ${lights.color.g} ${lights.color.b})` }}
                title="Χρώμα / Colour"
              />
            </>
          )}
        </div>
      )}

      {lights.on && lights.scene === "individual" && !menuOpen && (
        <button className="open-menu" onClick={() => setMenuOpen(true)}>
          Άνοιγμα μενού φώτων / Open lights menu
        </button>
      )}
      {menuOpen && <DeviceMenu devices={lights.devices} onChange={updateDevice} onClose={() => setMenuOpen(false)} />}
    </section>
  );
}
