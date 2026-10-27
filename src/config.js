// Stops come from .env (VITE_STOPS, JSON array) so they stay out of the public repo. See .env.example.
export const STOPS = JSON.parse(import.meta.env.VITE_STOPS ?? "[]");
export const REFRESH_MS = 20000;
