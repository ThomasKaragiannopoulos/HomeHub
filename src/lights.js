// MOCK: in-memory state, no lights are controlled. Swap these two functions for calls to the
// light server once it exists; the UI only depends on this interface.
export const SCENES = ["tv", "colour", "white", "music", "individual"];

const device = (id, name) => ({ id, name, on: true, brightness: 80, color: { r: 255, g: 184, b: 108 } });

// Placeholder devices; the real list will come from the light server.
let state = {
  on: true,
  scene: "colour",
  brightness: 80,
  color: { r: 255, g: 184, b: 108 },
  kelvin: 3000,
  devices: [device("tv", "TV Backlight 3 Lite"), device("strip", "Light strip"), device("lamp", "Floor lamp")],
};
const delay = () => new Promise((r) => setTimeout(r, 120));

export const getLights = async () => {
  await delay();
  return { ...state };
};

export const setLights = async (patch) => {
  await delay();
  state = { ...state, ...patch };
  return { ...state };
};

export const setDevice = async (id, patch) => {
  await delay();
  state = { ...state, devices: state.devices.map((d) => (d.id === id ? { ...d, ...patch } : d)) };
  return { ...state };
};
