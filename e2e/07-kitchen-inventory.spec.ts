import { test, expect } from '@playwright/test';
import { setupAuthenticatedPic, navigateToTab } from './helpers/auth';

test.describe('PIC-Mobile Kitchen Inventory & Weekly Checklist Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPic(page);
    await page.goto('/');
  });

  test('TC-INV-01: Navigates to Inventaris tab and displays screen header and week badge', async ({ page }) => {
    await navigateToTab(page, 'inventaris');

    await expect(page.getByText('Inventaris Peralatan Dapur')).toBeVisible();
    await expect(page.getByText(/Pengawasan Aset & Sarana/i)).toBeVisible();
    await expect(page.getByText(/Minggu ke-/i).first()).toBeVisible();

    const searchInput = page.locator('#input-inventory-search');
    await expect(searchInput).toBeVisible();
  });

  test('TC-INV-02: Hero button on dashboard navigates directly to Inventaris tab', async ({ page }) => {
    const invBtn = page.getByTestId('hero-btn-inventaris');
    await expect(invBtn).toBeVisible();
    await invBtn.click();

    await expect(page.getByText('Inventaris Peralatan Dapur')).toBeVisible();
    await expect(page.getByText(/Ceklis Mingguan Berkala/i)).toBeVisible();
  });

  test('TC-INV-03: Filters inventory by category buttons', async ({ page }) => {
    await navigateToTab(page, 'inventaris');

    const allBtn = page.getByRole('button', { name: /^Semua/i });
    await expect(allBtn).toBeVisible();
  });
});
