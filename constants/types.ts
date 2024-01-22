interface IModelType {
  name: string;
  value: string;
  isWebBrowsingOptional: boolean;
  isTemperatureOptional: boolean;
  isContextOptional: boolean;
  permissionLevel: number;
}

interface IRedirectIModelType {
  value: string;
  redirectTo: string;
}

interface IConversation {
  name: string;
  temp: number;
  history: number;
}

export type {
  IModelType,
  IRedirectIModelType,
  IConversation,
}