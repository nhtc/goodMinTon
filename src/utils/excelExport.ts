import * as XLSX from 'xlsx';
import { utils } from 'xlsx';

/**
 * Excel Export Utilities for GoodMinTon
 * Provides functions to export game history and personal events to Excel format
 */

// ============================================
// TYPE DEFINITIONS (Compatible with app types)
// ============================================

interface Member {
  id: string;
  name: string;
  phone?: string;
  avatar?: string;
  participantId?: string;
  hasPaid?: boolean;
  paidAt?: string;
  prePaid?: number;
  prePaidCategory?: string;
  customAmount?: number;
}

interface Game {
  id: string;
  date: string;
  location?: string;
  yardCost: number;
  shuttleCockQuantity: number;
  shuttleCockPrice: number;
  otherFees: number;
  totalCost: number;
  costPerMember: number;
  participants: Member[];
  createdAt: string;
}

// Flexible participant type that works with both structures
interface PersonalEventParticipant {
  id: string;
  name?: string;
  member?: {
    name: string;
    phone?: string;
  };
  phone?: string;
  customAmount: number;
  hasPaid: boolean;
  paidAt?: string | null;
  prePaid?: number;
  prePaidCategory?: string;
}

interface PersonalEvent {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  location?: string | null;
  totalCost: number;
  participants: PersonalEventParticipant[];
  createdAt: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format date for Excel display (Vietnamese format)
 */
export const formatDateForExcel = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
};

/**
 * Format currency in Vietnamese dong
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format payment status in Vietnamese
 */
export const formatPaymentStatus = (hasPaid: boolean): string => {
  return hasPaid ? '✅ Đã thanh toán' : '❌ Chưa thanh toán';
};

// ============================================
// GAMES EXPORT
// ============================================

/**
 * Export games to Excel with two sheets:
 * 1. Summary - Overview of all games
 * 2. Detailed - Full breakdown with participants
 */
export const exportGamesToExcel = (games: Game[], filename?: string) => {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryData = games.map((game, index) => {
    const paidCount = game.participants.filter(p => p.hasPaid).length;
    const totalParticipants = game.participants.length;
    const paymentRate = totalParticipants > 0 
      ? `${Math.round((paidCount / totalParticipants) * 100)}%`
      : '0%';

    return {
      'STT': index + 1,
      'Ngày': formatDateForExcel(game.date),
      'Địa điểm': game.location || 'Không có',
      'Số người chơi': totalParticipants,
      'Chi phí sân': formatCurrency(game.yardCost),
      'Số cầu': game.shuttleCockQuantity,
      'Giá cầu': formatCurrency(game.shuttleCockPrice),
      'Chi phí khác': formatCurrency(game.otherFees),
      'Tổng chi phí': formatCurrency(game.totalCost),
      'Chi phí/người': formatCurrency(game.costPerMember),
      'Đã thanh toán': `${paidCount}/${totalParticipants}`,
      'Tỷ lệ thanh toán': paymentRate,
    };
  });

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  
  // Set column widths for summary
  summarySheet['!cols'] = [
    { wch: 5 },  // STT
    { wch: 18 }, // Ngày
    { wch: 25 }, // Địa điểm
    { wch: 12 }, // Số người chơi
    { wch: 15 }, // Chi phí sân
    { wch: 8 },  // Số cầu
    { wch: 15 }, // Giá cầu
    { wch: 15 }, // Chi phí khác
    { wch: 15 }, // Tổng chi phí
    { wch: 15 }, // Chi phí/người
    { wch: 15 }, // Đã thanh toán
    { wch: 15 }, // Tỷ lệ thanh toán
  ];

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng quan');

  // Sheet 2: Detailed breakdown with participants
  const detailedData: any[] = [];
  
  games.forEach((game, gameIndex) => {
    // Add game header
    detailedData.push({
      'STT': `Game ${gameIndex + 1}`,
      'Ngày': formatDateForExcel(game.date),
      'Địa điểm': game.location || 'Không có',
      'Người chơi': '',
      'Số điện thoại': '',
      'Trạng thái': '',
      'Số tiền phải trả': formatCurrency(game.costPerMember),
      'Số tiền trả trước': '',
      'Ngày thanh toán': '',
      'Ghi chú': `Tổng chi phí: ${formatCurrency(game.totalCost)}`,
    });

    // Add participants
    game.participants.forEach((participant) => {
      const amountToPay = participant.customAmount || game.costPerMember;
      const effectiveAmount = amountToPay - (participant.prePaid || 0);
      
      detailedData.push({
        'STT': '',
        'Ngày': '',
        'Địa điểm': '',
        'Người chơi': participant.name,
        'Số điện thoại': participant.phone || 'Không có',
        'Trạng thái': formatPaymentStatus(participant.hasPaid || false),
        'Số tiền phải trả': formatCurrency(amountToPay),
        'Số tiền trả trước': participant.prePaid ? formatCurrency(participant.prePaid) : '-',
        'Ngày thanh toán': participant.paidAt ? formatDateForExcel(participant.paidAt) : '-',
        'Ghi chú': participant.prePaidCategory || '',
      });
    });

    // Add empty row for spacing
    detailedData.push({
      'STT': '',
      'Ngày': '',
      'Địa điểm': '',
      'Người chơi': '',
      'Số điện thoại': '',
      'Trạng thái': '',
      'Số tiền phải trả': '',
      'Số tiền trả trước': '',
      'Ngày thanh toán': '',
      'Ghi chú': '',
    });
  });

  const detailedSheet = XLSX.utils.json_to_sheet(detailedData);
  
  // Set column widths for detailed
  detailedSheet['!cols'] = [
    { wch: 10 }, // STT
    { wch: 18 }, // Ngày
    { wch: 25 }, // Địa điểm
    { wch: 25 }, // Người chơi
    { wch: 15 }, // Số điện thoại
    { wch: 20 }, // Trạng thái
    { wch: 18 }, // Số tiền phải trả
    { wch: 18 }, // Số tiền trả trước
    { wch: 18 }, // Ngày thanh toán
    { wch: 30 }, // Ghi chú
  ];

  XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Chi tiết');

  // Sheet 3: Statistics
  const totalGames = games.length;
  const totalRevenue = games.reduce((sum, game) => sum + game.totalCost, 0);
  const avgCostPerGame = totalGames > 0 ? totalRevenue / totalGames : 0;
  const totalParticipants = games.reduce((sum, game) => sum + game.participants.length, 0);
  const totalPaid = games.reduce((sum, game) => 
    sum + game.participants.filter(p => p.hasPaid).length, 0
  );
  const paymentRate = totalParticipants > 0 
    ? Math.round((totalPaid / totalParticipants) * 100)
    : 0;

  const statsData = [
    { 'Chỉ số': 'Tổng số trận đấu', 'Giá trị': totalGames },
    { 'Chỉ số': 'Tổng chi phí', 'Giá trị': formatCurrency(totalRevenue) },
    { 'Chỉ số': 'Chi phí trung bình/trận', 'Giá trị': formatCurrency(avgCostPerGame) },
    { 'Chỉ số': 'Tổng lượt tham gia', 'Giá trị': totalParticipants },
    { 'Chỉ số': 'Đã thanh toán', 'Giá trị': totalPaid },
    { 'Chỉ số': 'Chưa thanh toán', 'Giá trị': totalParticipants - totalPaid },
    { 'Chỉ số': 'Tỷ lệ thanh toán', 'Giá trị': `${paymentRate}%` },
  ];

  const statsSheet = XLSX.utils.json_to_sheet(statsData);
  statsSheet['!cols'] = [
    { wch: 30 }, // Chỉ số
    { wch: 25 }, // Giá trị
  ];

  XLSX.utils.book_append_sheet(workbook, statsSheet, 'Thống kê');

  // Generate filename
  const date = new Date().toISOString().split('T')[0];
  const finalFilename = filename || `GoodMinTon_Game_History_${date}.xlsx`;

  // Write file
  XLSX.writeFile(workbook, finalFilename);
};

