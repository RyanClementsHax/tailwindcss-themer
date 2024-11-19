import { defineDriver } from '../../drivers'

export default defineDriver({
  installCommand: {
    command: ['npm', ['install']]
  },
  getBuildCommand: ({ tailwindConfigFilePath, buildDirPath }) => ({
    command: ['npm', ['run', 'build']],
    env: {
      TAILWIND_CONFIG_PATH: tailwindConfigFilePath,
      BUILD_PATH: buildDirPath
    }
  }),
  getStartServerOptions: ({ port, buildDir }) => ({
    command: ['npm', ['run', 'serve', '--', buildDir]],
    env: {
      PORT: port.toFixed(0)
    },
    isServerStarted: ({ stdout, repoDirPath }) => {
      const startupLogMatch: RegExpMatchArray | null = stdout.match(
        /Accepting connections at\s+http:\/\/localhost:(\d+)\s/
      )
      if (startupLogMatch) {
        const parsedPort = parseInt(startupLogMatch[1], 10)

        if (port !== parsedPort) {
          return {
            started: false,
            continueWaiting: false,
            reason: `Expected ${repoDirPath} to start on port ${port}, but it started on port ${parsedPort}`
          }
        }

        return { started: true, url: `http://localhost:${port}` }
      }

      return { started: false, continueWaiting: true }
    }
  })
})
