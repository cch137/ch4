export type ModelType = {
  name: string;
  value: string;
  configKeys: (keyof ConvConfig)[];
  permissionLevel: number;
}

export type ConvItem = {
  id: string;
  name?: string;
  mtms?: number;
  tail?: string;
}

export type MssgItem = {
  _id: string;
  conv: string;
  text: string,
  modl?: string,
  root?: string,
  urls?: string[],
  args?: string[],
  ctms?: number,
  mtms?: number,
  dtms?: number,
}

export type MssgItemWithVers = MssgItem & {
  vers?: string;
}

export type ConvConfig = {
  modl: string;
  temp: number; // 0-1
  topP: number; // 0-1
  topK: number; // 1-16
  ctxt: number; // 0-10 (10:auto)
}

export type ConvCompleted = ConvItem & {
  conf?: string;
  messages?: MssgItem[];
}

export type SendMssg = {
  root?: string;
  text: string;
}
