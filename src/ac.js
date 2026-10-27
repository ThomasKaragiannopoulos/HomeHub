// MOCK: in-memory state, no AC is controlled. Swap these two functions for calls to the
// control server once it exists; the UI only depends on this interface.
export const MODES = ["auto", "cool", "heat", "dry", "fan"];
export const FAN_SPEEDS = ["auto", "low", "medium", "high"];
export const TEMP_RANGE = { min: 16, max: 30 };

let state = { on: false, mode: "cool", temp: 24, fan: "auto", swing: false };
const delay = () => new Promise((r) => setTimeout(r, 120));

export const getAc = async () => {
  await delay();
  return { ...state };
};

export const setAc = async (patch) => {
  await delay();
  state = { ...state, ...patch };
  return { ...state };
};
