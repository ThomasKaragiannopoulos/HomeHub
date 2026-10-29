import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./motion.js";

// Eases between integer values instead of jumping. Pair with tabular figures to avoid width jitter.
export default function AnimatedNumber({ value, duration = 450 }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(value);
  const current = useRef(value);

  useEffect(() => {
    if (reduced || current.current === value) {
      current.current = value;
      setShown(value);
      return;
    }
    const from = current.current;
    const start = performance.now();
    let raf;
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      current.current = from + (value - from) * (1 - Math.pow(1 - t, 3));
      setShown(Math.round(current.current));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduced]);

  return shown;
}
