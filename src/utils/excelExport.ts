/**
 * Excel Export Utility for PIC Mobile
 * Generates and downloads .xlsx spreadsheets for offline archives & reporting
 */

import * as XLSX from 'xlsx';
import { PenerimaanBahanItem, LaporanKendalaDapur } from '../types';

const KATEGORI_KENDALA_LABELS: Record<string, string> = {
  bahan_luar_rab: 'Bahan Baku di Luar RAB',
  jadwal_waktu: 'Keterlambatan / Waktu Distribusi',
  kerusakan_alat: 'Kerusakan Peralatan Dapur',
  fasilitas_kurang: 'Fasilitas Dapur Kurang',
  lainnya: 'Lainnya'
};

const URGENSI_LABELS: Record<string, string> = {
  darurat: 'Darurat',
  sedang: 'Sedang',
  rendah: 'Rendah'
};

const STATUS_KENDALA_LABELS: Record<string, string> = {
  pending: 'Menunggu Tindak Lanjut',
  diproses: 'Sedang Diproses',
  selesai: 'Selesai Teratasi',
  ditolak: 'Ditolak / Arsip'
};

/**
 * Export list of Penerimaan Bahan Baku to .xlsx Excel spreadsheet
 */
export function exportPenerimaanToExcel(items: PenerimaanBahanItem[], dapurNama: string = 'SPPG'): boolean {
  if (!items || items.length === 0) {
    alert('Tidak ada data penerimaan bahan baku yang sesuai filter untuk diekspor.');
    return false;
  }

  try {
    const rows = items.map((item, idx) => ({
      'No': idx + 1,
      'ID Laporan': item.id,
      'Tanggal Tiba': item.tanggal,
      'Jam Tiba (WIB)': item.jam_sampai,
      'Tanggal Menu': item.tanggal_menu || '-',
      'Unit Dapur SPPG': item.dapur_nama || dapurNama,
      'Nama Bahan Baku': item.nama_bahan_baku,
      'Kategori': item.kategori || '-',
      'Mitra Supplier': item.nama_supplier,
      'Jumlah Netto': item.jumlah_sampai,
      'Satuan': item.satuan,
      'Suhu Cold Chain (°C)': item.suhu_celsius !== undefined ? item.suhu_celsius : '-',
      'Status Penerimaan': item.ada_retur ? 'ADA RETUR' : 'DITERIMA PENUH',
      'Jumlah Retur': item.ada_retur ? (item.jumlah_retur ?? 0) : 0,
      'Alasan Retur': item.alasan_retur || '-',
      'Jam Pengganti Tiba (WIB)': item.jam_sampai_retur || '-',
      'Petugas PIC': item.pic_nama,
      'Catatan / QC Mutu': item.catatan || '-',
      'Bukti Foto Drive': (item.foto_urls || []).join(' ; ')
    }));

    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Set column widths for readability
    worksheet['!cols'] = [
      { wch: 6 },   // No
      { wch: 22 },  // ID Laporan
      { wch: 14 },  // Tanggal Tiba
      { wch: 14 },  // Jam Tiba
      { wch: 14 },  // Tanggal Menu
      { wch: 24 },  // Unit Dapur SPPG
      { wch: 28 },  // Nama Bahan Baku
      { wch: 16 },  // Kategori
      { wch: 24 },  // Mitra Supplier
      { wch: 14 },  // Jumlah Netto
      { wch: 8 },   // Satuan
      { wch: 20 },  // Suhu Cold Chain
      { wch: 18 },  // Status Penerimaan
      { wch: 14 },  // Jumlah Retur
      { wch: 26 },  // Alasan Retur
      { wch: 22 },  // Jam Pengganti Tiba
      { wch: 20 },  // Petugas PIC
      { wch: 32 },  // Catatan QC
      { wch: 45 }   // Bukti Foto Drive
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Penerimaan Bahan Baku');

    const todayStr = new Date().toISOString().split('T')[0];
    const safeDapur = dapurNama.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Laporan_Penerimaan_Bahan_${safeDapur}_${todayStr}.xlsx`;

    XLSX.writeFile(workbook, filename);
    return true;
  } catch (err) {
    console.error('Gagal mengekspor data ke Excel:', err);
    alert('Terjadi kendala saat menghasilkan file Excel.');
    return false;
  }
}

/**
 * Export list of Laporan Kendala Dapur to .xlsx Excel spreadsheet
 */
export function exportKendalaToExcel(items: LaporanKendalaDapur[], dapurNama: string = 'SPPG'): boolean {
  if (!items || items.length === 0) {
    alert('Tidak ada data laporan kendala dapur untuk diekspor.');
    return false;
  }

  try {
    const rows = items.map((item, idx) => ({
      'No': idx + 1,
      'ID Kendala': item.id,
      'Waktu Pelaporan': item.created_at,
      'Unit Dapur': item.dapur_nama || dapurNama,
      'Petugas PIC': item.pic_nama,
      'Kategori Masalah': KATEGORI_KENDALA_LABELS[item.kategori] || item.kategori,
      'Tingkat Urgensi': URGENSI_LABELS[item.tingkat_urgensi] || item.tingkat_urgensi,
      'Judul Kendala': item.judul,
      'Deskripsi Rinci': item.deskripsi,
      'Tindakan Sementara PIC': item.tindakan_sementara || '-',
      'Estimasi Biaya (Rp)': item.estimasi_biaya || 0,
      'Status Penanganan': STATUS_KENDALA_LABELS[item.status] || item.status,
      'Tanggapan / Solusi Maker': item.tanggapan_maker || '-',
      'Ditindaklanjuti Oleh': item.ditindaklanjuti_oleh || '-',
      'Waktu Tindak Lanjut': item.ditindaklanjuti_pada || '-',
      'Bukti Foto Drive': (item.foto_urls || []).join(' ; ')
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

    worksheet['!cols'] = [
      { wch: 6 },   // No
      { wch: 22 },  // ID Kendala
      { wch: 22 },  // Waktu Pelaporan
      { wch: 24 },  // Unit Dapur
      { wch: 20 },  // Petugas PIC
      { wch: 26 },  // Kategori Masalah
      { wch: 16 },  // Tingkat Urgensi
      { wch: 32 },  // Judul Kendala
      { wch: 40 },  // Deskripsi Rinci
      { wch: 30 },  // Tindakan Sementara
      { wch: 18 },  // Estimasi Biaya
      { wch: 22 },  // Status Penanganan
      { wch: 35 },  // Tanggapan Maker
      { wch: 20 },  // Ditindaklanjuti Oleh
      { wch: 22 },  // Waktu Tindak Lanjut
      { wch: 45 }   // Bukti Foto Drive
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Kendala Dapur');

    const todayStr = new Date().toISOString().split('T')[0];
    const safeDapur = dapurNama.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Laporan_Kendala_Dapur_${safeDapur}_${todayStr}.xlsx`;

    XLSX.writeFile(workbook, filename);
    return true;
  } catch (err) {
    console.error('Gagal mengekspor laporan kendala ke Excel:', err);
    alert('Terjadi kendala saat menghasilkan file Excel.');
    return false;
  }
}

/**
 * Export both Penerimaan Bahan and Laporan Kendala in a single multi-sheet workbook
 */
export function exportAllToExcel(
  penerimaanItems: PenerimaanBahanItem[],
  kendalaItems: LaporanKendalaDapur[],
  dapurNama: string = 'SPPG'
): boolean {
  if ((!penerimaanItems || penerimaanItems.length === 0) && (!kendalaItems || kendalaItems.length === 0)) {
    alert('Tidak ada data penerimaan maupun kendala yang dapat diekspor.');
    return false;
  }

  try {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Penerimaan
    if (penerimaanItems && penerimaanItems.length > 0) {
      const rowsPenerimaan = penerimaanItems.map((item, idx) => ({
        'No': idx + 1,
        'ID Laporan': item.id,
        'Tanggal Tiba': item.tanggal,
        'Jam Tiba (WIB)': item.jam_sampai,
        'Tanggal Menu': item.tanggal_menu || '-',
        'Unit Dapur SPPG': item.dapur_nama || dapurNama,
        'Nama Bahan Baku': item.nama_bahan_baku,
        'Kategori': item.kategori || '-',
        'Mitra Supplier': item.nama_supplier,
        'Jumlah Netto': item.jumlah_sampai,
        'Satuan': item.satuan,
        'Suhu Cold Chain (°C)': item.suhu_celsius !== undefined ? item.suhu_celsius : '-',
        'Status Penerimaan': item.ada_retur ? 'ADA RETUR' : 'DITERIMA PENUH',
        'Jumlah Retur': item.ada_retur ? (item.jumlah_retur ?? 0) : 0,
        'Alasan Retur': item.alasan_retur || '-',
        'Jam Pengganti Tiba (WIB)': item.jam_sampai_retur || '-',
        'Petugas PIC': item.pic_nama,
        'Catatan / QC Mutu': item.catatan || '-',
        'Bukti Foto Drive': (item.foto_urls || []).join(' ; ')
      }));
      const wsPenerimaan = XLSX.utils.json_to_sheet(rowsPenerimaan);
      wsPenerimaan['!cols'] = [
        { wch: 6 }, { wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
        { wch: 24 }, { wch: 28 }, { wch: 16 }, { wch: 24 }, { wch: 14 },
        { wch: 8 }, { wch: 20 }, { wch: 18 }, { wch: 14 }, { wch: 26 },
        { wch: 22 }, { wch: 20 }, { wch: 32 }, { wch: 45 }
      ];
      XLSX.utils.book_append_sheet(workbook, wsPenerimaan, 'Penerimaan Bahan Baku');
    }

    // Sheet 2: Kendala Dapur
    if (kendalaItems && kendalaItems.length > 0) {
      const rowsKendala = kendalaItems.map((item, idx) => ({
        'No': idx + 1,
        'ID Kendala': item.id,
        'Waktu Pelaporan': item.created_at,
        'Unit Dapur': item.dapur_nama || dapurNama,
        'Petugas PIC': item.pic_nama,
        'Kategori Masalah': KATEGORI_KENDALA_LABELS[item.kategori] || item.kategori,
        'Tingkat Urgensi': URGENSI_LABELS[item.tingkat_urgensi] || item.tingkat_urgensi,
        'Judul Kendala': item.judul,
        'Deskripsi Rinci': item.deskripsi,
        'Tindakan Sementara PIC': item.tindakan_sementara || '-',
        'Estimasi Biaya (Rp)': item.estimasi_biaya || 0,
        'Status Penanganan': STATUS_KENDALA_LABELS[item.status] || item.status,
        'Tanggapan / Solusi Maker': item.tanggapan_maker || '-',
        'Ditindaklanjuti Oleh': item.ditindaklanjuti_oleh || '-',
        'Waktu Tindak Lanjut': item.ditindaklanjuti_pada || '-',
        'Bukti Foto Drive': (item.foto_urls || []).join(' ; ')
      }));
      const wsKendala = XLSX.utils.json_to_sheet(rowsKendala);
      wsKendala['!cols'] = [
        { wch: 6 }, { wch: 22 }, { wch: 22 }, { wch: 24 }, { wch: 20 },
        { wch: 26 }, { wch: 16 }, { wch: 32 }, { wch: 40 }, { wch: 30 },
        { wch: 18 }, { wch: 22 }, { wch: 35 }, { wch: 20 }, { wch: 22 },
        { wch: 45 }
      ];
      XLSX.utils.book_append_sheet(workbook, wsKendala, 'Laporan Kendala Dapur');
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const safeDapur = dapurNama.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Laporan_Terpadu_SPPG_${safeDapur}_${todayStr}.xlsx`;

    XLSX.writeFile(workbook, filename);
    return true;
  } catch (err) {
    console.error('Gagal mengekspor data gabungan ke Excel:', err);
    alert('Terjadi kendala saat menghasilkan file Excel gabungan.');
    return false;
  }
}
