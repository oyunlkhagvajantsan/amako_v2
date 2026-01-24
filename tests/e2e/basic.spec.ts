import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Amako/);
});

test('navigation to manga page works', async ({ page }) => {
    await page.goto('/');

    // Click the manga link.
    await page.getByRole('link', { name: 'Гаргалт' }).click();

    // Expects page to have a heading with the name of 'All Manga' or similar based on your UI
    await expect(page).toHaveURL(/.*manga/);
});
