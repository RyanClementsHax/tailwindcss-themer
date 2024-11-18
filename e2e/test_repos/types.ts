export type StartServerResult = ServerStarted | ServerNotStarted

export type StopServerCallback = () => Promise<void>

export interface ServerStarted {
  started: true
  url: string
  stop: StopServerCallback
}

export interface ServerNotStarted {
  started: false
  reason: string
}
