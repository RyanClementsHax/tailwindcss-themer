import { Page, test as base } from '@playwright/test'
import { MultiThemePluginOptions } from '@/utils/optionsUtils'
import { openWithConfig } from './drivers/create-react-app'
import { StopServerCallback } from './drivers'

export interface TestRepo {
  openWithConfig(config: MultiThemePluginOptions): Promise<ThemeNode>
  createNode(): Promise<ThemeNode>
}

export interface ThemeNode {
  setClasses(classNames: string[]): Promise<void>
  setClass(className: string): Promise<void>
  removeClass(className: string): Promise<void>
  setAttribute(key: string, value: string): Promise<void>
}

export const test = base.extend<{ testRepo: TestRepo }>({
  testRepo: async ({ page }, use, testInfo) => {
    const stopCallbacks: StopServerCallback[] = []

    const testRepo: TestRepo = {
      async openWithConfig(config) {
        const { url, stop: _stop } = await openWithConfig(config, {
          instanceId: stopCallbacks.length + 1,
          titlePath: testInfo.titlePath
        })
        stopCallbacks.push(_stop)
        await page.goto(url)
        return this.createNode()
      },
      async createNode() {
        await page.getByRole('button', { name: /add theme node/i }).click()
        const nodes = await page.getByTestId(/theme-node-\d/).all()
        return new ThemeNodeImpl(nodes.length, page)
      }
    }

    await use(testRepo)

    await Promise.all(stopCallbacks.map(x => x()))
  }
})

class ThemeNodeImpl implements ThemeNode {
  constructor(
    private readonly nodeId: number,
    private readonly page: Page
  ) {}

  async setClasses(newClasses: string[]) {
    const { className } = await this.#attributes.get()
    const classes = (className ?? '').split(' ')
    const classesToAdd = newClasses.filter(x => !classes.includes(x))
    if (classesToAdd.length) {
      await this.setAttribute(
        'className',
        [...classes, ...classesToAdd].join(' ').trim()
      )
    }
  }

  async setClass(newClass: string) {
    await this.setClasses([newClass])
  }

  async removeClass(classToRemove: string) {
    const { className } = await this.#attributes.get()
    const classes = (className ?? '').split(' ')
    if (classes.includes(classToRemove)) {
      await this.setAttribute(
        'className',
        classes
          .filter(x => x !== classToRemove)
          .join(' ')
          .trim()
      )
    }
  }

  async setAttribute(key: string, value: string) {
    await this.#attributes.patch({
      [key]: value
    })
  }

  get #attributesInputLocator() {
    return this.page
      .getByTestId(new RegExp(`^theme-node-${this.nodeId}$`))
      .getByRole('textbox', {
        name: /attributes/i
      })
  }

  get #attributes() {
    const attributesInputLocator = this.#attributesInputLocator
    return {
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
  }
}
