import { test as base } from '@playwright/test'
import { MultiThemePluginOptions } from '@/utils/optionsUtils'
import { openWithConfig } from './repos/create-react-app'

export interface TestRepo {
  openWithConfig(config: MultiThemePluginOptions): Promise<void>
  setThemeAsClass(theme: string): Promise<void>
}

export const test = base.extend<{ testRepo: TestRepo }>({
  testRepo: async ({ page }, use, testInfo) => {
    let stop: (() => void) | undefined
    const testRepo: TestRepo = {
      async openWithConfig(config) {
        if (stop) {
          throw new Error('Only one repo should be opened per test fixture')
        }
        const { url, stop: _stop } = await openWithConfig(config, {
          projectName: testInfo.project.name,
          titlePath: testInfo.titlePath
        })
        await page.goto(url)
        stop = _stop
      },
      async setThemeAsClass(theme) {
        await page.getByRole('textbox', { name: /theme/i }).fill(theme)
      }
    }
    await use(testRepo)
    stop?.()
  }
})
