import { test, expect } from '@playwright/test';

test('search submits explicitly, preserves hero, navigates details and browser history', async ({ page }) => {
  await page.goto('/');
  const hero = await page.locator('#featured-statement').textContent();
  await page.getByRole('searchbox').fill('ninety ninety law');
  await expect(page).toHaveURL('http://127.0.0.1:3000/');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.locator('.ism-row')).toHaveCount(1);
  await expect(page.locator('#featured-statement')).toHaveText(hero);
  await expect(page).toHaveURL(/q=ninety/);
  await page.locator('.ism-row a').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ninety-Ninety Rule');
  await expect(page.getByRole('link', { name: /The Jargon File/ })).toBeVisible();
  await page.goBack();
  await expect(page.locator('.ism-row')).toHaveCount(1);
  await page.getByRole('searchbox').fill('doesnotexist');
  await page.getByRole('searchbox').press('Enter');
  await expect(page.getByText('No isms found.')).toBeVisible();
  await page.getByRole('link', { name: /Clear search/ }).click();
  await expect(page.getByRole('searchbox')).toHaveValue('');
  await expect(page.locator('.ism-row').first()).toBeVisible();
});

test('infinite scrolling appends every entry once', async ({ page }) => {
  await page.goto('/');
  await page.locator('.pagination-row').scrollIntoViewIfNeeded();
  await expect(page.locator('.ism-row')).toHaveCount(8);
  expect(new Set(await page.locator('.ism-row a').allTextContents()).size).toBe(8);
  await expect(page.locator('.end-row')).toBeVisible();
});

test('layout fits desktop and narrow mobile screens', async ({ page }) => {
  for (const width of [1280, 375, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/home-${width}.png`, fullPage: true });
    await page.goto('/isms/ninety-ninety-rule');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/detail-${width}.png`, fullPage: true });
  }
});

test('search and pagination work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:3000/');
  await page.getByRole('link', { name: /Load more/ }).click();
  await expect(page.locator('.ism-row')).toHaveCount(2);
  await page.getByRole('link', { name: /Previous page/ }).click();
  await expect(page.locator('.ism-row')).toHaveCount(6);
  await page.getByRole('searchbox').fill('Conway');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.locator('.ism-row')).toHaveCount(1);
  await context.close();
});
