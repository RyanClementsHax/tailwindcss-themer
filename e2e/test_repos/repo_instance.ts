import path from 'node:path'
import fse from 'fs-extra'
import { spawn } from 'cross-spawn'
import { execa } from 'execa'
import pidTree from 'pidtree'

// based off of https://github.com/remix-run/remix/blob/6a9b8d6b836f05a47af9ca6e6f1f3898a2fba8ec/integration/helpers/create-fixture.ts

export interface RepoInstanceOptions {
  instanceDirPath: string
  repoDirPath: string
}

export interface CommandOptions {
  command: [string, readonly string[]]
  env?: Record<string, string>
}

export interface StartServerOptions {
  command: [string, ReadonlyArray<string>]
  env: Record<string, string>
  isServerStarted: (context: {
    stdout: string
    repoDirPath: string
  }) => IsServerStartedResult
}

export type IsServerStartedResult =
  | { started: true; url: string }
  | { started: false; continueWaiting: true }
  | { started: false; continueWaiting: false; reason: string }

export interface RepoInstance {
  readonly buildDirPath: string
  writeFile(fileName: string, data: string): Promise<{ filePath: string }>
  execute(options: CommandOptions): Promise<void>
  startServer(options: StartServerOptions): Promise<StartServerResult>
}

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

const instanceDirPathRegex = /^[a-zA-Z0-9_,\\/\-.]+$/

export async function defineRepoInstance(
  options: RepoInstanceOptions
): Promise<{ isAlreadyInitialized: boolean; instance: RepoInstance }> {
  if (!options.instanceDirPath.match(instanceDirPathRegex)) {
    throw new Error(
      `Could not run open instance of repo with instance directory path ${options.instanceDirPath} because it uses characters not safe for creating a directory name for temporary files. Please use file name safe characters (regex: ${instanceDirPathRegex})`
    )
  }
  let isAlreadyInitialized = false
  if (await fse.exists(options.instanceDirPath)) {
    isAlreadyInitialized = true
  } else {
    await fse.ensureDir(options.instanceDirPath)
  }
  return {
    isAlreadyInitialized,
    instance: new RepoInstanceImpl({
      instanceDirPath: options.instanceDirPath,
      repoDirPath: options.repoDirPath
    })
  }
}

class RepoInstanceImpl implements RepoInstance {
  constructor(private options: RepoInstanceOptions) {}

  async writeFile(fileName: string, data: string) {
    const filePath = path.join(this.options.instanceDirPath, fileName)
    await fse.writeFile(filePath, data)
    return { filePath }
  }

  get buildDirPath(): string {
    return path.join(this.options.instanceDirPath, 'build')
  }

  async execute({ command, env }: CommandOptions) {
    await execa(command[0], command[1], {
      cwd: this.options.repoDirPath,
      env
    })
  }

  async startServer(options: StartServerOptions) {
    return await new Promise<StartServerResult>((resolve, reject) => {
      const serveProcess = spawn(options.command[0], options.command[1], {
        env: {
          // make sure npm executable can be found on path
          PATH: process.env['PATH'],
          ...options.env
        },
        cwd: this.options.repoDirPath
      })
      const stop = async () => {
        if (!serveProcess.pid) return
        // just killing .kill() on the root process will only kill the shell process that spawned the command
        // you can check for stragging node processes after running e2e tests by running "ps -aef | grep node"
        for (const pid of await pidTree(serveProcess.pid)) {
          process.kill(pid)
        }
        serveProcess.kill()
      }
      const fullCommand = `${options.command[0]} ${options.command[1].join(
        ' '
      )}`
      let finishedMonitoring = false
      let stdout = ''
      const failTimeout = setTimeout(() => {
        resolve({
          started: false,
          reason: `Timed out waiting for server to start with ${fullCommand}\n\n${stdout}`
        })
      }, 20_000)
      serveProcess.stderr.pipe(process.stderr)
      serveProcess.stdout.on('data', (chunk: { toString(): string }) => {
        if (finishedMonitoring) return
        const newChunk = chunk.toString()
        stdout += newChunk
        try {
          const result = options.isServerStarted({
            stdout,
            repoDirPath: this.options.repoDirPath
          })
          finishedMonitoring = result.started
          if (result.started) {
            clearTimeout(failTimeout)
            resolve({
              started: result.started,
              url: result.url,
              stop
            })
          } else if (!result.continueWaiting) {
            clearTimeout(failTimeout)
            finishedMonitoring = true
            void stop().then(() =>
              resolve({
                started: result.started,
                reason: result.reason
              })
            )
          }
        } catch (e: unknown) {
          clearTimeout(failTimeout)
          finishedMonitoring = true
          void stop().then(() =>
            reject(e instanceof Error ? e : new Error(JSON.stringify(e)))
          )
        }
      })
    })
  }
}
