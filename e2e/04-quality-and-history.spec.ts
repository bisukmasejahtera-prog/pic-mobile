import { test, expect } from '@playwright/test';
import { setupAuthenticatedPic, navigateToTab } from './helpers/auth';

test.describe('PIC-Mobile Quality Monitoring & History Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPic(page);
    await page.goto('/');
  });

  test('TC-QC-01: Navigates to Cek Mutu tab and displays QC filters and status', async ({ page }) => {
    // Navigate to Cek Mutu tab
    await navigateToTab(page, 'cek_mutu');

    await expect(page.getByText(/Monitoring Mutu & Pengawasan Retur/i)).toBeVisible();
    await expect(page.getByText('Rantai Dingin', { exact: true })).toBeVisible();
    await expect(page.getByText('Bahan Diretur', { exact: true })).toBeVisible();
    await expect(page.getByText('Total Bahan', { exact: true })).toBeVisible();
  });

  test('TC-HIST-01: Navigates to Riwayat tab and searches received items', async ({ page }) => {
    // Navigate to Riwayat tab
    await navigateToTab(page, 'riwayat');

    await expect(page.getByText(/Arsip Digital Logistik/i)).toBeVisible();

    const searchInput = page.locator('#input-history-search');
    await expect(searchInput).toBeVisible();

    // Type a search query
    await searchInput.fill('Daging');
    await expect(searchInput).toHaveValue('Daging');
  });

  test('TC-HIST-02: Toggles Retur Only filter on history items', async ({ page }) => {
    await navigateToTab(page, 'riwayat');

    const returCheckbox = page.locator('#filter-retur-only');
    await expect(returCheckbox).toBeVisible();

    await returCheckbox.check();
    await expect(returCheckbox).toBeChecked();
  });

  test('TC-HIST-03: Export Excel button exists and toggle dropdown shows export choices', async ({ page }) => {
    await navigateToTab(page, 'riwayat');

    const exportBtn = page.getByTestId('export-excel-button');
    await expect(exportBtn).toBeVisible();

    const menuToggle = page.getByTestId('export-menu-toggle');
    await expect(menuToggle).toBeVisible();
    await menuToggle.click();

    await expect(page.getByTestId('export-option-penerimaan')).toBeVisible();
    await expect(page.getByTestId('export-option-kendala')).toBeVisible();
    await expect(page.getByTestId('export-option-semua')).toBeVisible();
  });
});
