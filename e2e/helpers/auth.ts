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
 * Setup authenticated session before loading PIC-Mobile.
 */
export async function setupAuthenticatedPic(page: Page, user: MockPicUser = DEFAULT_MOCK_PIC_USER) {
  await page.addInitScript(({ u, d }) => {
    window.localStorage.setItem('pic_mobile_auth_v1', JSON.stringify(u));
    window.localStorage.setItem('pic_mobile_dapur_v1', JSON.stringify(d));
  }, { u: user, d: MOCK_DAPUR_TARUTUNG });
}

/**
 * Clear all localStorage to start with a pristine state (Login screen).
 */
export async function clearPicStorage(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
}

export type TabTarget = 'beranda' | 'penerimaan' | 'cek_mutu' | 'riwayat' | 'laporan_dapur' | 'akun';

/**
 * Responsive navigation helper for both Mobile bottom-nav and Desktop sidebar.
 */
export async function navigateToTab(page: Page, tab: TabTarget) {
  const mobileNav = page.locator('nav.lg\\:hidden');
  const isMobile = await mobileNav.isVisible();

  if (isMobile) {
    const mobileLabels: Record<TabTarget, RegExp> = {
      beranda: /Beranda/i,
      penerimaan: /Penerimaan/i,
      cek_mutu: /Riwayat & Mutu|Cek Mutu/i,
      riwayat: /Riwayat & Mutu|Riwayat/i,
      laporan_dapur: /Laporan Dapur|Laporan/i,
      akun: /Akun/i
    };
    await mobileNav.getByRole('button', { name: mobileLabels[tab] }).click();
  } else {
    const desktopAside = page.locator('aside');
    const desktopLabels: Record<TabTarget, RegExp> = {
      beranda: /Beranda Ops/i,
      penerimaan: /Penerimaan Bahan/i,
      cek_mutu: /Riwayat & Mutu|Cek Mutu/i,
      riwayat: /Riwayat & Mutu|Riwayat/i,
      laporan_dapur: /Laporan Dapur/i,
      akun: /Akun/i
    };
    await desktopAside.getByRole('button', { name: desktopLabels[tab] }).first().click();
  }
}
