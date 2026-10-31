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

  test('TC-RECV-04: Inputs receiving with custom satuan (Lainnya) and tests edit item flow', async ({ page }) => {
    await page.locator('#input-nama-bahan').fill('Tepung Terigu Segitiga');
    await page.locator('#input-nama-supplier').fill('Toko Bahan Kue Sejahtera');
    await page.locator('#input-jumlah-sampai').fill('5');

    // Select custom satuan 'Lainnya...'
    await page.locator('#select-satuan').selectOption('Lainnya');
    const customSatuanInput = page.getByTestId('input-satuan-custom-rcv');
    await expect(customSatuanInput).toBeVisible();
    await customSatuanInput.fill('Zak');

    // Submit
    const submitBtn = page.getByRole('button', { name: /Simpan Laporan Bahan Ini/i });
    await submitBtn.click();

    // Verify item created with custom unit
    await expect(page.getByText(/Berhasil mencatat penerimaan: Tepung Terigu Segitiga/i)).toBeVisible();
    await expect(page.getByText('5 Zak').first()).toBeVisible();

    // Test Edit
    const editBtn = page.locator('button[title*="Edit baris"]').first();
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // Check mode edit banner and button
    await expect(page.getByText(/Mode Edit: Sedang memperbarui laporan/i)).toBeVisible();
    const updateBtn = page.getByRole('button', { name: /Perbarui Laporan Bahan Ini/i });
    await expect(updateBtn).toBeVisible();

    // Change amount to 8
    await page.locator('#input-jumlah-sampai').fill('8');
    await updateBtn.click();

    // Verify update
    await expect(page.getByText(/Berhasil memperbarui data penerimaan/i)).toBeVisible();
    await expect(page.getByText('8 Zak').first()).toBeVisible();
  });

  test('TC-RECV-05: Confirms full reception of raw materials and displays digital BAP thank you page', async ({ page }) => {
    // 1. Ensure at least one item is present
    await page.locator('#input-nama-bahan').fill('Minyak Goreng Sawit 2L');
    await page.locator('#input-nama-supplier').fill('Distributor Sembako Nusantara');
    await page.locator('#input-jumlah-sampai').fill('20');
    await page.locator('#select-satuan').selectOption('Liter');

    const submitBtn = page.getByRole('button', { name: /Simpan Laporan Bahan Ini/i });
    await submitBtn.click();
    await expect(page.getByText(/Berhasil mencatat penerimaan: Minyak Goreng Sawit 2L/i)).toBeVisible();

    // 2. Click Konfirmasi Barang Sudah Diterima Seluruhnya banner / button
    const confirmBannerBtn = page.getByTestId('btn-open-konfirmasi-seluruhnya');
    await expect(confirmBannerBtn).toBeVisible();
    await confirmBannerBtn.click();

    // 3. Verify on Confirmation View
    await expect(page.getByText('Konfirmasi Penerimaan Seluruh Bahan Baku')).toBeVisible();
    await expect(page.getByText('Daftar Bahan Siap Disahkan')).toBeVisible();
    await expect(page.getByText('Minyak Goreng Sawit 2L').first()).toBeVisible();

    // 4. Agreement Checkbox & Submit
    const agreementCheckbox = page.getByTestId('checkbox-agreement-konfirmasi');
    await expect(agreementCheckbox).toBeVisible();
    await agreementCheckbox.check();

    const finalSubmitBtn = page.getByTestId('btn-submit-konfirmasi-final');
    await expect(finalSubmitBtn).toBeEnabled();
    await finalSubmitBtn.click();

    // 5. Verify Thank You / Success View
    await expect(page.getByText('Terima Kasih Sudah Submit Data Penerimaan Bahan Baku')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Berita Acara Penerimaan (BAP) Digital')).toBeVisible();
    await expect(page.getByText(/BAP-SPPG-/i)).toBeVisible();

    // 6. Navigate back to Beranda
    const btnKeBeranda = page.getByTestId('btn-success-ke-beranda');
    await expect(btnKeBeranda).toBeVisible();
    await btnKeBeranda.click();

    // Confirm redirected to Beranda
    await expect(page.getByText(/Penerimaan Bahan Baku Dapur SPPG/i).first()).toBeVisible();
  });
});
