import serialize from 'serialize-javascript'
import getPort from 'get-port'
import { MultiThemePluginOptions } from '@/utils/optionsUtils'
import {
  ServerStarted,
  StartServerResult,
  StopServerCallback,
  createIsolatedRepoInstance,
  parseClasses
} from '.'
import { type Config as TailwindConfig } from 'tailwindcss'

export interface OpenOptions {
  instanceId: number
  titlePath: string[]
}

export async function openWithConfig(
  config: MultiThemePluginOptions,
  options: OpenOptions
): Promise<{ url: string; stop: StopServerCallback }> {
  const tmpDirName = [
    ...options.titlePath.map(x => x.replace(/ /g, '_')),
    options.instanceId
  ].join('-')

  const { instance, isAlreadyInitialized } = await createIsolatedRepoInstance({
    template: 'create-react-app',
    tmpDirName
  })

  const buildDir = instance.getBuildDir()

  if (!isAlreadyInitialized) {
    const classesToPreventPurging = parseClasses(config)

    const tailwindConfig: TailwindConfig = {
      content: ['./src/**/*.{js,jsx,ts,tsx}'],
      safelist: classesToPreventPurging,
      theme: {
        extend: {}
      }
    }

    const { filePath: tailwindConfigFilePath } = await instance.writeFile(
      'tailwind.config.js',
      `module.exports = {
        ...${JSON.stringify(tailwindConfig)},
        plugins: [require('tailwindcss-themer')(${serialize(config)})]
      }`
    )

    await instance.build({
      command: ['npm', ['run', 'build']],
      env: {
        TAILWIND_CONFIG_PATH: tailwindConfigFilePath,
        BUILD_PATH: buildDir
      }
    })
  }

  const { url, stop } = await startServerWithRetry({
    maxAttempts: 2,
    async startServer() {
      const port = await getPort()
      return await instance.startServer({
        command: ['npm', ['run', 'serve', '--', buildDir]],
        env: {
          PORT: port.toFixed(0)
        },
        isServerStarted: ({ stdout, template }) => {
          const startupLogMatch: RegExpMatchArray | null = stdout.match(
            /Accepting connections at\s+http:\/\/localhost:(\d+)\s/
          )
          if (startupLogMatch) {
            const parsedPort = parseInt(startupLogMatch[1], 10)

            if (port !== parsedPort) {
              return {
                started: false,
                continueWaiting: false,
                reason: `Expected ${template} to start on port ${port}, but it started on port ${parsedPort}`
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
      // eslint-disable-next-line no-console
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
