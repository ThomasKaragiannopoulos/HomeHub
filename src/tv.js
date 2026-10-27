// MOCK: no key is sent to a TV. Swap for a call to the control server once it exists.
const delay = () => new Promise((r) => setTimeout(r, 80));

export const sendKey = async (key) => {
  await delay();
  return key;
};
