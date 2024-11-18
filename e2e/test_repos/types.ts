import { MultiThemePluginOptions } from '@/utils/optionsUtils'
import { type Config as TailwindConfig } from 'tailwindcss'

// TODO: rename 'repo' to 'project' in all files
export interface IsolatedRepoInstance {
  writeFile(fileName: string, data: string): Promise<{ filePath: string }>
  getBuildDir(): string
  build(options: BuildOptions): Promise<void>
  startServer(options: StartServerOptions): Promise<StartServerResult>
}

export type StartServerResult = ServerStarted | ServerNotStarted

export interface ServerStarted {
  started: true
  url: string
  stop: StopServerCallback
}

export type StopServerCallback = () => Promise<void>

export interface ServerNotStarted {
  started: false
  reason: string
}

export interface BuildOptions {
  command: [string, ReadonlyArray<string>]
  env: Record<string, string>
}

export interface StartServerOptions {
  command: [string, ReadonlyArray<string>]
  env: Record<string, string>
  isServerStarted: (context: {
    stdout: string
    template: string
  }) => IsServerStartedResult
}

export type IsServerStartedResult =
  | { started: true; url: string }
  | { started: false; continueWaiting: true }
  | { started: false; continueWaiting: false; reason: string }

export interface IsolatedRepoInstanceOptions {
  tmpDirName: string
  template: string
}

export interface OpenOptions {
  template: string
  baseTailwindConfig?: { theme: TailwindConfig['theme'] }
  themerConfig: MultiThemePluginOptions
  instanceId: number
  titlePath: string[]
}

export interface Driver {
  open: (
    options: OpenOptions
  ) => Promise<{ url: string; stop: StopServerCallback }>
}
