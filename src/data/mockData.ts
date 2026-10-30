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

export const INITIAL_BATCHES: PenerimaanBatch[] = [
  {
    id: 'RCV-20261019-01',
    dapur_id: 'd-1',
    dapur_nama: 'Dapur Bisukma I Tarutung',
    tanggal: '2026-10-19',
    jam_tiba: '04:15',
    shift: 'Pagi',
    vendor_id: 'vnd-ud-bisukma',
    vendor_nama: 'UD Bisukma Sejahtera (Koperasi Yayasan)',
    no_surat_jalan: 'SJ-UD/2026/10/081',
    status: 'diverifikasi',
    haccp_checks: {
      kebersihan_armada: true,
      uji_organoleptik: true,
      kemasan_segel_utuh: true
    },
    items: [
      {
        id: 'itm-01',
        komoditas_id: 'KOM-AYAM-01',
        nama_bahan: 'Daging Ayam Broiler Karkas',
        kategori: 'Protein Hewani',
        target_po_kg: 150.0,
        timbangan_riil_kg: 150.0,
        satuan: 'Kg',
        suhu_celsius: 3.2,
        storage: 'chiller',
        rantai_dingin_terjaga: true,
        selisih_kg: 0.0,
        selisih_persen: 0.0,
        status_qc: 'cocok',
        catatan: 'Segar, potongan bersih, rantai dingin 3.2°C memenuhi standar HACCP'
      },
      {
        id: 'itm-02',
        komoditas_id: 'KOM-WORTEL-01',
        nama_bahan: 'Wortel Segar Berastagi',
        kategori: 'Sayuran',
        target_po_kg: 45.0,
        timbangan_riil_kg: 44.5,
        satuan: 'Kg',
        suhu_celsius: 8.5,
        storage: 'chiller',
        rantai_dingin_terjaga: true,
        selisih_kg: -0.5,
        selisih_persen: -1.1,
        status_qc: 'susut_wajar',
        catatan: 'Susut 0.5 kg dalam batas toleransi wajar (1.1%)'
      }
    ],
    foto_urls: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop'
    ],
    catatan_petugas: 'Pengiriman dini hari berjalan tepat waktu. Suhu karkas ayam prima.',
    pic_nama: 'Budi Santoso, S.P',
    total_berat_kg: 194.5,
    total_selisih_kg: -0.5,
    created_at: '2026-10-19T04:25:00Z'
  },
  {
    id: 'RCV-20261019-02',
    dapur_id: 'd-1',
    dapur_nama: 'Dapur Bisukma I Tarutung',
    tanggal: '2026-10-19',
    jam_tiba: '05:30',
    shift: 'Pagi',
    vendor_id: 'vnd-kop-siborong',
    vendor_nama: 'Koperasi Tani Makmur Silindung',
    no_surat_jalan: 'SJ-KOP/1910-B',
    status: 'diverifikasi',
    haccp_checks: {
      kebersihan_armada: true,
      uji_organoleptik: true,
      kemasan_segel_utuh: true
    },
    items: [
      {
        id: 'itm-03',
        komoditas_id: 'KOM-TEMPE-01',
        nama_bahan: 'Tempe Kedelai Segar Higienis',
        kategori: 'Protein Nabati',
        target_po_kg: 40.0,
        timbangan_riil_kg: 40.0,
        satuan: 'Kg',
        storage: 'dry',
        rantai_dingin_terjaga: true,
        selisih_kg: 0.0,
        selisih_persen: 0.0,
        status_qc: 'cocok',
        catatan: 'Kedelai padat, wangi ragi segar'
      },
      {
        id: 'itm-04',
        komoditas_id: 'KOM-TAHU-01',
        nama_bahan: 'Tahu Putih Bersih Segar',
        kategori: 'Protein Nabati',
        target_po_kg: 35.0,
        timbangan_riil_kg: 35.0,
        satuan: 'Kg',
        storage: 'chiller',
        rantai_dingin_terjaga: true,
        selisih_kg: 0.0,
        selisih_persen: 0.0,
        status_qc: 'cocok',
        catatan: 'Air rendaman jernih, tekstur kenyal'
      }
    ],
    foto_urls: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop'
    ],
    catatan_petugas: 'Drop kedua sayur & nabati dari mitra Koperasi Tani Makmur.',
    pic_nama: 'Budi Santoso, S.P',
    total_berat_kg: 75.0,
    total_selisih_kg: 0.0,
    created_at: '2026-10-19T05:40:00Z'
  }
];

