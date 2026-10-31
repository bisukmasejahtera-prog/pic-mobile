import { Page } from '@playwright/test';

export interface MockPicUser {
  name: string;
  email: string;
}

export const DEFAULT_MOCK_PIC_USER: MockPicUser = {
  name: 'Budi Santoso, S.P',
  email: 'budi.santoso@bisukma.org'
};

export const MOCK_DAPUR_TARUTUNG = {
  id: 'd-1',
  nama: 'Dapur Bisukma I Tarutung',
  kode_bgn: 'SPPG-TRT-001',
  alamat: 'Jl. Sisingamangaraja No. 12, Tarutung',
  is_ud_yayasan_hub: true,
  vendor_default_id: 'vnd-ud-bisukma'
};

/**
 * Intercept Firestore network requests so e2e tests never pollute production database
 */
export async function mockFirestoreNetwork(page: Page) {
  await page.route('**/firestore.googleapis.com/**', route => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([])
    });
  });
}

/**
 * Setup authenticated session before loading PIC-Mobile.
 */
export async function setupAuthenticatedPic(page: Page, user: MockPicUser = DEFAULT_MOCK_PIC_USER) {
  await mockFirestoreNetwork(page);
  await page.addInitScript(({ u, d }) => {
    window.localStorage.setItem('pic_mobile_auth_v1', JSON.stringify(u));
    window.localStorage.setItem('pic_mobile_dapur_v1', JSON.stringify(d));
  }, { u: user, d: MOCK_DAPUR_TARUTUNG });
}

/**
 * Clear all localStorage to start with a pristine state (Login screen).
 */
export async function clearPicStorage(page: Page) {
  await mockFirestoreNetwork(page);
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
}

export type TabTarget = 'beranda' | 'penerimaan' | 'cek_mutu' | 'riwayat' | 'inventaris' | 'laporan_dapur' | 'akun';

/**
 * Responsive navigation helper for both Mobile bottom-nav and Desktop sidebar.
 */
export async function navigateToTab(page: Page, tab: TabTarget) {
  const viewport = page.viewportSize();
  const isMobile = !viewport || viewport.width < 1024;

  if (isMobile) {
    const mobileNav = page.locator('nav.lg\\:hidden');
    await mobileNav.waitFor({ state: 'visible', timeout: 10000 });
    const mobileLabels: Record<TabTarget, RegExp> = {
      beranda: /Beranda/i,
      penerimaan: /Penerimaan/i,
      cek_mutu: /Riwayat & Mutu|Cek Mutu|Riwayat/i,
      riwayat: /Riwayat & Mutu|Riwayat/i,
      inventaris: /Inventaris/i,
      laporan_dapur: /Laporan Dapur|Laporan/i,
      akun: /Akun/i
    };
    await mobileNav.getByRole('button', { name: mobileLabels[tab] }).click();
  } else {
    const desktopAside = page.locator('aside');
    await desktopAside.waitFor({ state: 'visible', timeout: 10000 });
    const desktopLabels: Record<TabTarget, RegExp> = {
      beranda: /Beranda Ops/i,
      penerimaan: /Penerimaan Bahan/i,
      cek_mutu: /Riwayat & Mutu|Cek Mutu|Riwayat/i,
      riwayat: /Riwayat & Mutu|Riwayat/i,
      inventaris: /Inventaris Dapur|Inventaris/i,
      laporan_dapur: /Laporan Dapur/i,
      akun: /Akun/i
    };
    await desktopAside.getByRole('button', { name: desktopLabels[tab] }).first().click();
  }
}
