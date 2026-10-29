import { useState } from "react";
import { pingPhone } from "./phone.js";
import { Icon } from "./ui.jsx";

const LABELS = {
  idle: { en: "Find my iPhone", el: "Εντοπισμός iPhone" },
  pinging: { en: "Playing sound…", el: "Αναπαραγωγή ήχου…" },
  done: { en: "Sound sent", el: "Ο ήχος στάλθηκε" },
};

export default function FindPhone() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const ping = () => {
    setStatus("pinging");
    setError(null);
    pingPhone()
      .then(() => {
        setStatus("done");
        setTimeout(() => setStatus("idle"), 2500);
      })
      .catch((e) => {
        setError(e);
        setStatus("idle");
      });
  };

  const label = error ? { en: "Failed, retry", el: "Αποτυχία, δοκιμάστε ξανά" } : LABELS[status];
  return (
    <button className={`pill find-phone ${status === "idle" ? "" : "active"}`} disabled={status === "pinging"} onClick={ping}>
      <Icon name="phone" size={22} />
      <span className="label">
        <span>{label.en}</span>
        <small>{label.el}</small>
      </span>
    </button>
  );
}
