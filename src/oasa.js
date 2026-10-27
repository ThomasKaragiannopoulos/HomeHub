const get = async (act, p1) => {
  const res = await fetch(`/oasa?act=${act}&p1=${p1}`);
  if (!res.ok) throw new Error(`OASA ${act} failed: ${res.status}`);
  return res.json();
};

export const getStop = async (code) => {
  const [stop] = (await get("getStopNameAndXY", code)) ?? [];
  return stop ? { name: stop.stop_descr, nameEn: stop.stop_descr_matrix_eng } : null;
};

const routeNames = new Map();
const getRouteName = async (routeCode) => {
  if (!routeNames.has(routeCode)) {
    const [route] = (await get("getRouteName", routeCode)) ?? [];
    routeNames.set(routeCode, route?.route_descr ?? routeCode);
  }
  return routeNames.get(routeCode);
};

// OASA returns null (not []) when no bus is due.
export const getArrivals = async (stopCode) => {
  const arrivals = (await get("getStopArrivals", stopCode)) ?? [];
  const withNames = await Promise.all(
    arrivals.map(async (a) => ({
      vehicle: a.veh_code,
      minutes: Number(a.btime2),
      route: await getRouteName(a.route_code),
    })),
  );
  return withNames.sort((a, b) => a.minutes - b.minutes);
};
