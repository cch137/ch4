export const WAKAWAKA_APPNAME = "Wakawaka";
export const WAKAWAKA_APPSHORT = "WK";
export const WAKAWAKA_APPPATH = "/apps/wakawaka";
export const WAKAWAKA_SESSPATH = "/apps/wakawaka/session";
export const WAKAWAKA_GROUP = (groupId: string) => `/apps/wakawaka/${groupId}`;
export const WAKAWAKA_CARD = (groupId: string, cardId: string) =>
  `/apps/wakawaka/${groupId}/${cardId}`;
// const apiHost = "http://localhost:5000/wk";
const apiHost = "https://api.cch137.link/wk";
export const getApiPath = (
  groupId?: string,
  cardId?: string,
  ...args: string[]
) => {
  if (args.length) return `${apiHost}/${groupId}/${cardId}/${args.join("/")}`;
  if (cardId) return `${apiHost}/${groupId}/${cardId}`;
  if (groupId) return `${apiHost}/${groupId}`;
  return `${apiHost}/`;
};
