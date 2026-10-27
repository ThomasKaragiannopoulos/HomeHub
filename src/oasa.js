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

let lineIds;
const getLineId = async (lineCode) => {
  lineIds ??= get("webGetLines", "").then(
    (lines) => new Map(lines.map((l) => [l.LineCode, l.LineID])),
  );
  return (await lineIds).get(lineCode);
};

const lineRoutes = new Map();
const routeLines = new Map();
const getLineRouteCodes = async (lineCode) => {
  if (!lineRoutes.has(lineCode)) {
    const [routes, lineId] = await Promise.all([get("webGetRoutes", lineCode), getLineId(lineCode)]);
    lineRoutes.set(lineCode, (routes ?? []).map((r) => r.RouteCode));
    (routes ?? []).forEach((r) => routeLines.set(r.RouteCode, lineId));
  }
  return lineRoutes.get(lineCode);
};

// OASA returns null (not []) when no bus is due.
export const getArrivals = async (stopCode, lineCodes) => {
  let arrivals = (await get("getStopArrivals", stopCode)) ?? [];
  if (lineCodes) {
    const allowed = new Set((await Promise.all(lineCodes.map(getLineRouteCodes))).flat());
    arrivals = arrivals.filter((a) => allowed.has(a.route_code));
  }
  const withNames = await Promise.all(
    arrivals.map(async (a) => ({
      vehicle: a.veh_code,
      minutes: Number(a.btime2),
      line: routeLines.get(a.route_code),
      route: await getRouteName(a.route_code),
    })),
  );
  return withNames.sort((a, b) => a.minutes - b.minutes);
};
