import { Dapur, Vendor, Komoditas, PenerimaanBatch, PenerimaanBahanItem } from '../types';

export const MOCK_DAPURS: Dapur[] = [
  {
    id: 'd-1',
    nama: 'Dapur Bisukma I Tarutung',
    kode_bgn: 'SPPG-TRT-001',
    alamat: 'Jl. Sisingamangaraja No. 12, Tarutung',
    is_ud_yayasan_hub: true,
    vendor_default_id: 'vnd-ud-bisukma'
  },
  {
    id: 'd-2',
    nama: 'Dapur Bisukma II Siborongborong',
    kode_bgn: 'SPPG-SBB-002',
    alamat: 'Jl. Dolok Sanggul No. 45, Siborongborong',
    is_ud_yayasan_hub: true,
    vendor_default_id: 'vnd-ud-bisukma'
  },
  {
    id: 'd-3',
    nama: 'Dapur D.I Panjaitan Tarutung',
    kode_bgn: 'SPPG-TRT-003',
    alamat: 'Jl. D.I Panjaitan No. 8, Tarutung',
    is_ud_yayasan_hub: true,
    vendor_default_id: 'vnd-ud-bisukma'
  },
  {
    id: 'd-4',
    nama: 'Dapur SPPG Balige Kota',
    kode_bgn: 'SPPG-BLG-004',
    alamat: 'Jl. Gereja No. 18, Balige, Toba',
    is_ud_yayasan_hub: false,
    vendor_default_id: 'vnd-ud-berastagi'
  },
  {
    id: 'd-5',
    nama: 'Dapur SPPG Laguboti',
    kode_bgn: 'SPPG-LGB-005',
    alamat: 'Jl. Raya Laguboti No. 23, Laguboti',
    is_ud_yayasan_hub: false,
    vendor_default_id: 'vnd-kop-siborong'
  }
];

export const MOCK_VENDORS: Vendor[] = [
  {
    id: 'vnd-ud-bisukma',
    nama: 'UD Bisukma Sejahtera (Koperasi Yayasan)',
    tipe: 'koperasi_yayasan',
    wilayah: 'Tarutung & Siborongborong (7 Dapur Hub)',
    kontak: '0812-6655-4433 (Bpk. Nainggolan)'
  },
  {
    id: 'vnd-kop-siborong',
    nama: 'Koperasi Tani Makmur Silindung',
    tipe: 'ud_lokal',
    wilayah: 'Siborongborong & Laguboti',
    kontak: '0821-9988-7711 (Ibu Sihombing)'
  },
  {
    id: 'vnd-ud-berastagi',
    nama: 'UD Sayur Segar Berastagi - Mitra Toba',
    tipe: 'ud_lokal',
    wilayah: 'Balige & Toba',
    kontak: '0813-7744-1122 (Bpk. Sinaga)'
  },
  {
    id: 'vnd-pasar-bebas',
    nama: 'Pasar Tradisional Tarutung (Belanja Langsung)',
    tipe: 'pasar_bebas',
    wilayah: 'Lokal Fleksibel',
    kontak: 'Kasir Pasar Tradisional'
  }
];

export const MOCK_KOMODITAS: Komoditas[] = [
  {
    id: 'KOM-AYAM-01',
    nama: 'Daging Ayam Broiler Karkas',
    kategori: 'protein_hewani',
    satuan: 'Kg',
    storage_default: 'chiller',
    suhu_maksimal_celsius: 4.0,
    toleransi_susut_persen: 2.0
  },
  {
    id: 'KOM-IKAN-01',
    nama: 'Ikan Mas Basah Segar (Ukuran Konsumsi)',
    kategori: 'protein_hewani',
    satuan: 'Kg',
    storage_default: 'chiller',
    suhu_maksimal_celsius: 3.5,
    toleransi_susut_persen: 2.5
  },
  {
    id: 'KOM-TELUR-01',
    nama: 'Telur Ayam Ras Segar (Grade A)',
    kategori: 'protein_hewani',
    satuan: 'Kg',
    storage_default: 'dry',
    toleransi_susut_persen: 1.0
  },
  {
    id: 'KOM-TEMPE-01',
    nama: 'Tempe Kedelai Segar Higienis',
    kategori: 'protein_nabati',
    satuan: 'Kg',
    storage_default: 'dry',
    toleransi_susut_persen: 1.5
  },
  {
    id: 'KOM-TAHU-01',
    nama: 'Tahu Putih Bersih Segar',
    kategori: 'protein_nabati',
    satuan: 'Kg',
    storage_default: 'chiller',
    suhu_maksimal_celsius: 8.0,
    toleransi_susut_persen: 2.0
  },
  {
    id: 'KOM-BERAS-01',
    nama: 'Beras Premium Ramos Silindung',
    kategori: 'karbohidrat',
    satuan: 'Kg',
    storage_default: 'dry',
    toleransi_susut_persen: 0.5
  },
  {
    id: 'KOM-WORTEL-01',
    nama: 'Wortel Segar Berastagi',
    kategori: 'sayur',
    satuan: 'Kg',
    storage_default: 'chiller',
    suhu_maksimal_celsius: 10.0,
    toleransi_susut_persen: 2.0
  },
  {
    id: 'KOM-SAWI-01',
    nama: 'Sawi Manis Segar',
    kategori: 'sayur',
    satuan: 'Kg',
    storage_default: 'chiller',
    suhu_maksimal_celsius: 10.0,
    toleransi_susut_persen: 3.0
  },
  {
    id: 'KOM-PISANG-01',
    nama: 'Pisang Barangan Matang Segar',
    kategori: 'buah',
    satuan: 'Kg',
    storage_default: 'bins',
    toleransi_susut_persen: 2.0
  }
];

export const INITIAL_PENERIMAAN_BAHAN: PenerimaanBahanItem[] = [];
