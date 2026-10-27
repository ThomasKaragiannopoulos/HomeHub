// Stops and weather location come from .env so they stay out of the public repo. See .env.example.
export const STOPS = JSON.parse(import.meta.env.VITE_STOPS ?? "[]");
export const WEATHER = JSON.parse(import.meta.env.VITE_WEATHER ?? "null");
export const REFRESH_MS = 20000;
export const WEATHER_HOURS = [8, 18, 19, 20, 0]; // hours of day (0 = midnight) to forecast
export const NEWS_REFRESH_MS = 5 * 60 * 1000;
export const WEATHER_REFRESH_MS = 10 * 60 * 1000;
