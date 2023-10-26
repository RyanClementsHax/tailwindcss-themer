import { test as base } from '@playwright/test'
import { MultiThemePluginOptions } from '@/utils/optionsUtils'
import { openWithConfig } from './repos/create-react-app'

export interface TestRepo {
  openWithConfig(config: MultiThemePluginOptions): Promise<void>
  setClassOnRoot(className: string): Promise<void>
  removeClassOnRoot(className: string): Promise<void>
  setAttributeOnRoot(key: string, value: string): Promise<void>
}

export const test = base.extend<{ testRepo: TestRepo }>({
  testRepo: async ({ page }, use, testInfo) => {
    let stop: (() => void) | undefined
    const attributesInputLocator = page.getByRole('textbox', {
      name: /attributes/i
    })
    const attributes = {
      async get(): Promise<Record<string, string>> {
        return JSON.parse(await attributesInputLocator.inputValue())
      },
      async patch(updates: Record<string, string>): Promise<void> {
        const attributes = await this.get()
        await attributesInputLocator.fill(
          JSON.stringify({
            ...attributes,
            ...updates
          })
        )
      }
    }

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
      async setClassOnRoot(newClass) {
        const { className } = await attributes.get()
        const classes = (className ?? '').split(' ')
        if (!classes.includes(newClass)) {
          await this.setAttributeOnRoot(
            'className',
            [...classes, newClass].join(' ').trim()
          )
        }
      },
      async removeClassOnRoot(classToRemove) {
        const { className } = await attributes.get()
        const classes = (className ?? '').split(' ')
        if (classes.includes(classToRemove)) {
          await this.setAttributeOnRoot(
            'className',
            classes
              .filter(x => x !== classToRemove)
              .join(' ')
              .trim()
          )
        }
      },
      async setAttributeOnRoot(key, value) {
        await attributes.patch({
          [key]: value
        })
      }
    }
    await use(testRepo)
    stop?.()
  }
})
