import { useEffect, useRef, useState } from "react";
import { SCENES, getLights, setDevice, setLights } from "./lights.js";
import { Icon, Toggle, useImageExists } from "./ui.jsx";

const SCENE_LABELS = {
  tv: { en: "TV sync", el: "Συγχρονισμός TV" },
  colour: { en: "Colour", el: "Χρώμα" },
  white: { en: "White", el: "Λευκό" },
  music: { en: "Music show", el: "Μουσική" },
  individual: { en: "Individual", el: "Μεμονωμένα" },
};

const CHANNELS = [
  { key: "r", en: "Red", el: "Κόκκινο" },
  { key: "g", en: "Green", el: "Πράσινο" },
  { key: "b", en: "Blue", el: "Μπλε" },
];

const rgb = ({ r, g, b }) => `rgb(${r} ${g} ${b})`;

function Slider({ en, el, kind, value, unit = "", ...range }) {
  return (
    <label className="slider">
      <span className="slider-label">
        {en}
        <small>{el}</small>
      </span>
      <input type="range" className={kind} value={value} {...range} />
      <span className="slider-value">
        {value}
        {unit}
      </span>
    </label>
  );
}

function Scene({ id, active, disabled, onSelect }) {
  const art = `/scenes/${id}.jpg`;
  const hasArt = useImageExists(art);
  return (
    <button className={`scene ${active ? "active" : ""}`} disabled={disabled} onClick={() => onSelect(id)}>
      <span className="disc" style={hasArt ? { backgroundImage: `url(${art})` } : undefined}>
        {!hasArt && <Icon name={id} size={26} />}
      </span>
      <span>{SCENE_LABELS[id].en}</span>
      <small>{SCENE_LABELS[id].el}</small>
    </button>
  );
}

function ColourSliders({ color, onChange }) {
  return CHANNELS.map(({ key, en, el }) => (
    <Slider
      key={key}
      en={en}
      el={el}
      kind={key}
      min="0"
      max="255"
      value={color[key]}
      onChange={(e) => onChange({ ...color, [key]: Number(e.target.value) })}
    />
  ));
}

function DeviceMenu({ devices, onChange, onClose }) {
  const ref = useRef(null);
  const list = useRef(null);

  // The header is pinned and only the list scrolls; a wheel anywhere else (header, padding,
  // backdrop) scrolls the list too instead of doing nothing.
  const onWheel = (e) => {
    if (!list.current.contains(e.target)) list.current.scrollBy({ top: e.deltaY });
  };

  useEffect(() => {
    ref.current.showModal();
  }, []);

  return (
    <dialog ref={ref} className="device-menu" onClose={onClose} onWheel={onWheel}>
      <header className="panel-head">
        <h2>
          Individual lights<small>Μεμονωμένα φώτα</small>
        </h2>
        <button className="pill" onClick={() => ref.current.close()}>
          Close · Κλείσιμο
        </button>
      </header>
      <div className="device-list" ref={list}>
      {devices.map((d) => (
        <div key={d.id} className="device">
          <div className="device-head">
            <b>{d.name}</b>
            <Toggle checked={d.on} label={d.name} onChange={(on) => onChange(d.id, { on })} />
          </div>
          {d.on && (
            <div className="lights-controls">
              <div className="sliders">
                <Slider
                  en="Brightness"
                  el="Φωτεινότητα"
                  kind="bright"
                  min="1"
                  max="100"
                  unit="%"
                  value={d.brightness}
                  onChange={(e) => onChange(d.id, { brightness: Number(e.target.value) })}
                />
                <ColourSliders color={d.color} onChange={(color) => onChange(d.id, { color })} />
              </div>
              <div className="orb small" style={{ "--orb": rgb(d.color) }} title="Colour · Χρώμα" />
            </div>
          )}
        </div>
      ))}
      </div>
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

  const showControls = lights.on && (lights.scene === "colour" || lights.scene === "white");

  return (
    <section className="panel lights">
      <header className="panel-head">
        <h2>
          Living room lights<small>Σαλόνι</small>
        </h2>
        <Toggle checked={lights.on} label="Φώτα / Lights" onChange={(on) => update({ on })} />
      </header>
      <p className="demo">Demo, not connected · Δοκιμαστικό, δεν ελέγχει φώτα</p>

      <div className={`scene-row ${lights.on ? "" : "off"}`}>
        {SCENES.map((id) => (
          <Scene key={id} id={id} active={lights.scene === id} disabled={!lights.on} onSelect={selectScene} />
        ))}
      </div>

      {showControls && (
        <div className="lights-controls">
          <div className="sliders">
            <Slider
              en="Brightness"
              el="Φωτεινότητα"
              kind="bright"
              min="1"
              max="100"
              unit="%"
              value={lights.brightness}
              onChange={(e) => update({ brightness: Number(e.target.value) })}
            />
            {lights.scene === "white" && (
              <Slider
                en="Temperature"
                el="Θερμοκρασία"
                kind="kelvin"
                min="2000"
                max="9000"
                step="100"
                unit="K"
                value={lights.kelvin}
                onChange={(e) => update({ kelvin: Number(e.target.value) })}
              />
            )}
            {lights.scene === "colour" && (
              <ColourSliders color={lights.color} onChange={(color) => update({ color })} />
            )}
          </div>
          {lights.scene === "colour" && <div className="orb" style={{ "--orb": rgb(lights.color) }} title="Colour · Χρώμα" />}
        </div>
      )}

      {lights.on && lights.scene === "individual" && !menuOpen && (
        <button className="pill wide" onClick={() => setMenuOpen(true)}>
          Open lights menu · Άνοιγμα μενού φώτων
        </button>
      )}
      {menuOpen && <DeviceMenu devices={lights.devices} onChange={updateDevice} onClose={() => setMenuOpen(false)} />}
    </section>
  );
}
