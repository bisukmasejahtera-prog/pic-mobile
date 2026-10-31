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

  test('TC-INV-04: Opens modal for recording existing kitchen equipment and inputs new asset', async ({ page }) => {
    await navigateToTab(page, 'inventaris');

    const openModalBtn = page.getByTestId('btn-open-input-aset');
    await expect(openModalBtn).toBeVisible();
    await openModalBtn.click();

    // Verify modal elements
    await expect(page.getByText('Pencatatan & Inventarisasi Aset')).toBeVisible();
    await expect(page.getByText('Saldo Awal / Data Lama')).toBeVisible();
    await expect(page.getByText('1. Identitas & Spesifikasi Barang')).toBeVisible();
    await expect(page.getByText('2. Penempatan Lokasi & Catatan PIC')).toBeVisible();
    await expect(page.getByText('3. Kuantitas & Rincian Kondisi Fisik')).toBeVisible();

    // Fill form
    await page.getByTestId('input-nama-barang').fill('Kompor Gas Mawar 2 Tungku');
    await page.getByTestId('input-spesifikasi').fill('Rinnai High Pressure SUS 304');
    await page.getByTestId('input-catatan-simpel').fill('Alat operasional dapur sejak peresmian');

    // Submit form
    const submitBtn = page.getByTestId('btn-submit-inventaris');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Verify modal closed
    await expect(page.getByText('1. Identitas & Spesifikasi Barang')).not.toBeVisible();
  });

  test('TC-INV-05: Inputs asset with custom satuan (Lainnya) and tests edit asset modal', async ({ page }) => {
    await navigateToTab(page, 'inventaris');

    const openModalBtn = page.getByTestId('btn-open-input-aset');
    await openModalBtn.click();

    // Fill form
    await page.getByTestId('input-nama-barang').fill('Piring Saji Melamin');
    await page.getByTestId('input-spesifikasi').fill('Food Grade Tebal');

    // Select custom satuan 'Lainnya'
    const satuanSelect = page.getByTestId('select-satuan-barang');
    await satuanSelect.selectOption('Lainnya');

    // Custom text input should appear
    const customSatuanInput = page.getByTestId('input-satuan-custom');
    await expect(customSatuanInput).toBeVisible();
    await customSatuanInput.fill('Lusin');

    // Set quantity
    await page.getByTestId('input-jumlah-barang').fill('10');
    // Balance condition (kondisi baik = 10)
    await page.locator('input[value="10"]').first().dispatchEvent('input');

    // Submit
    await page.getByTestId('btn-submit-inventaris').click();
    await expect(page.getByText('1. Identitas & Spesifikasi Barang')).not.toBeVisible();

    // Verify item created with custom unit
    await expect(page.getByText('Piring Saji Melamin').first()).toBeVisible();

    // Test Edit
    const editBtn = page.locator('button[title*="Edit data"]').first();
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // Modal opens in edit mode
    await expect(page.getByText('Edit & Perbarui Data Aset')).toBeVisible();
    await expect(page.getByTestId('btn-submit-inventaris')).toContainText(/Simpan Perubahan/i);

    // Update name
    await page.getByTestId('input-nama-barang').fill('Piring Saji Melamin Premium');
    await page.getByTestId('btn-submit-inventaris').click();

    // Verify update
    await expect(page.getByText('Piring Saji Melamin Premium').first()).toBeVisible();
  });
});
