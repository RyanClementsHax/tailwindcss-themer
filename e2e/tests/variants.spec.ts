import { expect } from '@playwright/test'
import { test } from '../test_repos/test'

test('can use the theme name as a variant to enable a style when that theme is enabled', async ({
  page,
  testRepos
}) => {
  const { root } = await testRepos
    .builder()
    .withThemerConfig({
      defaultTheme: {
        extend: {
          colors: {
            primary: 'blue'
          }
        }
      },
      themes: [
        {
          name: 'darkTheme',
          extend: {
            colors: {
              primary: 'red'
            }
          }
        }
      ]
    })
    .open()

  await root.addClass('darkTheme')

  await root.item.overwriteClassTo('darkTheme:bg-primary')

  await expect(page).toHaveScreenshot()
})

test('variants only enable the style when the theme is enabled', async ({
  page,
  testRepos
}) => {
  const { root } = await testRepos
    .builder()
    .withThemerConfig({
      defaultTheme: {
        extend: {
          colors: {
            primary: 'blue'
          }
        }
      },
      themes: [
        {
          name: 'darkTheme',
          extend: {
            colors: {
              primary: 'red'
            }
          }
        }
      ]
    })
    .open()

  await root.item.overwriteClassTo('darkTheme:bg-primary')

  await expect(page).toHaveScreenshot()

  await root.addClass('darkTheme')

  await expect(page).toHaveScreenshot()
})

test('can use the theme name as a variant and styles apply to the element with the class on it', async ({
  page,
  testRepos
}) => {
  const { root } = await testRepos
    .builder()
    .withThemerConfig({
      defaultTheme: {
        extend: {
          colors: {
            primary: 'blue'
          }
        }
      },
      themes: [
        {
          name: 'darkTheme',
          extend: {
            colors: {
              primary: 'red'
            }
          }
        }
      ]
    })
    .open()

  await root.addClasses(['darkTheme', 'darkTheme:bg-primary'])

  await expect(page).toHaveScreenshot()
})

test('can use the defaultTheme variant to apply a style only when the default theme is enabled only when the theme root has the defaultTheme class on it', async ({
  page,
  testRepos
}) => {
  const { root } = await testRepos
    .builder()
    .withThemerConfig({
      defaultTheme: {
        extend: {
          colors: {
            primary: 'blue'
          }
        }
      },
      themes: [
        {
          name: 'darkTheme',
          extend: {
            colors: {
              primary: 'red'
            }
          }
        }
      ]
    })
    .open()

  await root.item.overwriteClassTo('defaultTheme:bg-primary')

  await expect(page).toHaveScreenshot()

  await root.addClass('defaultTheme')

  await expect(page).toHaveScreenshot()
})
