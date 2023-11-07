import { Page, test as base } from '@playwright/test'
import { MultiThemePluginOptions } from '@/utils/optionsUtils'
import { openWithConfig } from './drivers/create-react-app'
import { StopServerCallback } from './drivers'

export interface TestRepo {
  openWithConfig(config: MultiThemePluginOptions): Promise<ThemeRoot>
  createRoot(): Promise<ThemeRoot>
}

export interface ThemeRoot {
  setClasses(classNames: string[]): Promise<void>
  setClass(className: string): Promise<void>
  removeClass(className: string): Promise<void>
  setAttribute(key: string, value: string): Promise<void>
  createRoot(): Promise<ThemeRoot>
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
        return this.createRoot()
      },
      async createRoot() {
        await page.getByRole('button', { name: /^add theme root$/i }).click()
        const roots = await page.getByTestId(/theme-root-\d/).all()
        return new ThemeRootImpl(roots.length.toString(), page)
      }
    }

    await use(testRepo)

    await Promise.all(stopCallbacks.map(x => x()))
  }
})

class ThemeRootImpl implements ThemeRoot {
  constructor(
    private readonly rootId: string,
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

  async createRoot() {
    await this.#rootLocator
      .getByRole('button', {
        name: new RegExp(
          `add theme root to ${this.rootId.replaceAll('.', '\\')}`,
          'i'
        )
      })
      .click()
    const roots = await this.#rootLocator
      .getByTestId(/theme-root-\d(.\d+)*/)
      .all()
    return new ThemeRootImpl(`${this.rootId}.${roots.length}`, this.page)
  }

  get #rootLocator() {
    return this.page.getByTestId(new RegExp(`^theme-root-${this.rootId}$`))
  }

  get #attributesInputLocator() {
    return this.#rootLocator.getByRole('textbox', {
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
