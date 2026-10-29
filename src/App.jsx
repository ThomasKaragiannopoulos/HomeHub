import { useEffect, useState } from "react";
import { REFRESH_MS } from "./config.js";
import Ambient from "./ambient/Ambient.jsx";
import Ac from "./Ac.jsx";
import Buses from "./Buses.jsx";
import Clock from "./Clock.jsx";
import FindPhone from "./FindPhone.jsx";
import Lights from "./Lights.jsx";
import News from "./News.jsx";
import Tv from "./Tv.jsx";
import { useImageExists } from "./ui.jsx";
import Weather from "./Weather.jsx";

// The layout is drawn on a fixed 1536×1024 stage (the design mockup) and scaled to fit the window.
const STAGE = { w: 1536, h: 1024 };
const fit = () => Math.min(window.innerWidth / STAGE.w, window.innerHeight / STAGE.h);

// Remounted on every refresh (key={tick}), so it restarts from full each cycle.
function RefreshRing({ seconds }) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    const id = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="refresh">
      <svg viewBox="0 0 44 44" aria-hidden="true">
        <circle className="track" cx="22" cy="22" r="18" />
        <circle className="arc" cx="22" cy="22" r="18" style={{ animationDuration: `${seconds}s` }} />
      </svg>
      <b>{left}s</b>
      <span>
        NEXT REFRESH
        <br />
        Bus times
        <br />
        <small>ΑΝΑΝΕΩΣΗ · ΛΕΩΦΟΡΕΙΑ</small>
      </span>
    </div>
  );
}

export default function App() {
  const [tick, setTick] = useState(0);
  const [scale, setScale] = useState(fit);
  // Optional art in public/: bg.jpg (backdrop) and frame.png (chrome frames with transparent cutouts).
  const hasBg = useImageExists("/bg.jpg");
  const hasFrame = useImageExists("/frame.png");

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onResize = () => setScale(fit());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="viewport" style={{ width: STAGE.w * scale, height: STAGE.h * scale }}>
      <div
        className={`stage ${hasBg ? "has-bg" : ""} ${hasFrame ? "has-frame" : ""}`}
        style={{ width: STAGE.w, height: STAGE.h, transform: `scale(${scale})` }}
      >
        <div className="layer bg" />
        {hasBg && <Ambient />}
        <div className="layer frame" />
        <News />
        <RefreshRing key={tick} seconds={REFRESH_MS / 1000} />
        <FindPhone />
        <Clock />
        <Weather />
        <Buses tick={tick} />
        <Lights />
        <Ac />
        <Tv />
      </div>
    </div>
  );
}
