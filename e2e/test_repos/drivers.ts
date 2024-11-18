import path from 'path'
import { fileURLToPath } from 'url'
import { MultiThemePluginOptions } from '@/utils/optionsUtils'
import { type Config as TailwindConfig } from 'tailwindcss'
import { defineRepoInstance } from './repo_instance'
import { parseClasses } from './utils'
import serialize from 'serialize-javascript'
import getPort from 'get-port'
import { ServerStarted, StartServerResult, StopServerCallback } from './types'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export interface OpenOptions {
  repo: string
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

export const resolveDriver = async (repo: string): Promise<Driver> => {
  const driverPath = path.join(__dirname, 'repos', repo, 'driver')
  try {
    const module = (await import(driverPath)) as unknown

    if (
      !module ||
      typeof module !== 'object' ||
      !('default' in module) ||
      !module.default ||
      typeof module.default !== 'object' ||
      !('open' in module.default) ||
      typeof module.default.open !== 'function'
    ) {
      throw new Error(
        `Module ${driverPath} does not export a default value with method named 'open'`
      )
    }

    return module.default as Driver
  } catch (error) {
    console.error(`Failed to import or use driver for repo: ${repo}`, error)
    throw error // Fail the test if the driver fails to load
  }
}

export const defineDriver = (): Driver => {
  return {
    async open(options) {
      const tmpDirName = [
        ...options.titlePath.map(x => x.replace(/ /g, '_')),
        options.instanceId
      ].join('-')

      const { instance, isAlreadyInitialized } = await defineRepoInstance({
        repo: options.repo,
        tmpDirName
      })

      if (!isAlreadyInitialized) {
        const classesToPreventPurging = parseClasses(options.themerConfig)

        const tailwindConfig: TailwindConfig = {
          content: ['./src/**/*.{js,jsx,ts,tsx}'],
          safelist: classesToPreventPurging,
          theme: options.baseTailwindConfig?.theme ?? {
            extend: {}
          }
        }

        const { filePath: tailwindConfigFilePath } = await instance.writeFile(
          'tailwind.config.js',
          `module.exports = {
            ...${JSON.stringify(tailwindConfig)},
            plugins: [require('tailwindcss-themer')(${serialize(
              options.themerConfig
            )})]
          }`
        )

        await instance.build({
          command: ['npm', ['run', 'build']],
          env: {
            TAILWIND_CONFIG_PATH: tailwindConfigFilePath,
            BUILD_PATH: instance.buildDir
          }
        })
      }

      const { url, stop } = await startServerWithRetry({
        maxAttempts: 2,
        async startServer() {
          const port = await getPort()
          return await instance.startServer({
            command: ['npm', ['run', 'serve', '--', instance.buildDir]],
            env: {
              PORT: port.toFixed(0)
            },
            isServerStarted: ({ stdout, repo }) => {
              const startupLogMatch: RegExpMatchArray | null = stdout.match(
                /Accepting connections at\s+http:\/\/localhost:(\d+)\s/
              )
              if (startupLogMatch) {
                const parsedPort = parseInt(startupLogMatch[1], 10)

                if (port !== parsedPort) {
                  return {
                    started: false,
                    continueWaiting: false,
                    reason: `Expected ${repo} to start on port ${port}, but it started on port ${parsedPort}`
                  }
                }

                return { started: true, url: `http://localhost:${port}` }
              }

              return { started: false, continueWaiting: true }
            }
          })
        }
      })

      return {
        url,
        stop
      }
    }
  }
}

export type { StopServerCallback }

async function startServerWithRetry({
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
