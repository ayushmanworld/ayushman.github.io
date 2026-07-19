import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('has correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Ayushman/)
  })

  test('shows hero heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /Empowering Abilities/i }),
    ).toBeVisible()
  })

  test('navigation links are accessible', async ({ page }) => {
    const nav = page.getByRole('navigation', { name: 'Primary navigation' })
    await expect(nav).toBeVisible()

    await expect(nav.getByRole('link', { name: /Find Help/i })).toBeVisible()
    await expect(nav.getByRole('link', { name: /Videos/i })).toBeVisible()
  })

  test('has skip-to-content accessibility link', async ({ page }) => {
    // Tab to first focusable element
    await page.keyboard.press('Tab')
    // The skip link should be focused (visible when focused)
    const focused = page.locator(':focus')
    const tag = await focused.evaluate((el) => el.tagName.toLowerCase())
    expect(['a', 'button']).toContain(tag)
  })

  test('Find Help button navigates to research page', async ({ page }) => {
    await page.getByRole('link', { name: /Find Help Near You/i }).click()
    await expect(page).toHaveURL('/research')
  })

  test('donate button is visible and leads to donate page', async ({ page }) => {
    await page.getByRole('link', { name: /Donate Now/i }).first().click()
    await expect(page).toHaveURL('/donate')
  })

  test('has footer with contact information', async ({ page }) => {
    const footer = page.getByRole('contentinfo')
    await expect(footer).toBeVisible()
    await expect(footer.getByText('+91 82800 56665')).toBeVisible()
  })

  test('passes basic accessibility audit', async ({ page }) => {
    // Check no images without alt text
    const imgsWithoutAlt = await page.locator('img:not([alt])').count()
    expect(imgsWithoutAlt).toBe(0)

    // Check all buttons have accessible names
    const buttons = page.getByRole('button')
    const count = await buttons.count()
    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i)
      const name = await btn.getAttribute('aria-label') ?? await btn.textContent()
      expect(name?.trim()).toBeTruthy()
    }
  })
})

test.describe('Navigation', () => {
  test('mobile menu opens and closes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')

    const menuButton = page.getByRole('button', { name: /open menu/i })
    await menuButton.click()
    await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible()

    const closeButton = page.getByRole('button', { name: /close menu/i })
    await closeButton.click()
    await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).not.toBeVisible()
  })
})

test.describe('Auth pages', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible()
    await expect(page.getByLabel('Email address')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: /Sign in/i })).toBeVisible()
  })

  test('register page renders with role selector', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('heading', { name: /Join Ayushman/i })).toBeVisible()
    await expect(page.getByText('Parent / Guardian')).toBeVisible()
    await expect(page.getByLabel('Full name')).toBeVisible()
    await expect(page.getByLabel('Email address')).toBeVisible()
  })

  test('forgot password page renders', async ({ page }) => {
    await page.goto('/forgot-password')
    await expect(page.getByRole('heading', { name: /Forgot password/i })).toBeVisible()
  })

  test('login form shows validation errors', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /Sign in/i }).click()
    await expect(page.getByRole('alert')).toBeVisible()
  })

  test('login page has link to register', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: /Create an account/i }).click()
    await expect(page).toHaveURL('/register')
  })
})

test.describe('Accessibility', () => {
  test('404 page is accessible', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-at-all')
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible()
    await expect(page.getByRole('link', { name: /Go home/i })).toBeVisible()
  })
})
