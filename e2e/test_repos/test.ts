import fse from 'fs-extra'
import path from 'node:path'
import url from 'node:url'
import serialize from 'serialize-javascript'
import getPort from 'get-port'
import { spawn } from 'cross-spawn'
import { test as base } from '@playwright/test'
import { MultiThemePluginOptions } from '@/utils/optionsUtils'

// based off of https://github.com/remix-run/remix/blob/6a9b8d6b836f05a47af9ca6e6f1f3898a2fba8ec/integration/helpers/create-fixture.ts

// TODO: color output

const TMP_DIR = '.tmp'
const TEMPLATES_DIR = 'templates'
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

export interface TestRepo {
  openWithConfig(config: MultiThemePluginOptions): Promise<void>
}

export const test = base.extend<{ testRepo: TestRepo }>({
  testRepo: async ({ page }, use) => {
    let stop: (() => void) | undefined
    const testRepo: TestRepo = {
      async openWithConfig(config) {
        const { url, stop: _stop } = await openWithConfig(config)
        await page.goto(url)
        stop = _stop
      }
    }
    await use(testRepo)
    stop?.()
  }
})

async function openWithConfig(
  config: MultiThemePluginOptions
): Promise<{ url: string; stop: () => void }> {
  // 1. create tmp directory
  const template = 'create-react-app'
  const integrationTemplateDir = path.resolve(
    __dirname,
    TEMPLATES_DIR,
    template
  )
  // TODO: use test name
  const testDir = `tt-${template}-${Math.random().toString(32).slice(2)}`
  const testTmpDirPath = path.join(integrationTemplateDir, TMP_DIR, testDir)
  await fse.ensureDir(testTmpDirPath)

  // 2. write configs to file
  const tailwindConfigPath = path.join(
    testTmpDirPath,
    'tailwind.base.config.js'
  )
  await fse.writeFile(
    tailwindConfigPath,
    `module.exports = ${JSON.stringify({
      content: ['./src/**/*.{js,jsx,ts,tsx}'],
      theme: {
        extend: {}
      }
    })}`
  )
  const themerConfigPath = path.join(testTmpDirPath, 'themer.config.js')
  await fse.writeFile(themerConfigPath, `module.exports = ${serialize(config)}`)

  // 3. pick port
  const port = await getPort()

  // 4. start server
  const { stop } = await new Promise<{ stop: () => void }>(
    (resolve, reject) => {
      const serveProcess = spawn('npm', ['run', 'start'], {
        env: {
          PATH: process.env['PATH'],
          PORT: port.toFixed(0),
          TAILWIND_CONFIG_PATH: tailwindConfigPath,
          THEMER_CONFIG_PATH: themerConfigPath,
          BROWSER: 'none'
        },
        cwd: integrationTemplateDir
      })
      // Wait for `started at http://localhost:${port}` to be printed
      // and extract the port from it.
      let started = false
      let stdout = ''
      const rejectTimeout = setTimeout(() => {
        reject(new Error('Timed out waiting for npm run start to start'))
      }, 20000)
      serveProcess.stderr.pipe(process.stderr)
      // 5. wait for port log
      serveProcess.stdout.on('data', chunk => {
        if (started) return
        const newChunk = chunk.toString()
        stdout += newChunk
        console.log(newChunk)
        const match: RegExpMatchArray | null = stdout.match(
          /Local:\s+http:\/\/localhost:(\d+)\s/
        )
        if (match) {
          clearTimeout(rejectTimeout)
          started = true
          const parsedPort = parseInt(match[1], 10)

          if (port !== parsedPort) {
            reject(
              new Error(
                `Expected ${template} to start on port ${port}, but it started on port ${parsedPort}`
              )
            )
            return
          }

          resolve({
            stop: () => {
              serveProcess.kill()
            }
          })
        }
      })
    }
  )

  // 6. return url and stop function
  return {
    url: `http://localhost:${port}`,
    stop
  }
}
