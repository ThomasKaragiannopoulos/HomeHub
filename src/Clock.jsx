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

export default function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="clock">
      <div className="time">{time.format(now)}</div>
      <div className="muted">
        {dateEl.format(now)} · {dateEn.format(now)}
      </div>
    </section>
  );
}
