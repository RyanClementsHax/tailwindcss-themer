import serialize from 'serialize-javascript'
import getPort from 'get-port'
import type {
  ServerStarted,
  StartServerResult,
  StopServerCallback,
  OpenOptions
} from '../../types'
import { createIsolatedRepoInstance, parseClasses } from '../../utils'
import { type Config as TailwindConfig } from 'tailwindcss'

export async function open(
  options: OpenOptions
): Promise<{ url: string; stop: StopServerCallback }> {
  const tmpDirName = [
    ...options.titlePath.map(x => x.replace(/ /g, '_')),
    options.instanceId
  ].join('-')

  const { instance, isAlreadyInitialized } = await createIsolatedRepoInstance({
    repo: options.repo,
    tmpDirName
  })

  const buildDir = instance.getBuildDir()

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
