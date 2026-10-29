// MOCK: no sound is played. Swap for a call to the server that talks to iCloud once it exists.
export const pingPhone = async () => {
  await new Promise((r) => setTimeout(r, 900));
};
