import { test } from '@playwright/test';
import path from 'path';

function toFileUrl(p: string){ return 'file://' + path.resolve(p); }

test('debug console on load', async ({ page }) => {
  page.on('console', msg => console.log('BROWSER:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGEERROR:', err.message));
  const appPath = path.resolve(__dirname, '..', 'slider.html');
  await page.goto(toFileUrl(appPath));
  await page.waitForTimeout(1000);
});

