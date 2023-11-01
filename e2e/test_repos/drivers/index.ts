import url from 'node:url'
import path from 'node:path'
import fse from 'fs-extra'
import { spawn } from 'cross-spawn'
import { $, execa } from 'execa'
import { MultiThemePluginOptions } from '@/utils/optionsUtils'

// based off of https://github.com/remix-run/remix/blob/6a9b8d6b836f05a47af9ca6e6f1f3898a2fba8ec/integration/helpers/create-fixture.ts

export type Template = 'create-react-app'

export interface IsolatedIntTest {
  writeFile(fileName: string, data: string): Promise<{ filePath: string }>
  getBuildDir(): string
  build(options: BuildOptions): Promise<void>
  startServer(options: StartServerOptions): Promise<{ stop: () => void }>
}

export interface BuildOptions {
  command: [string, ReadonlyArray<string>]
  env: Record<string, string>
}

export interface StartServerOptions {
  command: [string, ReadonlyArray<string>]
  env: Record<string, string>
  isServerStarted: (context: { stdout: string; template: Template }) => boolean
}

export interface IsolatedIntTestOptions {
  tmpDirName: string
  template: Template
}

const tmpDirNameRegex = /^[a-zA-Z_\-.]+$/

export async function createIsolatedIntTest(
  options: IsolatedIntTestOptions
): Promise<{ isAlreadyInitialized: boolean; test: IsolatedIntTest }> {
  if (!options.tmpDirName.match(tmpDirNameRegex)) {
    throw new Error(
      `Could not run open test repo with tmp dir name ${options.tmpDirName} because it uses characters not safe for creating a directory name for temporary files. Please use file name safe characters (regex: ${tmpDirNameRegex})`
    )
  }
  const templateDirPath = getTemplateDirPath(options.template)
  const testTmpDirPath = getTestTmpDirPath(options.template, options.tmpDirName)
  let isAlreadyInitialized = false
  if (await fse.exists(testTmpDirPath)) {
    isAlreadyInitialized = true
  } else {
    await fse.ensureDir(testTmpDirPath)
  }
  return {
    isAlreadyInitialized,
    test: new IsolatedIntTestImpl({
      template: options.template,
      testTmpDirPath,
      templateDirPath
    })
  }
}

export async function setupTemplates(): Promise<void> {
  const templateDirPaths = getTemplateDirPaths()
  for (const templateDirPath of templateDirPaths) {
    const nodeModulesPath = path.join(templateDirPath, 'node_modules')
    if (!(await fse.exists(nodeModulesPath))) {
      await $({ cwd: templateDirPath })`npm install`
    }
  }
}

export async function cleanupTmpDirs(): Promise<void> {
  for (const tmpDir of getTemplateTmpDirPaths()) {
    await fse.rm(tmpDir, { recursive: true, force: true })
  }
}

interface IsolatedIntTestConfig {
  template: Template
  testTmpDirPath: string
  templateDirPath: string
}

class IsolatedIntTestImpl implements IsolatedIntTest {
  constructor(private config: IsolatedIntTestConfig) {}

  async writeFile(fileName: string, data: string) {
    const filePath = path.join(this.config.testTmpDirPath, fileName)
    await fse.writeFile(filePath, data)
    return { filePath }
  }

  getBuildDir(): string {
    return path.join(this.config.testTmpDirPath, 'build')
  }

  async build({ command, env }: BuildOptions) {
    await execa(command[0], command[1], {
      cwd: this.config.templateDirPath,
      env
    })
  }

  async startServer(options: StartServerOptions) {
    return await new Promise<{ stop: () => void }>((resolve, reject) => {
      const serveProcess = spawn(options.command[0], options.command[1], {
        env: {
          // make sure npm executable can be found on path
          PATH: process.env['PATH'],
          ...options.env
        },
        cwd: this.config.templateDirPath
      })
      const stop = () => serveProcess.kill()
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
            template: this.config.template
          })
          if (started) {
            clearTimeout(rejectTimeout)
            started = true
            resolve({
              stop
            })
          }
        } catch (e: unknown) {
          clearTimeout(rejectTimeout)
          started = true
          stop()
          reject(e)
        }
      })
    })
  }
}

const TMP_DIR = '.tmp'
const TEMPLATES_DIR = 'templates'
const testReposDirPath = url.fileURLToPath(new URL('..', import.meta.url))

function getTemplates(): Template[] {
  // Using typescript to force exhaustiveness
  return Object.keys({
    'create-react-app': true
  } satisfies Record<Template, boolean>) as Template[]
}

function getTemplateDirPath(template: Template) {
  return path.resolve(testReposDirPath, TEMPLATES_DIR, template)
}

function getTemplateTmpDirPath(template: Template) {
  const templateDirPath = getTemplateDirPath(template)
  return path.join(templateDirPath, TMP_DIR)
}

function getTestTmpDirPath(template: Template, tmpDirName: string) {
  const templateDirPath = getTemplateTmpDirPath(template)
  return path.join(templateDirPath, tmpDirName)
}

function getTemplateDirPaths(): string[] {
  return getTemplates().map(template => getTemplateDirPath(template))
}

function getTemplateTmpDirPaths(): string[] {
  return getTemplates().map(template => getTemplateTmpDirPath(template))
}

export function parseClasses(config: MultiThemePluginOptions): string[] {
  const themeNameClasses = config.themes?.map(x => x.name) ?? []
  const mediaQueries =
    config.themes?.map(x => x.mediaQuery ?? '')?.filter(x => !!x) ?? []
  const selectors = config.themes?.flatMap(x => x.selectors ?? []) ?? []
  return [...themeNameClasses, ...mediaQueries, ...selectors]
}
