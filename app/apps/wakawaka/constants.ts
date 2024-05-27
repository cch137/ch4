export const WAKAWAKA_APPNAME = "Wakawaka";
export const WAKAWAKA_APPSHORT = "WK";
export const WAKAWAKA_APPPATH = "/apps/wakawaka";
export const WAKAWAKA_SESSPATH = "/apps/wakawaka/session";
export const WAKAWAKA_GROUP = (groupId: string) => `/apps/wakawaka/${groupId}`;
export const WAKAWAKA_CARD = (groupId: string, cardId: string) =>
  `/apps/wakawaka/${groupId}/${cardId}`;
const apiHost = "https://api.cch137.link/wk";
// const apiHost = "http://localhost:5000/wk";
export const API_LISTS_PATH = apiHost + "/";
export const API_IMAGE_PATH = apiHost + "/image";
export const API_OP_GROUPS_PATH = (groupId: string) => `${apiHost}/${groupId}`;
export const API_OP_CARDS_PATH = (groupId: string, cardId: string) =>
  `${apiHost}/${groupId}/${cardId}`;
export const API_OP_BLOCKS_PATH = (
  groupId: string,
  cardId: string,
  blockId: string
) => `${apiHost}/${groupId}/${cardId}/${blockId}`;
