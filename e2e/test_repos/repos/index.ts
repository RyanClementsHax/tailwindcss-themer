import url from 'node:url'
import path from 'node:path'
import fse from 'fs-extra'
import { spawn } from 'cross-spawn'

// based off of https://github.com/remix-run/remix/blob/6a9b8d6b836f05a47af9ca6e6f1f3898a2fba8ec/integration/helpers/create-fixture.ts

// TODO: color output

const TMP_DIR = '.tmp'
const TEMPLATES_DIR = 'templates'
const testReposDirPath = url.fileURLToPath(new URL('..', import.meta.url))

export type Template = 'create-react-app'

export interface Repo {
  writeFile(fileName: string, data: string): Promise<{ filePath: string }>
  startServer(options: StartServerOptions): Promise<{ stop: () => void }>
}

export interface StartServerOptions {
  command: [string, ReadonlyArray<string>]
  env: Record<string, string>
  isServerStarted: (context: {
    stdout: string
    template: Template
    options: StartServerOptions & { fullCommand: string }
  }) => boolean
}

export interface CreateRepoOptions {
  tmpDirName: string
  template: Template
}

export async function createRepo(options: CreateRepoOptions): Promise<Repo> {
  if (!options.tmpDirName.match(/^[a-zA-Z_\-.]+$/)) {
    throw new Error(
      `Could not run open test repo with tmp dir name ${options.tmpDirName} because it uses characters not safe for creating a directory name for temporary files. Please use file name safe characters`
    )
  }
  const integrationTemplateDirPath = path.resolve(
    testReposDirPath,
    TEMPLATES_DIR,
    options.template
  )
  const testTmpDirPath = path.join(
    integrationTemplateDirPath,
    TMP_DIR,
    options.tmpDirName
  )
  if (await fse.exists(testTmpDirPath)) {
    throw new Error(
      `Was given duplicate tmp dir directory name "${testTmpDirPath}". This would have led to test state bleeding between tests. Please make sure your test title is unique (includes test group names).`
    )
  }
  await fse.ensureDir(testTmpDirPath)
  return new RepoImpl({
    template: options.template,
    testTmpDirPath,
    integrationTemplateDirPath
  })
}

interface RepoConfig {
  template: Template
  testTmpDirPath: string
  integrationTemplateDirPath: string
}

class RepoImpl implements Repo {
  constructor(private config: RepoConfig) {}

  async writeFile(fileName: string, data: string) {
    const filePath = path.join(this.config.testTmpDirPath, fileName)
    await fse.writeFile(filePath, data)
    return { filePath }
  }

  async startServer(options: StartServerOptions) {
    return await new Promise<{ stop: () => void }>((resolve, reject) => {
      const serveProcess = spawn(options.command[0], options.command[1], {
        env: {
          PATH: process.env['PATH'],
          ...options.env
        },
        cwd: this.config.integrationTemplateDirPath
      })
      const fullCommand = `${options.command[0]} ${options.command[1].join(
        ' '
      )}`
      let started = false
      let stdout = ''
      const rejectTimeout = setTimeout(() => {
        reject(
          new Error(
            `Timed out waiting for server to start with ${fullCommand}\n\n${stdout}`
          )
        )
      }, 20_000)
      serveProcess.stderr.pipe(process.stderr)
      serveProcess.stdout.on('data', chunk => {
        if (started) return
        const newChunk = chunk.toString()
        stdout += newChunk
        try {
          started = options.isServerStarted({
            stdout,
            template: this.config.template,
            options: {
              ...options,
              fullCommand
            }
          })
          if (started) {
            clearTimeout(rejectTimeout)
            started = true
            resolve({
              stop: () => serveProcess.kill()
            })
          }
        } catch (e: unknown) {
          clearTimeout(rejectTimeout)
          started = true
          reject(e)
        }
      })
    })
  }
}
