import { useState } from "react";
import { sendKey } from "./tv.js";
import { Icon, Toggle } from "./ui.jsx";

const YoutubeLogo = () => (
  <svg viewBox="0 0 28 20" width="28" height="20" aria-hidden="true">
    <rect width="28" height="20" rx="5" fill="#ff1f2d" />
    <path d="M11 6l7 4-7 4z" fill="#fff" />
  </svg>
);

export default function Tv() {
  const [on, setOn] = useState(true);
  const [error, setError] = useState(null);

  const press = (key) =>
    sendKey(key)
      .then(() => setError(null))
      .catch(setError);

  // The mock cannot read the TV's real power state, so the switch just tracks the presses.
  const power = () => {
    setOn((o) => !o);
    press("power");
  };

  const key = (k, children) => (
    <button className="key" onClick={() => press(k)} aria-label={typeof children === "string" ? children : k}>
      {children}
    </button>
  );

  return (
    <section className="panel tv">
      <header className="panel-head">
        <h2>
          Sony TV<small>Τηλεόραση</small>
        </h2>
        <Toggle checked={on} label="Τηλεόραση / TV" onChange={power} />
      </header>
      <p className="demo">Demo, not connected · Δοκιμαστικό, δεν ελέγχει την τηλεόραση</p>
      {error && <p className="error">Αποτυχία εντολής / Command failed.</p>}

      <div className="tv-layout">
        <div className="keys r1">
          <button className="key power" onClick={power} aria-label="Power · Ενεργοποίηση">
            <Icon name="power" />
          </button>
          {key("input", "Input")}
          {key("mute", <Icon name="mute" />)}
        </div>
        <div className="keys r2">
          {key("youtube", <><YoutubeLogo /> YouTube</>)}
          {key("hdmi1", <><Icon name="hdmi" /> HDMI 1</>)}
        </div>
        <div className="keys r3">
          {key("back", <><Icon name="back" size={20} /> Back</>)}
          {key("home", <><Icon name="home" size={20} /> Home</>)}
        </div>
        <div className="dpad">
          <button className="up" onClick={() => press("up")} aria-label="Up · Πάνω">
            <Icon name="up" size={20} />
          </button>
          <button className="left" onClick={() => press("left")} aria-label="Left · Αριστερά">
            <Icon name="left" size={20} />
          </button>
          <button className="ok" onClick={() => press("ok")}>
            OK
          </button>
          <button className="right" onClick={() => press("right")} aria-label="Right · Δεξιά">
            <Icon name="right" size={20} />
          </button>
          <button className="down" onClick={() => press("down")} aria-label="Down · Κάτω">
            <Icon name="down" size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
