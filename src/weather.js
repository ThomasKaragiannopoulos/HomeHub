import { WEATHER_HOURS as HOURS } from "./config.js";

// WMO weather codes grouped by range → Greek / English label and icon.
const CONDITIONS = [
  { max: 0, el: "Αίθριος", en: "Clear", icon: "☀️" },
  { max: 2, el: "Λίγα σύννεφα", en: "Partly cloudy", icon: "⛅" },
  { max: 3, el: "Συννεφιά", en: "Overcast", icon: "☁️" },
  { max: 48, el: "Ομίχλη", en: "Fog", icon: "🌫️" },
  { max: 57, el: "Ψιχάλα", en: "Drizzle", icon: "🌦️" },
  { max: 67, el: "Βροχή", en: "Rain", icon: "🌧️" },
  { max: 77, el: "Χιόνι", en: "Snow", icon: "❄️" },
  { max: 82, el: "Μπόρες", en: "Showers", icon: "🌦️" },
  { max: 86, el: "Χιονόπτωση", en: "Snow showers", icon: "❄️" },
  { max: 99, el: "Καταιγίδα", en: "Thunderstorm", icon: "⛈️" },
];

export const describe = (code) => CONDITIONS.find((c) => code <= c.max) ?? CONDITIONS.at(-1);

export const getWeather = async ({ lat, lon }) => {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: "temperature_2m,apparent_temperature,weather_code,wind_speed_10m",
    hourly: "temperature_2m,weather_code",
    daily: "temperature_2m_max,temperature_2m_min",
    timezone: "auto",
    forecast_days: 3,
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo failed: ${res.status}`);
  const d = await res.json();

  // Next occurrence of each wanted hour, in chronological order.
  const upcoming = d.hourly.time
    .map((time, i) => ({ time, temp: d.hourly.temperature_2m[i], code: d.hourly.weather_code[i] }))
    .filter((h) => h.time > d.current.time);
  const hours = HOURS.map((hour) => upcoming.find((h) => Number(h.time.slice(11, 13)) === hour))
    .filter(Boolean)
    .sort((a, b) => a.time.localeCompare(b.time))
    .map((h) => ({ ...h, nextDay: h.time.slice(0, 10) !== d.current.time.slice(0, 10) }));

  return {
    temp: d.current.temperature_2m,
    feels: d.current.apparent_temperature,
    code: d.current.weather_code,
    wind: d.current.wind_speed_10m,
    hi: d.daily.temperature_2m_max[0],
    lo: d.daily.temperature_2m_min[0],
    hours,
  };
};
