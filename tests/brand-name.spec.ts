import { test, expect } from '@playwright/test';
import path from 'path';

function toFileUrl(p: string){ return 'file://' + path.resolve(p); }

test.describe('Brand name updates', () => {
  test('Style Save updates app name label', async ({ page }) => {
    const appPath = path.resolve(__dirname, '..', 'slider.html');
    await page.goto(toFileUrl(appPath));

    // Open Style modal
    await page.getByRole('button', { name: 'Style' }).click();

    // Change the app name
    const input = page.locator('#cfgName');
    await expect(input).toBeVisible();
    await input.fill('My Test App');

    // Save
    await page.getByRole('button', { name: 'Save' }).click();

    // Assert header brand name updated
    const label = page.locator('#appName');
    await expect(label).toHaveText('My Test App');
  });
});
