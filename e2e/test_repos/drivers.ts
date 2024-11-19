import path from 'path'
import fse from 'fs-extra'
import { execa } from 'execa'
import { MultiThemePluginOptions } from '@/utils/optionsUtils'
import { type Config as TailwindConfig } from 'tailwindcss'
import {
  CommandOptions,
  defineRepoInstance,
  StartServerOptions,
  ServerStarted,
  StartServerResult,
  StopServerCallback
} from './repo_instance'
import serialize from 'serialize-javascript'
import getPort from 'get-port'
import { getRepoPaths, RepoPaths } from './paths'

export interface OpenOptions {
  baseTailwindConfig?: { theme: TailwindConfig['theme'] }
  themerConfig: MultiThemePluginOptions
  instanceId: string
}

export interface Driver {
  install: () => Promise<void>
  cleanup: () => Promise<void>
  open: (
    options: OpenOptions
  ) => Promise<{ url: string; stop: StopServerCallback }>
}

export const resolveDriver = async (repo: string): Promise<Driver> => {
  const repoPaths = getRepoPaths(repo)
  try {
    const module = (await import(repoPaths.driverFilePath)) as unknown

    if (
      !module ||
      typeof module !== 'object' ||
      !('default' in module) ||
      !module.default ||
      typeof module.default !== 'object'
    ) {
      throw new Error(
        `Module ${repoPaths.driverFilePath} does not export a default driver options object`
      )
    }

    return new DriverImpl({
      ...(module.default as DriverOptions),
      repoPaths
    })
  } catch (error) {
    console.error(`Failed to import or use driver for repo: ${repo}`, error)
    throw error // Fail the test if the driver fails to load
  }
}

export type { StopServerCallback }

export interface DriverOptions {
  repoPaths: RepoPaths
  installCommand: CommandOptions
  getBuildCommand: ({
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
export const defineDriver = <T extends Omit<DriverOptions, 'repoPaths'>>(
  options: T
): T => options

class DriverImpl implements Driver {
  constructor(private driverOptions: DriverOptions) {}
  async install() {
    const nodeModulesPath = path.join(
      this.driverOptions.repoPaths.repoDirPath,
      'node_modules'
    )
    if (!(await fse.exists(nodeModulesPath))) {
      await execa(
        this.driverOptions.installCommand.command[0],
        this.driverOptions.installCommand.command[1],
        {
          cwd: this.driverOptions.repoPaths.repoDirPath,
          env: this.driverOptions.installCommand.env
        }
      )
    }
  }
  async cleanup() {
    await fse.rm(this.driverOptions.repoPaths.tmpDirPath, {
      recursive: true,
      force: true
    })
  }
  async open(openOptions: OpenOptions) {
    const { instance, isAlreadyInitialized } = await defineRepoInstance({
      repoDirPath: this.driverOptions.repoPaths.repoDirPath,
      instanceDirPath: path.join(
        this.driverOptions.repoPaths.tmpDirPath,
        openOptions.instanceId
      )
    })

    if (!isAlreadyInitialized) {
      const classesToPreventPurging = this.#parseClasses(
        openOptions.themerConfig
      )

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

      const buildCommandOptions = this.driverOptions.getBuildCommand({
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

  #parseClasses(config: MultiThemePluginOptions): string[] {
    const themeNameClasses = [
      'defaultTheme',
      ...(config.themes?.map(x => x.name) ?? [])
    ]
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
}
