import { test, expect } from '@playwright/test';
import { setupAuthenticatedPic, navigateToTab } from './helpers/auth';

test.describe('PIC-Mobile Laporan Dapur & Ketidaksesuaian Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPic(page);
    await page.goto('/');
  });

  test('TC-LAPORAN-01: Navigates to Laporan Dapur tab and displays screen header and action button', async ({ page }) => {
    await navigateToTab(page, 'laporan_dapur');

    await expect(page.getByRole('heading', { name: /Laporan Kendala & Ketidaksesuaian Dapur/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Buat Laporan Baru/i }).first()).toBeVisible();
    await expect(page.getByText(/Total Laporan/i)).toBeVisible();
  });

  test('TC-LAPORAN-02: Successfully opens report modal and submits a new discrepancy report', async ({ page }) => {
    await navigateToTab(page, 'laporan_dapur');

    // Click "Buat Laporan Baru"
    await page.getByRole('button', { name: /Buat Laporan Baru/i }).first().click();

    // Verify modal is open
    await expect(page.getByRole('heading', { name: /Laporan Kendala Dapur/i })).toBeVisible();

    // Fill form
    await page.getByPlaceholder(/Chiller daging mati/i).fill('Kompor Gas Burner 2 Mati Total');
    await page.getByPlaceholder(/Jelaskan detail apa yang terjadi/i).fill('Api kompor tidak menyala, regulator sudah dicek normal. Dapur butuh perbaikan segera.');

    // Select urgensi "Darurat"
    await page.getByRole('button', { name: /Darurat/i }).click();

    // Submit
    await page.getByRole('button', { name: /Kirim Laporan/i }).click();

    // Verify toast or item in feed
    await expect(page.getByText(/Kompor Gas Burner 2 Mati Total/i).first()).toBeVisible();
    await expect(page.getByText('Darurat').first()).toBeVisible();
  });
});
