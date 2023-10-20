import { test as base } from '@playwright/test'
import { MultiThemePluginOptions } from '@/utils/optionsUtils'
import { openWithConfig } from './repos/create-react-app'

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