export const INITIAL_PENERIMAAN_BAHAN: PenerimaanBahanItem[] = [
  {
    id: 'RCV-ITM-01',
    dapur_id: 'd-1',
    dapur_nama: 'Dapur Bisukma I Tarutung',
    tanggal: '2026-10-19',
    nama_bahan_baku: 'Daging Ayam Broiler Karkas',
    kategori: 'Protein Hewani',
    nama_supplier: 'UD Bisukma Sejahtera (Koperasi Yayasan)',
    jumlah_sampai: 48.0,
    satuan: 'Kg',
    jam_sampai: '04:30',
    ada_retur: true,
    jumlah_retur: 2.0,
    alasan_retur: '2 karkas memar & berbau kurang segar (ditolak QC)',
    jam_sampai_retur: '06:15',
    suhu_celsius: 3.2,
    foto_urls: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop'
    ],
    catatan: 'Pengganti retur 2 Kg sudah tiba jam 06:15 dalam kondisi segar.',
    pic_nama: 'Budi Santoso, S.P',
    created_at: '2026-10-19T04:35:00Z'
  },
  {
    id: 'RCV-ITM-02',
    dapur_id: 'd-1',
    dapur_nama: 'Dapur Bisukma I Tarutung',
    tanggal: '2026-10-19',
    nama_bahan_baku: 'Wortel Segar Berastagi',
    kategori: 'Sayuran',
    nama_supplier: 'UD Sayur Segar Berastagi',
    jumlah_sampai: 20.0,
    satuan: 'Kg',
    jam_sampai: '03:45',
    ada_retur: false,
    suhu_celsius: 8.0,
    foto_urls: [
      'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&auto=format&fit=crop'
    ],
    catatan: 'Kondisi sayur segar, tanah sudah dibersihkan.',
    pic_nama: 'Budi Santoso, S.P',
    created_at: '2026-10-19T03:50:00Z'
  },
  {
    id: 'RCV-ITM-03',
    dapur_id: 'd-1',
    dapur_nama: 'Dapur Bisukma I Tarutung',
    tanggal: '2026-10-19',
    nama_bahan_baku: 'Ikan Mas Basah Segar',
    kategori: 'Protein Hewani',
    nama_supplier: 'Koperasi Tani Makmur Silindung',
    jumlah_sampai: 30.0,
    satuan: 'Kg',
    jam_sampai: '05:10',
    ada_retur: true,
    jumlah_retur: 3.0,
    alasan_retur: 'Insang pucat & ikan lemas, ditolak QC rantai dingin',
    jam_sampai_retur: '07:00',
    suhu_celsius: 3.8,
    foto_urls: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&auto=format&fit=crop'
    ],
    catatan: 'Pengganti 3 Kg ikan hidup segar tiba jam 07:00 WIB.',
    pic_nama: 'Budi Santoso, S.P',
    created_at: '2026-10-19T05:15:00Z'
  },
  {
    id: 'RCV-ITM-04',
    dapur_id: 'd-1',
    dapur_nama: 'Dapur Bisukma I Tarutung',
    tanggal: '2026-10-19',
    nama_bahan_baku: 'Telur Ayam Ras Segar (Grade A)',
    kategori: 'Protein Hewani',
    nama_supplier: 'UD Bisukma Sejahtera (Koperasi Yayasan)',
    jumlah_sampai: 35.0,
    satuan: 'Kg',
    jam_sampai: '04:30',
    ada_retur: false,
    foto_urls: [
      'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&auto=format&fit=crop'
    ],
    catatan: 'Cangkang bersih utuh, tidak ada yang retak/pecah.',
    pic_nama: 'Budi Santoso, S.P',
    created_at: '2026-10-19T04:40:00Z'
  },
  {
    id: 'RCV-ITM-05',
    dapur_id: 'd-1',
    dapur_nama: 'Dapur Bisukma I Tarutung',
    tanggal: '2026-10-19',
    nama_bahan_baku: 'Tempe Papan Tradisional',
    kategori: 'Protein Nabati',
    nama_supplier: 'Pasar Tradisional Tarutung (Kios Barita)',
    jumlah_sampai: 15.0,
    satuan: 'Kg',
    jam_sampai: '06:00',
    ada_retur: false,
    foto_urls: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop'
    ],
    catatan: 'Belanja langsung di pasar, kedelai padat ragi harum.',
    pic_nama: 'Budi Santoso, S.P',
    created_at: '2026-10-19T06:05:00Z'
  },
  {
    id: 'RCV-ITM-06',
    dapur_id: 'd-1',
    dapur_nama: 'Dapur Bisukma I Tarutung',
    tanggal: '2026-10-19',
    nama_bahan_baku: 'Beras Premium Ramos Silindung',
    kategori: 'Karbohidrat',
    nama_supplier: 'UD Bisukma Sejahtera (Koperasi Yayasan)',
    jumlah_sampai: 150.0,
    satuan: 'Kg',
    jam_sampai: '16:30',
    ada_retur: false,
    foto_urls: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop'
    ],
    catatan: 'Penerimaan bahan kering sore H-1, karung segel utuh.',
    pic_nama: 'Budi Santoso, S.P',
    created_at: '2026-10-19T16:35:00Z'
  }
];
