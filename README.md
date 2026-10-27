# Athens HomeHub

Home dashboard for my home in Athens. React + Vite.

## Run

    npm install
    npm run dev

The dev server proxies `/oasa` to the OASA telematics API (it sends no CORS headers).
Set the stop in `src/config.js` (`STOP_CODE`).

## Roadmap

- [x] OASA bus arrival times for a stop (placeholder stop 10001)
- [ ] Real stop and route filter
