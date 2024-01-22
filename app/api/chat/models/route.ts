import { NextResponse } from "next/server"
import type { IModelType, IRedirectIModelType } from '@/constants/types'

const MIN_LEVEL = 0;
const LOGGED_IN_LEVEL = 1;

const models: IModelType[] = [
  {
    name: 'Gemini-Pro',
    value: 'gemini-pro',
    isWebBrowsingOptional: false,
    isTemperatureOptional: false,
    isContextOptional: true,
    permissionLevel: MIN_LEVEL,
  },
  {
    name: 'GPT-3.5-Turbo',
    value: 'gpt3',
    isWebBrowsingOptional: false,
    isTemperatureOptional: true,
    isContextOptional: true,
    permissionLevel: MIN_LEVEL,
  },
  {
    name: 'GPT-4',
    value: 'gpt4',
    isWebBrowsingOptional: false,
    isTemperatureOptional: true,
    isContextOptional: true,
    permissionLevel: MIN_LEVEL,
  },
  {
    name: 'Claude-2',
    value: 'claude-2',
    isWebBrowsingOptional: false,
    isTemperatureOptional: true,
    isContextOptional: true,
    permissionLevel: MIN_LEVEL,
  },
]

const redirects: IRedirectIModelType[] = [
  {
    value: 'gpt-web',
    redirectTo: 'gpt3',
  },
  {
    value: 'claude-2-web',
    redirectTo: 'claude-2',
  },
  {
    value: 'gpt3-fga',
    redirectTo: 'gpt3',
  },
  {
    value: 'gpt4-fga',
    redirectTo: 'gpt4',
  },
]


export async function GET() {
  return NextResponse.json({
    models,
    redirects,
  })
}