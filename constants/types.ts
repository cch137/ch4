import type { Dispatch, SetStateAction } from 'react'

type SetState<T> = Dispatch<SetStateAction<T>>

type StatusResponse<T = undefined> = { success: boolean; message?: string, value?: T }
type StatusResponseV<T> = StatusResponse<T> & { value: T }

type UserInfo = {
  id: string;
  name: string;
  auth: number;
}

type UserDetails = {
  eadd?: string;
  ctms?: number;
  mtms?: number;
  atms?: number;
}

type NextApiContext = {
  params?: {[key:string]: string}
}

export type {
  SetState,
  StatusResponse,
  StatusResponseV,
  UserInfo,
  UserDetails,
  NextApiContext,
}
