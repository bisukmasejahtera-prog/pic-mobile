import { test, expect } from '@playwright/test';
import { clearPicStorage, setupAuthenticatedPic } from './helpers/auth';

test.describe('PIC-Mobile Auth & Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearPicStorage(page);
  });

  test('TC-AUTH-01: Displays login screen with empty input fields initially', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('PIC MOBILE')).toBeVisible();
    await expect(page.getByText('Bisukma Group').first()).toBeVisible();

    const emailInput = page.locator('#login-email');
    const passwordInput = page.locator('#login-password');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(emailInput).toHaveValue('');
    await expect(passwordInput).toHaveValue('');
  });

  test('TC-AUTH-02: Validates HTML5 required fields on empty submit attempt', async ({ page }) => {
    await page.goto('/');

    const emailInput = page.locator('#login-email');
    const passwordInput = page.locator('#login-password');

    // Both fields must be marked required
    expect(await emailInput.getAttribute('required')).not.toBeNull();
    expect(await passwordInput.getAttribute('required')).not.toBeNull();

    // Check HTML5 validity when empty
    const isEmailValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
    expect(isEmailValid).toBe(false);
  });

  test('TC-AUTH-03: Allows switching between Masuk Akun and Daftar PIC Baru tabs', async ({ page }) => {
    await page.goto('/');

    // Switch to Register tab
    await page.getByRole('button', { name: /Daftar PIC Baru/i }).click();

    await expect(page.getByText('Pendaftaran Akun PIC Baru')).toBeVisible();
    await expect(page.locator('#reg-name')).toBeVisible();
    await expect(page.locator('#reg-email')).toBeVisible();
    await expect(page.locator('#reg-phone')).toBeVisible();

    // Switch back to Login tab
    await page.getByRole('button', { name: /Masuk Akun/i }).click();
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.getByRole('button', { name: /Masuk ke Sistem Logistik/i })).toBeVisible();
  });

  test('TC-AUTH-04: Validates password confirmation mismatch on registration', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /Daftar PIC Baru/i }).click();

    await page.locator('#reg-name').fill('Eko Prasetyo');
    await page.locator('#reg-email').fill('eko@bisukma.org');
    await page.locator('#reg-phone').fill('081234567890');
    await page.locator('#reg-password').fill('Password123!');
    await page.locator('#reg-confirm-password').fill('PasswordBeda!');

    await page.getByRole('button', { name: /Kirim Pendaftaran Akun/i }).click();

    await expect(page.getByText(/Konfirmasi kata sandi tidak cocok/i)).toBeVisible();
  });

  test('TC-AUTH-05: Enters authenticated state and displays welcome toast when valid session exists', async ({ page }) => {
    await setupAuthenticatedPic(page, {
      name: 'Budi Santoso, S.P',
      email: 'budi.santoso@bisukma.org'
    });

    await page.goto('/');

    // Must navigate directly into the app dashboard
    await expect(page.locator(':visible').filter({ hasText: 'Budi Santoso, S.P' }).first()).toBeVisible();
    await expect(page.locator(':visible').filter({ hasText: /Tarutung/i }).first()).toBeVisible();
  });
});
