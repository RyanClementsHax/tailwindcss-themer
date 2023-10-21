import { expect } from '@playwright/test'
import { test } from '../test_repos/test'

test('displays the default theme by default', async ({ page, testRepo }) => {
  await testRepo.openWithConfig({
    defaultTheme: {
      extend: {
        colors: {
          primary: {
            // here I'm specifying a custom default
            500: 'blue'
          },
          secondary: {
            500: 'red'
          }
        }
      }
    },
    themes: [
      {
        name: 'dark',
        extend: {
          colors: {
            // here I'm overriding a custom default
            secondary: {
              500: 'darkred'
            },
            // here I'm overriding a custom default too
            primary: {
              500: 'darkblue'
            }
          }
        }
      },
      {
        name: 'neon',
        extend: {
          colors: {
            secondary: {
              // here I'm overwriting a custom default again
              500: '#90A040' // as red as it gets
            }
            // im not overwriting the custom primary color I made ... I wonder what will happen ??? 🤔🤔🤔
          }
        }
      }
    ]
  })

  await expect(page).toHaveScreenshot()
})
