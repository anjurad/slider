import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p: string){ return 'file://' + path.resolve(p); }

test.describe('Validator accepts new frontmatter keys', () => {
  test('No warnings for content-pos and overlay-subtitle*', async ({ page }) => {
    const appPath = path.resolve(__dirname, '..', 'slider.html');
    const url = toFileUrl(appPath) + '?deck=content/demo.md';
    await page.goto(url);

    // Open validator
    await page.getByRole('button', { name: 'Validate' }).click();

    // Modal appears with validation result
    const body = page.locator('#valBody');
    await expect(body).toBeVisible();

    const text = await body.innerText();
    expect(text).toContain('No issues found');

    // Close dialog
    await page.getByRole('button', { name: 'OK' }).click();
  });
});
