type ModelType = {
  name: string;
  value: string;
  configKeys: (keyof ConvConfig)[];
  permissionLevel: number;
}

type ConvItem = {
  id: string;
  name?: string;
  mtms?: number;
}

type MssgItem = {
  _id: string;
  text: string,
  modl?: string,
  root?: string,
  urls?: string[],
  args?: string[],
  ctms?: number,
  mtms?: number,
  dtms?: number,
}

type SaveMssg = {
  vers?: string;
  conv?: string;
  text: string;
  modl?: string;
  root?: string;
  urls?: string[];
  args?: string[];
  dtms?: number;
}

type SaveMssgRes = {
  isNewConv: boolean;
  conv: string;
  mssg: MssgItem;
}

type ConvConfig = {
  modl: string;
  temp: number; // 0-1
  topP: number; // 0-1
  topK: number; // 1-16
  ctxt: number; // 0-10 (10:auto)
}

type ConvCompleted = ConvItem & {
  conf?: string;
  messages?: MssgItem[];
}

type SendMssg = {
  root?: string;
  text: string;
}

export type {
  ModelType,
  ConvItem,
  MssgItem,
  SaveMssg,
  SaveMssgRes,
  SendMssg,
  ConvCompleted,
  ConvConfig,
}
