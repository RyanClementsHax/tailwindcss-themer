import { test as base } from '@playwright/test'
import { MultiThemePluginOptions } from '@/utils/optionsUtils'
import { openWithConfig } from './repos/create-react-app'

export interface TestRepo {
  openWithConfig(config: MultiThemePluginOptions): Promise<void>
}

export const test = base.extend<{ testRepo: TestRepo }>({
  testRepo: async ({ page }, use, testInfo) => {
    let stop: (() => void) | undefined
    const testRepo: TestRepo = {
      async openWithConfig(config) {
        if (stop) {
          throw new Error('Only one repo should be opened per test fixture')
        }
        const tmpDirName = [
          ...testInfo.titlePath.map(x =>
            x.replace(/ /g, '-').replace(/\./, '-')
          ),
          testInfo.project.name
        ].join('_')
        const { url, stop: _stop } = await openWithConfig(tmpDirName, config)
        await page.goto(url)
        stop = _stop
      }
    }
    await use(testRepo)
    stop?.()
  }
})
