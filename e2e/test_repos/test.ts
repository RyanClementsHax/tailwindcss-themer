import { Page, test as base } from '@playwright/test'
import { MultiThemePluginOptions } from '@/utils/optionsUtils'
import { openWithConfig } from './drivers/create-react-app'

export interface TestRepo {
  openWithConfig(config: MultiThemePluginOptions): Promise<ThemeNode>
  createNode(): Promise<ThemeNode>
}

export interface ThemeNode {
  setClass(className: string): Promise<void>
  removeClass(className: string): Promise<void>
  setAttribute(key: string, value: string): Promise<void>
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
        return this.createNode()
      },
      async createNode() {
        await page.getByRole('button', { name: /add theme node/i }).click()
        const nodes = await page.getByTestId(/theme-node-\d/).all()
        return new ThemeNodeImpl(nodes.length, page)
      }
    }
    await use(testRepo)
    stop?.()
  }
})

class ThemeNodeImpl implements ThemeNode {
  constructor(
    private readonly nodeId: number,
    private readonly page: Page
  ) {}

  async setClass(newClass: string) {
    const { className } = await this.#attributes.get()
    const classes = (className ?? '').split(' ')
    if (!classes.includes(newClass)) {
      await this.setAttribute(
        'className',
        [...classes, newClass].join(' ').trim()
      )
    }
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
