import { useEffect, useState } from "react";

const TZ = "Europe/Athens";
const time = new Intl.DateTimeFormat("el-GR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TZ,
});
const date = (locale) =>
  new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
const dateEl = date("el-GR");
const dateEn = date("en-GB");
const offset = new Intl.DateTimeFormat("en", { timeZone: TZ, timeZoneName: "shortOffset" });

// Each digit is keyed by its value, so only a changing digit replays the short fade.
const Digits = ({ text }) => (
  <span>
    {[...text].map((d, i) => (
      <span key={`${i}-${d}`} className="digit">
        {d}
      </span>
    ))}
  </span>
);

export default function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const part = (type) => time.formatToParts(now).find((p) => p.type === type).value;
  const gmt = offset.formatToParts(now).find((p) => p.type === "timeZoneName").value;

  return (
    <section className="clock">
      <div className="time">
        <Digits text={part("hour")} />
        <i className="spark" />
        <Digits text={part("minute")} />
      </div>
      <div className="date">{dateEn.format(now)}</div>
      <div className="date el">{dateEl.format(now)}</div>
      <div className="place">ATHENS · ΑΘΗΝΑ · {gmt}</div>
    </section>
  );
}
