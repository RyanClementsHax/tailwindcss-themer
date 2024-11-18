import { Page, TestInfo, test as base } from '@playwright/test'
import { MultiThemePluginOptions } from '@/utils/optionsUtils'
import { Config as TailwindConfig } from 'tailwindcss'
import { StopServerCallback, resolveDriver } from './drivers'

export interface TestRepos {
  builder(): TestRepoBuilder
}

export interface TestRepoBuilder {
  withBaseTailwindConfig(config: {
    theme: TailwindConfig['theme']
  }): TestRepoBuilder
  withThemerConfig(config: MultiThemePluginOptions): TestRepoBuilder
  open(): Promise<{ repo: TestRepo; root: ThemeRoot }>
}

export interface TestRepo {
  createRoot(): Promise<ThemeRoot>
}

export interface ThemeRoot {
  item: ThemedItem
  addClasses(newClasses: string[]): Promise<void>
  addClass(newClass: string): Promise<void>
  removeClass(classToRemove: string): Promise<void>
  setAttribute(key: string, value: string): Promise<void>
  createRoot(): Promise<ThemeRoot>
}

export interface ThemedItem {
  addClass(newClass: string): Promise<void>
  overwriteClassTo(className: string): Promise<void>
}

export const test = base.extend<{ testRepos: TestRepos }>({
  testRepos: async ({ page }, use, testInfo) => {
    const repo = test.info().project.metadata.repo as unknown
    if (typeof repo !== 'string') {
      throw new Error('"repo" must be a string')
    }
    const stopCallbacks: StopServerCallback[] = []

    const testRepos: TestRepos = {
      builder() {
        return new TestRepoBuilderImpl(
          page,
          repo,
          testInfo,
          () => stopCallbacks.length + 1,
          stop => stopCallbacks.push(stop)
        )
      }
    }

    await use(testRepos)

    await Promise.all(stopCallbacks.map(stop => stop()))
  }
})

class TestRepoBuilderImpl implements TestRepoBuilder {
  #themerConfig: MultiThemePluginOptions | undefined
  #baseTailwindConfig: { theme: TailwindConfig['theme'] } | undefined

  constructor(
    private readonly page: Page,
    private readonly repo: string,
    private readonly testInfo: TestInfo,
    private readonly getInstanceId: () => number,
    private readonly registerStopCallback: (stop: StopServerCallback) => void
  ) {}

  withBaseTailwindConfig(config: {
    theme: TailwindConfig['theme']
  }): TestRepoBuilder {
    this.#baseTailwindConfig = config
    return this
  }

  withThemerConfig(themerConfig: MultiThemePluginOptions): TestRepoBuilder {
    this.#themerConfig = themerConfig
    return this
  }

  async open(): Promise<{ repo: TestRepo; root: ThemeRoot }> {
    if (!this.#themerConfig) {
      throw new Error('Cannot open without first defining the themer config')
    }

    const driver = await resolveDriver(this.repo)

    const { url, stop: _stop } = await driver.open({
      repo: this.repo,
      instanceId: this.getInstanceId(),
      titlePath: this.testInfo.titlePath,
      baseTailwindConfig: this.#baseTailwindConfig,
      themerConfig: this.#themerConfig
    })
    this.registerStopCallback(_stop)

    await this.page.goto(url)

    const repo = new TestRepoImpl(this.page)

    return {
      repo,
      root: await repo.createRoot()
    }
  }
}

class TestRepoImpl implements TestRepo {
  constructor(private readonly page: Page) {}

  async createRoot(): Promise<ThemeRoot> {
    await this.page.getByRole('button', { name: /^add theme root$/i }).click()
    const roots = await this.page.getByTestId(/theme-root-\d/).all()
    return new ThemeRootImpl(roots.length.toString(), this.page)
  }
}

class ThemeRootImpl implements ThemeRoot {
  public item: ThemedItem

  constructor(
    private readonly rootId: string,
    private readonly page: Page
  ) {
    this.item = new ThemedItemImpl(this.rootId, this.page)
  }

  async addClasses(newClasses: string[]) {
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

  async addClass(newClass: string) {
    await this.addClasses([newClass])
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
        // We'll pinky promise here 🤞
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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

class ThemedItemImpl implements ThemedItem {
  constructor(
    private readonly rootId: string,
    private readonly page: Page
  ) {}

  async addClass(newClass: string): Promise<void> {
    const value = await this.#classesInputLocator.inputValue()
    const classes = (value ?? '').split(' ')
    if (!classes.includes(newClass)) {
      await this.overwriteClassTo([...classes, newClass].join(' ').trim())
    }
  }

  async overwriteClassTo(className: string): Promise<void> {
    await this.#classesInputLocator.fill(className)
  }

  get #itemLocator() {
    return this.page.getByTestId(new RegExp(`^themed-item-in-${this.rootId}$`))
  }

  get #classesInputLocator() {
    return this.#itemLocator.getByRole('textbox', {
      name: /classes/i
    })
  }
}
