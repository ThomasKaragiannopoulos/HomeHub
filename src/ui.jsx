// Small shared UI pieces: line icons, the toggle switch and an asset-presence hook.
import { useEffect, useState } from "react";

const PATHS = {
  tv: (
    <>
      <rect x="3" y="5" width="18" height="12" rx="2" />
      <path d="M8 21h8" />
    </>
  ),
  colour: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="9" cy="10" r="1" />
      <circle cx="14" cy="9" r="1" />
      <circle cx="15" cy="14" r="1" />
    </>
  ),
  white: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
    </>
  ),
  music: (
    <>
      <path d="M9 18V6l10-2v12" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="16" r="2" />
    </>
  ),
  individual: <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3 11c.7.7 1 1.4 1 2h4c0-.6.3-1.3 1-2a6 6 0 0 0-3-11z" />,
  auto: <path d="M4 19l8-14 8 14M8.5 14h7" />,
  cool: <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9M9 4.5l3 2 3-2M9 19.5l3-2 3 2" />,
  heat: <path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z" />,
  dry: <path d="M12 3c3.5 4.5 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 2.5-6.5 6-11z" />,
  fan: (
    <>
      <circle cx="12" cy="12" r="1.5" />
      <ellipse cx="12" cy="6.5" rx="2.6" ry="4" />
      <ellipse cx="12" cy="17.5" rx="2.6" ry="4" />
      <ellipse cx="6.5" cy="12" rx="4" ry="2.6" />
      <ellipse cx="17.5" cy="12" rx="4" ry="2.6" />
    </>
  ),
  power: <path d="M12 3v8M6.4 6.6a8 8 0 1 0 11.2 0" />,
  mute: <path d="M4 9h4l5-4v14l-5-4H4zM16 9l5 6M21 9l-5 6" />,
  home: <path d="M4 11l8-7 8 7M6 10v10h12V10" />,
  back: <path d="M10 6l-6 6 6 6M4 12h16" />,
  hdmi: (
    <>
      <path d="M3 8h18v5l-2 3H5l-2-3z" />
      <path d="M7 11h2M11 11h2M15 11h2" />
    </>
  ),
  up: <path d="M6 15l6-6 6 6" />,
  down: <path d="M6 9l6 6 6-6" />,
  left: <path d="M15 6l-6 6 6 6" />,
  right: <path d="M9 6l6 6-6 6" />,
  arrow: <path d="M4 12h16M14 6l6 6-6 6" />,
  phone: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2.5" />
      <path d="M11 18h2" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
};

export const Icon = ({ name, size = 24 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {PATHS[name]}
  </svg>
);

export const Toggle = ({ checked, onChange, label, disabled }) => (
  <label className="toggle" aria-label={label}>
    <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
    <span />
  </label>
);

// True once `src` loads, so optional art in public/ can replace the CSS fallbacks.
export const useImageExists = (src) => {
  const [exists, setExists] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.onload = () => setExists(true);
    img.src = src;
  }, [src]);
  return exists;
};
