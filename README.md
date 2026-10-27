# Athens HomeHub

Home dashboard for my home in Athens. React + Vite.

## Run

    npm install
    npm run dev

The dev server proxies `/oasa` to the OASA telematics API (it sends no CORS headers).
Copy `.env.example` to `.env` and set your stops in `VITE_STOPS` (kept out of git). Restart the dev server after editing it.

## Roadmap

- [x] OASA bus arrival times for a stop (placeholder stop 10001)
- [ ] Real stop and route filter
