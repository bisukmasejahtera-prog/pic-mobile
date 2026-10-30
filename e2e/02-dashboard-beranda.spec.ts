import { test, expect } from '@playwright/test';
import { setupAuthenticatedPic } from './helpers/auth';

test.describe('PIC-Mobile Dashboard / Beranda Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPic(page);
    await page.goto('/');
  });

  test('TC-DASH-01: Displays header with kitchen name, active date, and assigned PIC', async ({ page }) => {
    // Header should contain kitchen information and PIC name
    await expect(page.locator(':visible').filter({ hasText: /Tarutung/i }).first()).toBeVisible();
    await expect(page.locator(':visible').filter({ hasText: 'Budi Santoso, S.P' }).first()).toBeVisible();
    await expect(page.locator(':visible').filter({ hasText: /Penerimaan Bahan Baku Dapur SPPG/i }).first()).toBeVisible();
  });

  test('TC-DASH-02: Displays top KPI summary cards for received items', async ({ page }) => {
    // Check metric labels in the grid
    await expect(page.getByText('Bahan Diterima')).toBeVisible();
    await expect(page.getByText('Total Bobot Netto')).toBeVisible();
    await expect(page.getByText('Kelayakan Mutu')).toBeVisible();
    await expect(page.getByText('Bahan Diretur')).toBeVisible();
  });

  test('TC-DASH-03: Quick action button navigates to Penerimaan screen', async ({ page }) => {
    const quickInputBtn = page.getByRole('button', { name: /\+ Input 1 Bahan Baku Baru/i });
    await expect(quickInputBtn).toBeVisible();
    await quickInputBtn.click();

    // Verify we navigated to the Penerimaan tab
    await expect(page.getByText('Laporan Penerimaan Satuan')).toBeVisible();
    await expect(page.getByText('Input Bahan Baku (1 per 1)')).toBeVisible();
  });

  test('TC-DASH-04: Clicking an item in recent receipts opens the detail modal', async ({ page }) => {
    // Click on a received item row in the dashboard list
    const itemRow = page.locator('div.cursor-pointer').filter({ hasText: /Supplier:/i }).first();
    if (await itemRow.isVisible()) {
      await itemRow.click();

      // Verify BahanDetailModal appears
      await expect(page.getByText('Laporan Bahan Masuk')).toBeVisible();
      await expect(page.getByRole('button', { name: /^Tutup$/i })).toBeVisible();

      // Close modal
      await page.getByRole('button', { name: /^Tutup$/i }).click();
      await expect(page.getByText('Laporan Bahan Masuk')).not.toBeVisible();
    }
  });
});
