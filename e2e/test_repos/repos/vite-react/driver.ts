import serialize from 'serialize-javascript'
import getPort from 'get-port'
import type { StopServerCallback, OpenOptions } from '../../types'
import {
  defineIsolatedRepoInstance,
  parseClasses,
  startServerWithRetry
} from '../../utils'
import { type Config as TailwindConfig } from 'tailwindcss'

export default {
  async open(
    options: OpenOptions
  ): Promise<{ url: string; stop: StopServerCallback }> {
    const tmpDirName = [
      ...options.titlePath.map(x => x.replace(/ /g, '_')),
      options.instanceId
    ].join('-')

    const { instance, isAlreadyInitialized } = await defineIsolatedRepoInstance(
      {
        repo: options.repo,
        tmpDirName
      }
    )

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
}
