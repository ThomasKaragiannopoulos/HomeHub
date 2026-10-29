import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

export const prefersReducedMotion = () => window.matchMedia(QUERY).matches;

export const useReducedMotion = () => {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
};
