export type TabType = 'beranda' | 'penerimaan' | 'riwayat' | 'inventaris' | 'laporan_dapur' | 'akun' | 'cek_mutu';

export type KategoriKendala = 
  | 'bahan_luar_rab' 
  | 'jadwal_waktu' 
  | 'kerusakan_alat' 
  | 'fasilitas_kurang' 
  | 'lainnya';

export type TingkatUrgensi = 'rendah' | 'sedang' | 'darurat';

export type StatusKendala = 'pending' | 'diproses' | 'selesai' | 'ditolak';

export interface LaporanKendalaDapur {
  id: string;
  dapur_id: string;
  dapur_nama: string;
  pic_nama: string;
  pic_email?: string;
  kategori: KategoriKendala;
  tingkat_urgensi: TingkatUrgensi;
  judul: string;
  deskripsi: string;
  tindakan_sementara?: string;
  estimasi_biaya?: number;
  foto_urls: string[];
  status: StatusKendala;
  tanggapan_maker?: string;
  ditindaklanjuti_oleh?: string;
  ditindaklanjuti_pada?: string;
  created_at: string;
  updated_at?: string;
}

export interface Dapur {
  id: string;
  nama: string;
  kode_bgn: string;
  alamat: string;
  is_ud_yayasan_hub?: boolean; // 7 dapur under 1 UD Yayasan
  vendor_default_id: string;
}

export interface Vendor {
  id: string;
  nama: string;
  tipe: 'koperasi_yayasan' | 'ud_lokal' | 'pasar_bebas';
  wilayah: string;
  kontak: string;
}

export type StorageCondition = 'chiller' | 'dry' | 'freezer' | 'bins';
export type QCStatus = 'cocok' | 'susut_wajar' | 'perhatian' | 'karantina' | 'tolak';

export interface Komoditas {
  id: string;
  nama: string;
  kategori: 'protein_hewani' | 'protein_nabati' | 'sayur' | 'buah' | 'karbohidrat' | 'bumbu_kering';
  satuan: 'Kg' | 'Liter' | 'Butir' | 'Ikat' | 'Dus';
  storage_default: StorageCondition;
  suhu_maksimal_celsius?: number;
  toleransi_susut_persen: number; // e.g. 2.0%
}

export interface PenerimaanItem {
  id: string;
  komoditas_id: string;
  nama_bahan: string;
  kategori: string;
  target_po_kg: number;
  timbangan_riil_kg: number;
  satuan: string;
  suhu_celsius?: number;
  storage: StorageCondition;
  rantai_dingin_terjaga: boolean;
  selisih_kg: number;
  selisih_persen: number;
  status_qc: QCStatus;
  catatan?: string;
  is_custom_item?: boolean;
  has_target_po?: boolean;
}

export interface PenerimaanBahanItem {
  id: string;
  dapur_id: string;
  dapur_nama: string;
  tanggal: string;
  tanggal_menu?: string;
  nama_bahan_baku: string;
  kategori?: string;
  nama_supplier: string;
  jumlah_sampai: number;
  satuan: string;
  jam_sampai: string;
  ada_retur: boolean;
  jumlah_retur?: number;
  alasan_retur?: string;
  jam_sampai_retur?: string;
  suhu_celsius?: number;
  foto_urls: string[];
  catatan?: string;
  pic_nama: string;
  created_at: string;
}

export interface HACCPChecklistState {
  kebersihan_armada: boolean;
  uji_organoleptik: boolean;
  kemasan_segel_utuh: boolean;
}

export interface ReturRecord {
  id: string;
  penerimaan_id: string;
  komoditas_nama: string;
  jumlah_retur_kg: number;
  alasan_retur: string;
  tindakan: 'ganti_segera' | 'potong_tagihan' | 'karantina_uji';
  foto_bukti_url?: string;
  waktu: string;
}

export interface PenerimaanBatch {
  id: string;
  dapur_id: string;
  dapur_nama: string;
  tanggal: string;
  jam_tiba: string;
  shift: 'Pagi' | 'Siang' | 'Malam H-1';
  vendor_id: string;
  vendor_nama: string;
  no_surat_jalan: string;
  status: 'draft' | 'diverifikasi' | 'karantina' | 'selesai';
  haccp_checks: HACCPChecklistState;
  items: PenerimaanItem[];
  foto_urls: string[];
  catatan_petugas?: string;
  pic_nama: string;
  total_berat_kg: number;
  total_selisih_kg: number;
  created_at: string;
  is_manual_entry?: boolean;
  tipe_dokumen?: 'surat_jalan' | 'manual_tanpa_sj' | 'nota_pasar';
  alasan_manual?: string;
}

export interface InventarisItem {
  id: string;
  kode_aset?: string;
  lokasi_sekarang?: 'gudang_pusat' | 'sppg';
  dapur_id: string;
  dapur_nama?: string;
  nama_barang: string;
  spesifikasi?: string;
  kategori?: string;
  bulan_tahun_pengadaan?: string;
  tanggal_pembelian?: string;
  nomor_po_faktur?: string;
  supplier_toko?: string;
  satuan: string;
  kuantitas_satuan?: number;
  konversi_pcs?: number;
  total_kuantitas_pcs: number;
  harga_satuan_rp?: number;
  total_harga_rp?: number;
  status_aset?: string;
  kode_bast_terakhir?: string;
  kondisi_baik_pcs?: number;
  kondisi_rusak_ringan_pcs?: number;
  kondisi_rusak_sedang_pcs?: number;
  kondisi_rusak_berat_pcs?: number;
  catatan?: string;
  created_at?: string;
  last_inspected_at?: string;
  last_inspected_by?: string;
  last_inspected_status?: 'normal' | 'kendala';
  riwayat_alur?: Array<{
    id: string;
    tanggal: string;
    tipe_event: string;
    judul: string;
    deskripsi: string;
    aktor_nama: string;
    aktor_role: string;
    lokasi_asal?: string;
    lokasi_tujuan?: string;
    jumlah_pcs?: number;
    catatan?: string;
  }>;
}

export interface InspeksiMingguanLog {
  id: string;
  dapur_id: string;
  dapur_nama: string;
  pic_nama: string;
  tanggal_inspeksi: string;
  minggu_label: string;
  total_alat: number;
  total_normal: number;
  total_kendala: number;
  catatan?: string;
  items_status: Record<string, 'normal' | 'kendala'>;
  created_at: string;
}

