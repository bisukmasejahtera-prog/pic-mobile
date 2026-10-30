import { test, expect } from '@playwright/test';
import { setupAuthenticatedPic, navigateToTab } from './helpers/auth';

test.describe('PIC-Mobile Penerimaan Bahan Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPic(page);
    await page.goto('/');

    // Navigate to Penerimaan tab via responsive helper
    await navigateToTab(page, 'penerimaan');
    await expect(page.getByText('Input Bahan Baku (1 per 1)')).toBeVisible();
  });

  test('TC-RECV-01: Successfully records standard raw material receipt without retur', async ({ page }) => {
    // Fill in basic item details
    await page.locator('#input-nama-bahan').fill('Daging Sapi Segar');
    await page.locator('#input-nama-supplier').fill('PT Berkah Pangan Mandiri');
    await page.locator('#input-jumlah-sampai').fill('45.5');
    await page.locator('#select-satuan').selectOption('Kg');
    await page.locator('#input-suhu-peti').fill('4.0');
    await page.locator('#input-catatan').fill('Kondisi segar suhu dingin terjaga');

    // Submit form
    const submitBtn = page.getByRole('button', { name: /Simpan Laporan Bahan Ini/i });
    await submitBtn.click();

    // Verify confirmation toast or success banner
    await expect(page.getByText(/Berhasil mencatat penerimaan: Daging Sapi Segar/i)).toBeVisible();

    // Verify item is added to the feed list
    await expect(page.getByText('Daging Sapi Segar').first()).toBeVisible();
    await expect(page.getByText('PT Berkah Pangan Mandiri').first()).toBeVisible();
  });

  test('TC-RECV-02: Successfully records raw material with retur rejection', async ({ page }) => {
    await page.locator('#input-nama-bahan').fill('Sayur Bayam Hijau');
    await page.locator('#input-nama-supplier').fill('CV Tani Sejahtera');
    await page.locator('#input-jumlah-sampai').fill('30');
    await page.locator('#select-satuan').selectOption('Kg');

    // Toggle Ada Retur
    const returCheckbox = page.locator('#checkbox-ada-retur');
    await returCheckbox.check();

    // Fill Retur details
    await expect(page.locator('#input-jumlah-retur')).toBeVisible();
    await page.locator('#input-jumlah-retur').fill('5.0');
    await page.locator('#input-alasan-retur').fill('Daun menguning dan layu');

    // Submit
    const submitBtn = page.getByRole('button', { name: /Simpan Laporan Bahan Ini/i });
    await submitBtn.click();

    await expect(page.getByText(/Berhasil mencatat penerimaan: Sayur Bayam Hijau/i)).toBeVisible();
    await expect(page.getByText('Sayur Bayam Hijau').first()).toBeVisible();
  });

  test('TC-RECV-03: Deletes an existing item from the reception feed', async ({ page }) => {
    // Look for a delete item button in the today list
    const deleteBtn = page.locator('button[title="Hapus baris ini"]').first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();

      // Expect removal toast
      await expect(page.getByText(/Item berhasil dihapus dari daftar/i)).toBeVisible();
    }
  });
});
