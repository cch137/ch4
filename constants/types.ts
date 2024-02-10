import type { Dispatch, SetStateAction } from 'react'

export type SetState<T> = Dispatch<SetStateAction<T>>

export type StatusResponse<T = undefined> = { success: boolean; message?: string, value?: T }
export type StatusResponseV<T> = StatusResponse<T> & { value: T }

export type UserInfo = {
  id: string;
  name: string;
  auth: number;
}

export type UserDetails = {
  eadd?: string;
  ctms?: number;
  mtms?: number;
  atms?: number;
}

export type UserOnlineState = UserInfo & {
  ctms: number;
  mtms: number;
  atms: number;
}

export type NextApiContext = {
  params?: {[key:string]: string}
}
