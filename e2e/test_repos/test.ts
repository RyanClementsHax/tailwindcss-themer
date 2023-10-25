import { test as base } from '@playwright/test'
import { MultiThemePluginOptions } from '@/utils/optionsUtils'
import { openWithConfig } from './repos/create-react-app'

export interface TestRepo {
  openWithConfig(config: MultiThemePluginOptions): Promise<void>
  setClassOnRoot(theme: string): Promise<void>
  setAttributeOnRoot(key: string, value: string): Promise<void>
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
        stop = _stop
        await page.goto(url)
      },
      async setClassOnRoot(theme) {
        await this.setAttributeOnRoot('className', theme)
      },
      async setAttributeOnRoot(key, value) {
        const attributesInputLocator = page.getByRole('textbox', {
          name: /attributes/i
        })
        const attributes = JSON.parse(await attributesInputLocator.inputValue())
        await attributesInputLocator.fill(
          JSON.stringify({
            ...attributes,
            [key]: value
          })
        )
      }
    }
    await use(testRepo)
    stop?.()
  }
})
