import url from 'node:url'
import path from 'node:path'
import fse from 'fs-extra'
import { spawn } from 'cross-spawn'
import { execa } from 'execa'
import { MultiThemePluginOptions } from '@/utils/optionsUtils'
import pidTree from 'pidtree'
import type {
  IsolatedRepoInstance,
  IsolatedRepoInstanceOptions,
  BuildOptions,
  StartServerOptions,
  StartServerResult
} from './types'

// based off of https://github.com/remix-run/remix/blob/6a9b8d6b836f05a47af9ca6e6f1f3898a2fba8ec/integration/helpers/create-fixture.ts

const tmpDirNameRegex = /^[a-zA-Z0-9_,\-.]+$/

export async function createIsolatedRepoInstance(
  options: IsolatedRepoInstanceOptions
): Promise<{ isAlreadyInitialized: boolean; instance: IsolatedRepoInstance }> {
  if (!options.tmpDirName.match(tmpDirNameRegex)) {
    throw new Error(
      `Could not run open instance of repo with tmp dir name ${options.tmpDirName} because it uses characters not safe for creating a directory name for temporary files. Please use file name safe characters (regex: ${tmpDirNameRegex})`
    )
  }
  const templateDirPath = getTemplateDirPath(options.template)
  const tmpDirPath = getTmpDirPath(options.template, options.tmpDirName)
  let isAlreadyInitialized = false
  if (await fse.exists(tmpDirPath)) {
    isAlreadyInitialized = true
  } else {
    await fse.ensureDir(tmpDirPath)
  }
  return {
    isAlreadyInitialized,
    instance: new IsolatedRepoInstanceImpl({
      template: options.template,
      tmpDirPath,
      templateDirPath
    })
  }
}

interface IsolatedRepoInstanceConfig {
  template: string
  tmpDirPath: string
  templateDirPath: string
}

class IsolatedRepoInstanceImpl implements IsolatedRepoInstance {
  constructor(private config: IsolatedRepoInstanceConfig) {}

  async writeFile(fileName: string, data: string) {
    const filePath = path.join(this.config.tmpDirPath, fileName)
    await fse.writeFile(filePath, data)
    return { filePath }
  }

  getBuildDir(): string {
    return path.join(this.config.tmpDirPath, 'build')
  }

  async build({ command, env }: BuildOptions) {
    await execa(command[0], command[1], {
      cwd: this.config.templateDirPath,
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
        cwd: this.config.templateDirPath
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
            template: this.config.template
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

const TMP_DIR = '.tmp'
const TEMPLATES_DIR = 'templates'
const reposDirPath = url.fileURLToPath(new URL('.', import.meta.url))

export function getTemplateDirPath(template: string) {
  return path.resolve(reposDirPath, TEMPLATES_DIR, template, 'repo')
}

export function getTemplateTmpDirPath(template: string) {
  const templateDirPath = getTemplateDirPath(template)
  return path.join(templateDirPath, TMP_DIR)
}

function getTmpDirPath(template: string, tmpDirName: string) {
  const templateDirPath = getTemplateTmpDirPath(template)
  return path.join(templateDirPath, tmpDirName)
}

export function parseClasses(config: MultiThemePluginOptions): string[] {
  const themeNameClasses = [
    'defaultTheme',
    ...(config.themes?.map(x => x.name) ?? [])
  ]
  const preloadedVariantStyles = themeNameClasses.flatMap(themeName =>
    stylesToKeep.map(style => `${themeName}:${style}`)
  )
  const mediaQueries =
    config.themes?.map(x => x.mediaQuery ?? '')?.filter(x => !!x) ?? []
  const selectors = config.themes?.flatMap(x => x.selectors ?? []) ?? []
  return [
    ...themeNameClasses,
    ...preloadedVariantStyles,
    ...mediaQueries,
    ...selectors,
    ...stylesToKeep
  ]
}

// Preventing purging of these styles makes writing tests with arbitrary classes
// easier since otherwise they'd have to define the styles they use when opening
// the repo instance
const stylesToKeep = [
  'bg-primary',
  'bg-primary/75',
  'bg-primary-DEFAULT-500',
  'font-title',
  'text-textColor',
  'text-textColor/50'
]
