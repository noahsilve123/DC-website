import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Destination College/);
  await expect(page.locator('h1')).toContainText('Financial aid');
});

test('navigation to resources', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Resources');
  await expect(page).toHaveURL('/resources');
  await expect(page.locator('h1')).toContainText('Resources for the first-gen journey');
});

test('scanner component renders', async ({ page }) => {
  await page.goto('/tools');
  await expect(page.locator('text=Extractor')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Upload' })).toBeVisible();
});

test('API recommendations endpoint', async ({ page }) => {
  const response = await page.request.get('/api/recommendations');
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(Array.isArray(data)).toBeTruthy();
  expect(data.length).toBeGreaterThan(0);
});