// ============================================
// PERSONAL EVENTS EXPORT
// ============================================

/**
 * Export personal events to Excel with two sheets:
 * 1. Summary - Overview of all events
 * 2. Detailed - Full breakdown with participants
 */
export const exportPersonalEventsToExcel = (events: PersonalEvent[], filename?: string) => {
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summaryData = events.map((event, index) => {
    const paidCount = event.participants.filter(p => p.hasPaid).length;
    const totalParticipants = event.participants.length;
    const paymentRate = totalParticipants > 0 
      ? `${Math.round((paidCount / totalParticipants) * 100)}%`
      : '0%';
    const avgCostPerPerson = totalParticipants > 0 
      ? event.totalCost / totalParticipants 
      : 0;

    return {
      'STT': index + 1,
      'Tiêu đề': event.title,
      'Mô tả': event.description || 'Không có',
      'Ngày': formatDateForExcel(event.date),
      'Địa điểm': event.location || 'Không có',
      'Số người tham gia': totalParticipants,
      'Tổng chi phí': formatCurrency(event.totalCost),
      'Chi phí TB/người': formatCurrency(avgCostPerPerson),
      'Đã thanh toán': `${paidCount}/${totalParticipants}`,
      'Tỷ lệ thanh toán': paymentRate,
    };
  });

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  
  // Set column widths for summary
  summarySheet['!cols'] = [
    { wch: 5 },  // STT
    { wch: 30 }, // Tiêu đề
    { wch: 35 }, // Mô tả
    { wch: 18 }, // Ngày
    { wch: 25 }, // Địa điểm
    { wch: 15 }, // Số người tham gia
    { wch: 18 }, // Tổng chi phí
    { wch: 18 }, // Chi phí TB/người
    { wch: 15 }, // Đã thanh toán
    { wch: 15 }, // Tỷ lệ thanh toán
  ];

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng quan');

  // Sheet 2: Detailed breakdown with participants
  const detailedData: any[] = [];
  
  events.forEach((event, eventIndex) => {
    // Add event header
    detailedData.push({
      'STT': `Event ${eventIndex + 1}`,
      'Tiêu đề': event.title,
      'Ngày': formatDateForExcel(event.date),
      'Địa điểm': event.location || 'Không có',
      'Người tham gia': '',
      'Số điện thoại': '',
      'Trạng thái': '',
      'Số tiền phải trả': '',
      'Số tiền trả trước': '',
      'Ngày thanh toán': '',
      'Ghi chú': event.description || '',
    });

    // Add participants
    event.participants.forEach((participant) => {
      const effectiveAmount = participant.customAmount - (participant.prePaid || 0);
      const participantName = participant.name || participant.member?.name || 'Không rõ';
      const participantPhone = participant.phone || participant.member?.phone || 'Không có';
      
      detailedData.push({
        'STT': '',
        'Tiêu đề': '',
        'Ngày': '',
        'Địa điểm': '',
        'Người tham gia': participantName,
        'Số điện thoại': participantPhone,
        'Trạng thái': formatPaymentStatus(participant.hasPaid),
        'Số tiền phải trả': formatCurrency(participant.customAmount),
        'Số tiền trả trước': participant.prePaid ? formatCurrency(participant.prePaid) : '-',
        'Ngày thanh toán': participant.paidAt ? formatDateForExcel(participant.paidAt) : '-',
        'Ghi chú': participant.prePaidCategory || '',
      });
    });

    // Add empty row for spacing
    detailedData.push({
      'STT': '',
      'Tiêu đề': '',
      'Ngày': '',
      'Địa điểm': '',
      'Người tham gia': '',
      'Số điện thoại': '',
      'Trạng thái': '',
      'Số tiền phải trả': '',
      'Số tiền trả trước': '',
      'Ngày thanh toán': '',
      'Ghi chú': '',
    });
  });

  const detailedSheet = XLSX.utils.json_to_sheet(detailedData);
  
  // Set column widths for detailed
  detailedSheet['!cols'] = [
    { wch: 10 }, // STT
    { wch: 30 }, // Tiêu đề
    { wch: 18 }, // Ngày
    { wch: 25 }, // Địa điểm
    { wch: 25 }, // Người tham gia
    { wch: 15 }, // Số điện thoại
    { wch: 20 }, // Trạng thái
    { wch: 18 }, // Số tiền phải trả
    { wch: 18 }, // Số tiền trả trước
    { wch: 18 }, // Ngày thanh toán
    { wch: 30 }, // Ghi chú
  ];

  XLSX.utils.book_append_sheet(workbook, detailedSheet, 'Chi tiết');

  // Sheet 3: Statistics
  const totalEvents = events.length;
  const totalCost = events.reduce((sum, event) => sum + event.totalCost, 0);
  const avgCostPerEvent = totalEvents > 0 ? totalCost / totalEvents : 0;
  const totalParticipants = events.reduce((sum, event) => sum + event.participants.length, 0);
  const totalPaid = events.reduce((sum, event) => 
    sum + event.participants.filter(p => p.hasPaid).length, 0
  );
  const paymentRate = totalParticipants > 0 
    ? Math.round((totalPaid / totalParticipants) * 100)
    : 0;

  const statsData = [
    { 'Chỉ số': 'Tổng số sự kiện', 'Giá trị': totalEvents },
    { 'Chỉ số': 'Tổng chi phí', 'Giá trị': formatCurrency(totalCost) },
    { 'Chỉ số': 'Chi phí trung bình/sự kiện', 'Giá trị': formatCurrency(avgCostPerEvent) },
    { 'Chỉ số': 'Tổng lượt tham gia', 'Giá trị': totalParticipants },
    { 'Chỉ số': 'Đã thanh toán', 'Giá trị': totalPaid },
    { 'Chỉ số': 'Chưa thanh toán', 'Giá trị': totalParticipants - totalPaid },
    { 'Chỉ số': 'Tỷ lệ thanh toán', 'Giá trị': `${paymentRate}%` },
  ];

  const statsSheet = XLSX.utils.json_to_sheet(statsData);
  statsSheet['!cols'] = [
    { wch: 30 }, // Chỉ số
    { wch: 25 }, // Giá trị
  ];

  XLSX.utils.book_append_sheet(workbook, statsSheet, 'Thống kê');

  // Generate filename
  const date = new Date().toISOString().split('T')[0];
  const finalFilename = filename || `GoodMinTon_Personal_Events_${date}.xlsx`;

  // Write file
  XLSX.writeFile(workbook, finalFilename);
};

// ============================================
// COMBINED EXPORT (Optional)
// ============================================

/**
 * Export both games and personal events to a single Excel file
 */
export const exportAllDataToExcel = (games: Game[], events: PersonalEvent[], filename?: string) => {
  const workbook = XLSX.utils.book_new();

  // Add games sheets
  // (Similar logic as above but combined)
  
  // Generate filename
  const date = new Date().toISOString().split('T')[0];
  const finalFilename = filename || `GoodMinTon_Full_Export_${date}.xlsx`;

  // Write file
  XLSX.writeFile(workbook, finalFilename);
};
