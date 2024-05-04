export type ModelType = {
  name: string;
  value: string;
  configKeys: (keyof ConvConfig)[];
  permissionLevel: number;
};

export type ConvMeta = {
  id: string;
  name?: string;
  mtms?: number;
  conf?: string;
  tail?: string;
};

export type MssgMeta = {
  _id: string;
  conv: string;
  text: string;
  modl?: string;
  root?: string;
  urls?: string[];
  args?: string[];
  ctms?: number;
  mtms?: number;
  dtms?: number;
};

export type MssgMetaWithVers = MssgMeta & {
  vers?: string;
};

export type ConvConfig = {
  modl: string;
  temp: number; // 0-1
  topP: number; // 0-1
  topK: number; // 1-16
  ctxt: number; // 0-10 (10:auto)
};

export type ConvCompleted = ConvMeta & {
  messages?: MssgMeta[];
};

export type SendMssg = {
  root?: string;
  text: string;
};
