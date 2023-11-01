import serialize from 'serialize-javascript'
import getPort from 'get-port'
import { MultiThemePluginOptions } from '@/utils/optionsUtils'
import { createIsolatedIntTest, parseClasses } from '.'
import { type Config as TailwindConfig } from 'tailwindcss'

export interface OpenOptions {
  titlePath: string[]
}

export async function openWithConfig(
  config: MultiThemePluginOptions,
  options: OpenOptions
): Promise<{ url: string; stop: () => void }> {
  const tmpDirName = options.titlePath
    .map(x => x.replace(/ /g, '-').replace(/\./, '-'))
    .join('_')

  const { test, isAlreadyInitialized } = await createIsolatedIntTest({
    template: 'create-react-app',
    tmpDirName
  })

  const buildDir = test.getBuildDir()

  if (!isAlreadyInitialized) {
    const classesToPreventPurging = parseClasses(config)

    const tailwindConfig: TailwindConfig = {
      content: ['./src/**/*.{js,jsx,ts,tsx}'],
      safelist: classesToPreventPurging,
      theme: {
        extend: {}
      }
    }

    const { filePath: tailwindConfigFilePath } = await test.writeFile(
      'tailwind.test.config.js',
      `module.exports = {
        ...${JSON.stringify(tailwindConfig)},
        plugins: [require('tailwindcss-themer')(${serialize(config)})]
      }`
    )

    await test.build({
      command: ['npm', ['run', 'build']],
      env: {
        TAILWIND_CONFIG_PATH: tailwindConfigFilePath,
        BUILD_PATH: buildDir
      }
    })
  }

  const port = await getPort()
  const { stop } = await test.startServer({
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
          throw new Error(
            `Expected ${template} to start on port ${port}, but it started on port ${parsedPort}`
          )
        }

        return true
      }

      return false
    }
  })

  return {
    url: `http://localhost:${port}`,
    stop
  }
}
