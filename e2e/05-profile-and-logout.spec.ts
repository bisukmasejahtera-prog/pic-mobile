import { test, expect } from '@playwright/test';
import { setupAuthenticatedPic, navigateToTab } from './helpers/auth';

test.describe('PIC-Mobile Profile & Logout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPic(page);
    await page.goto('/');
  });

  test('TC-PROF-01: Displays PIC Profile details and assigned kitchen location', async ({ page }) => {
    // Navigate to Akun / Profil tab
    await navigateToTab(page, 'akun');

    await expect(page.locator(':visible').filter({ hasText: 'Budi Santoso, S.P' }).first()).toBeVisible();
    await expect(page.getByText('TERVERIFIKASI')).toBeVisible();
    await expect(page.locator(':visible').filter({ hasText: /Tarutung/i }).first()).toBeVisible();
    await expect(page.getByText(/PIC-LOG-TRT-08/i)).toBeVisible();
  });

  test('TC-PROF-02: Successfully logs out and redirects to Login screen', async ({ page }) => {
    await navigateToTab(page, 'akun');

    const logoutBtn = page.getByRole('button', { name: /Keluar dari Akun \(Logout\)/i });
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    // Verify redirect to Login screen
    await expect(page.getByText('PIC MOBILE')).toBeVisible();
    await expect(page.getByRole('button', { name: /Masuk ke Sistem Logistik/i })).toBeVisible();
  });
});
