/**
 * Utility functions for date manipulation and Indonesian formatting
 * Designed for Bisukma Foundation SPPG Field Logistics
 * Rule R-02 compliant: Zero em-dashes
 */

export const getTodayDateStr = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getYesterdayDateStr = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTomorrowDateStr = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateIndo = (dateStr: string, options?: { withDayName?: boolean }): string => {
  if (!dateStr) return '';
  try {
    const [yearStr, monthStr, dayStr] = dateStr.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);
    const dateObj = new Date(year, month, day);

    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const dayName = dayNames[dateObj.getDay()];
    const monthName = monthNames[month] || '';

    if (options?.withDayName === false) {
      return `${day} ${monthName} ${year}`;
    }
    return `${dayName}, ${day} ${monthName} ${year}`;
  } catch {
    return dateStr;
  }
};

export const getDateStatusLabel = (dateStr: string): { label: string; isHMinusOne: boolean; isPast: boolean; isToday: boolean } => {
  const today = getTodayDateStr();
  const yesterday = getYesterdayDateStr();

  if (dateStr === today) {
    return { label: 'Hari Ini', isHMinusOne: false, isPast: false, isToday: true };
  }
  if (dateStr === yesterday) {
    return { label: 'Kemarin (H-1 Menu)', isHMinusOne: true, isPast: true, isToday: false };
  }
  if (dateStr < yesterday) {
    return { label: 'Input Susulan', isHMinusOne: false, isPast: true, isToday: false };
  }
  return { label: 'Mendatang', isHMinusOne: false, isPast: false, isToday: false };
};
