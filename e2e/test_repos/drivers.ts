import path from 'path'
import { MultiThemePluginOptions } from '@/utils/optionsUtils'
import { type Config as TailwindConfig } from 'tailwindcss'
import {
  CommandOptions,
  defineRepoInstance,
  StartServerOptions
} from './repo_instance'
import { getRepoDirPath, getRepoRootPath, parseClasses } from './utils'
import serialize from 'serialize-javascript'
import getPort from 'get-port'
import { ServerStarted, StartServerResult, StopServerCallback } from './types'

export interface OpenOptions {
  baseTailwindConfig?: { theme: TailwindConfig['theme'] }
  themerConfig: MultiThemePluginOptions
  instanceId: string
}

export interface Driver {
  open: (
    options: OpenOptions
  ) => Promise<{ url: string; stop: StopServerCallback }>
}

export const resolveDriver = async (repo: string): Promise<Driver> => {
  // TODO: centralize helpers?
  const repoDirPath = getRepoDirPath(repo)
  const driverPath = path.join(getRepoRootPath(repo), 'driver')
  try {
    const module = (await import(driverPath)) as unknown

    if (
      !module ||
      typeof module !== 'object' ||
      !('default' in module) ||
      !module.default ||
      typeof module.default !== 'object'
    ) {
      throw new Error(
        `Module ${driverPath} does not export a default driver options object`
      )
    }

    return new DriverImpl({
      ...(module.default as DriverOptions),
      repoDirPath
    })
  } catch (error) {
    console.error(`Failed to import or use driver for repo: ${repo}`, error)
    throw error // Fail the test if the driver fails to load
  }
}

export type { StopServerCallback }

export interface DriverOptions {
  repoDirPath: string
  getBuildCommandOptions: ({
    tailwindConfigFilePath,
    buildDirPath
  }: {
    tailwindConfigFilePath: string
    buildDirPath: string
  }) => CommandOptions
  getStartServerOptions: ({
    port,
    buildDir
  }: {
    port: number
    buildDir: string
  }) => StartServerOptions
}

// Quality of life helper to define driver options
export const defineDriver = <T extends Omit<DriverOptions, 'repoDirPath'>>(
  options: T
): T => options

class DriverImpl implements Driver {
  constructor(private driverOptions: DriverOptions) {}
  async open(openOptions: OpenOptions) {
    const { instance, isAlreadyInitialized } = await defineRepoInstance({
      repoDirPath: this.driverOptions.repoDirPath,
      tmpDirName: openOptions.instanceId
    })

    if (!isAlreadyInitialized) {
      const classesToPreventPurging = parseClasses(openOptions.themerConfig)

      const tailwindConfig: TailwindConfig = {
        content: ['./src/**/*.{js,jsx,ts,tsx}'],
        safelist: classesToPreventPurging,
        theme: openOptions.baseTailwindConfig?.theme ?? {
          extend: {}
        }
      }

      const { filePath: tailwindConfigFilePath } = await instance.writeFile(
        'tailwind.config.js',
        `module.exports = {
          ...${JSON.stringify(tailwindConfig)},
          plugins: [require('tailwindcss-themer')(${serialize(
            openOptions.themerConfig
          )})]
        }`
      )

      const buildCommandOptions = this.driverOptions.getBuildCommandOptions({
        tailwindConfigFilePath,
        buildDirPath: instance.buildDirPath
      })
      await instance.execute(buildCommandOptions)
    }

    const { url, stop } = await this.#startServerWithRetry({
      maxAttempts: 2,
      startServer: async () => {
        const port = await getPort()
        const startServerOptions = this.driverOptions.getStartServerOptions({
          port,
          buildDir: instance.buildDirPath
        })
        return await instance.startServer(startServerOptions)
      }
    })

    return {
      url,
      stop
    }
  }

  async #startServerWithRetry({
    maxAttempts,
    startServer
  }: {
    maxAttempts: number
    startServer: () => Promise<StartServerResult>
  }): Promise<ServerStarted> {
    let attemptNumber = 0
    let failedReason = 'unknown'
    while (attemptNumber <= maxAttempts) {
      attemptNumber++
      if (attemptNumber > 1) {
        console.log(
          `Retrying (attempt ${attemptNumber}) starting the server because: ${failedReason}`
        )
      }

      const result = await startServer()

      if (result.started) {
        return result
      } else {
        failedReason = result.reason
      }
    }
    throw new Error(
      `Attempted to start server ${attemptNumber} times but couldn't start the server\n\n${failedReason}`
    )
  }
}
