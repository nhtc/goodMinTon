/**
 * Centralized text constants for the Badminton Management System
 * This file contains all hardcoded Vietnamese text used throughout the application
 * 
 * Organization:
 * - common: Shared text across components
 * - forms: Form-related text (labels, placeholders, validation)
 * - pages: Page-specific text
 * - components: Component-specific text
 * - messages: Success/error/info messages
 * - navigation: Menu and navigation items
 */

export const TEXT_CONSTANTS = {
  // Common shared text
  common: {
    actions: {
      create: "Tạo mới",
      edit: "Chỉnh sửa", 
      update: "Cập nhật",
      delete: "Xóa",
      cancel: "Hủy",
      save: "Lưu",
      submit: "Gửi",
      confirm: "Xác nhận",
      close: "Đóng",
      back: "Quay lại",
      next: "Tiếp theo",
      previous: "Trước",
      search: "Tìm kiếm",
      filter: "Lọc",
      sort: "Sắp xếp",
      export: "Xuất",
      import: "Nhập",
      refresh: "Làm mới",
      loading: "Đang tải...",
      viewDetails: "Xem chi tiết",
      selectAll: "Chọn tất cả",
      clearAll: "Bỏ chọn tất cả"
    },
    labels: {
      name: "Tên",
      date: "Ngày",
      time: "Thời gian", 
      location: "Địa điểm",
      cost: "Chi phí",
      total: "Tổng cộng",
      quantity: "Số lượng",
      price: "Giá",
      member: "Thành viên",
      members: "Thành viên",
      status: "Trạng thái",
      description: "Mô tả",
      note: "Ghi chú",
      phone: "Số điện thoại",
      email: "Email",
      address: "Địa chỉ",
      amount: "Số tiền",
      paid: "Đã thanh toán",
      unpaid: "Chưa thanh toán",
      active: "Hoạt động",
      inactive: "Không hoạt động"
    },
    messages: {
      required: "Trường này là bắt buộc",
      invalid: "Dữ liệu không hợp lệ",
      success: "Thành công",
      error: "Có lỗi xảy ra",
      warning: "Cảnh báo",
      info: "Thông tin",
      confirm: "Bạn có chắc chắn không?",
      noData: "Không có dữ liệu",
      loading: "Đang tải...",
      saving: "Đang lưu...",
      deleting: "Đang xóa...",
      updating: "Đang cập nhật...",
      creating: "Đang tạo..."
    }
  },

  // Game/Match related text
  game: {
    titles: {
      createGame: "Tạo Trận Đấu Mới", 
      editGame: "Chỉnh Sửa Trận Đấu",
      gameHistory: "Lịch Sử Trận Đấu",
      gameDetails: "Chi Tiết Trận Đấu"
    },
    form: {
      labels: {
        gameDate: "Ngày chơi",
        gameLocation: "Địa điểm chơi", 
        yardCost: "Chi phí thuê sân",
        shuttleCockCost: "Chi phí cầu lông",
        shuttleCockQuantity: "Số lượng cầu",
        shuttleCockPrice: "Giá cầu lông",
        otherFees: "Chi phí khác",
        totalCost: "Tổng chi phí",
        participants: "Thành viên tham gia",
        costPerMember: "Chi phí/người",
        customAmount: "Số tiền tùy chỉnh",
        prepaidAmount: "Số tiền trả trước",
        prepaidCategory: "Loại trả trước"
      },
      placeholders: {
        selectDate: "Chọn ngày chơi",
        enterLocation: "Nhập địa điểm hoặc chọn từ danh sách",
        alternativeLocation: "Hoặc nhập địa điểm khác...",
        enterCost: "Nhập chi phí",
        enterQuantity: "Nhập số lượng",
        searchMembers: "Tìm kiếm thành viên...",
        enterAmount: "Nhập số tiền",
        enterNote: "Nhập ghi chú..."
      },
      sections: {
        basicInfo: {
          title: "Thông Tin Cơ Bản",
          description: "Cho chúng mình biết khi nào và ở đâu bạn chơi nhé!"
        },
        costs: {
          title: "Chi Phí Trận Đấu", 
          description: "Nhập các khoản chi phí cho trận đấu này"
        },
        members: {
          title: "Thành Viên Tham Gia",
          description: "Chọn những người bạn sẽ tham gia trận đấu"
        },
        payment: {
          title: "Thông Tin Thanh Toán",
          description: "Quản lý thanh toán cho từng thành viên"
        },
        summary: {
          title: "Tóm Tắt Trận Đấu",
          description: "Xem lại thông tin trước khi lưu"
        }
      },
      buttons: {
        record: "Ghi nhận trận đấu",
        update: "Cập nhật trận đấu", 
        calculating: "Đang tính toán...",
        recording: "Đang ghi nhận...",
        updating: "Đang cập nhật..."
      },
      presets: {
        locations: {
          title: "Địa điểm thường chơi"
        },
        costs: {
          yardCost: "Giá sân phổ biến",
          shuttleCock: "Loại cầu lông"
        }
      }
    },
    validation: {
      dateRequired: () => "Vui lòng chọn ngày chơi",
      dateFuture: () => "Ngày trận đấu không thể là tương lai",
      dateTooOld: () => "Ngày trận đấu không thể quá 1 năm trước",
      locationRequired: () => "Địa điểm thi đấu là bắt buộc",
      locationTooShort: () => "Địa điểm phải có ít nhất 3 ký tự",
      yardCostNegative: () => "Chi phí sân không được âm",
      yardCostTooHigh: () => "Chi phí sân quá cao (tối đa 1,000,000đ)",
      shuttleQuantityNegative: () => "Số lượng cầu không được âm",
      shuttleCockQuantityNegative: () => "Số lượng cầu không được âm",
      shuttleQuantityTooMany: () => "Số lượng cầu quá nhiều (tối đa 20 quả)",
      shuttleCockQuantityTooHigh: () => "Số lượng cầu quá nhiều (tối đa 20 quả)",
      shuttlePriceNegative: () => "Giá cầu không được âm",
      shuttlePriceTooHigh: () => "Giá cầu quá cao (tối đa 100,000đ/quả)",
      otherFeesRequired: () => "Chi phí khác là bắt buộc",
      otherFeesTooHigh: () => "Chi phí khác quá cao (tối đa 500,000đ)",
      tooManyMembers: () => "Số lượng thành viên quá nhiều (tối đa 20 người)",
      noMembersSelected: () => "Vui lòng chọn ít nhất 1 thành viên",
      totalCostInvalid: () => "Tổng chi phí phải lớn hơn 0"
    },
    messages: {
      createSuccess: "🎉 Ghi nhận trận đấu thành công!",
      updateSuccess: "🎉 Cập nhật trận đấu thành công!",
      deleteSuccess: "Xóa trận đấu thành công",
      deleteConfirm: "Bạn có chắc chắn muốn xóa trận đấu này?",
      validationSummary: "Vui lòng kiểm tra các lỗi sau:",
      goToFirstError: "📍 Đi đến lỗi đầu tiên"
    },
    stats: {
      totalGames: "Tổng trận đấu",
      totalCost: "Tổng chi phí",
      averageCost: "Chi phí trung bình",
      participantsCount: "người tham gia",
      costBreakdown: "Chi tiết chi phí",
      paymentStatus: "Tình hình thanh toán"
    }
  },

  // Member management text
  member: {
    titles: {
      memberManagement: "Quản lý Thành viên",
      memberList: "Danh sách Thành viên", 
      addMember: "Thêm Thành viên Mới",
      editMember: "Chỉnh sửa thành viên",
      memberDetails: "Chi tiết thành viên"
    },
    form: {
      labels: {
        memberName: "Tên thành viên",
        memberPhone: "Số điện thoại",
        memberEmail: "Email",
        memberStatus: "Trạng thái",
        memberAvatar: "Ảnh đại diện",
        joinDate: "Ngày tham gia"
      },
      placeholders: {
        enterName: "Nhập tên thành viên",
        enterPhone: "Nhập số điện thoại",
        enterEmail: "Nhập địa chỉ email"
      }
    },
    validation: {
      nameRequired: "Tên thành viên là bắt buộc",
      nameTooShort: "Tên phải có ít nhất 2 ký tự",
      phoneInvalid: "Số điện thoại không hợp lệ",
      emailInvalid: "Email không hợp lệ"
    },
    messages: {
      addSuccess: "Thêm thành viên thành công",
      updateSuccess: "Cập nhật thành viên thành công", 
      deleteSuccess: "Xóa thành viên thành công",
      deleteConfirm: "Bạn có chắc chắn muốn xóa thành viên này?"
    },
    stats: {
      totalMembers: "Tổng thành viên",
      activeMembers: "Thành viên tích cực",
      inactiveMembers: "Thành viên không hoạt động",
      newThisMonth: "Mới tháng này"
    }
  },

  // Payment related text
  payment: {
    titles: {
      paymentManagement: "Quản lý Thanh Toán",
      paymentHistory: "Lịch sử thanh toán",
      memberPayments: "Thanh toán thành viên"
    },
    form: {
      labels: {
        paymentAmount: "Số tiền thanh toán",
        paymentDate: "Ngày thanh toán",
        paymentMethod: "Phương thức thanh toán",
        paymentNote: "Ghi chú thanh toán"
      }
    },
    status: {
      paid: "Đã thanh toán",
      unpaid: "Chưa thanh toán", 
      partial: "Thanh toán một phần",
      overpaid: "Thanh toán thừa"
    },
    messages: {
      paymentSuccess: "Thanh toán thành công",
      paymentError: "Có lỗi trong quá trình thanh toán",
      insufficientAmount: "Thông tin thiếu",
      noPaymentRequired: "Thành viên không có khoản nào cần thanh toán"
    }
  },

  // Personal Event related text
  personalEvent: {
    titles: {
      personalTracking: "Theo dõi cá nhân",
      createEvent: "Tạo sự kiện mới",
      editEvent: "Chỉnh Sửa Sự Kiện",
      createNewEvent: "Tạo Sự Kiện Mới",
      eventDetails: "Chi tiết sự kiện"
    },
    form: {
      placeholders: {
        searchEvent: "Tìm kiếm theo tên sự kiện, mô tả hoặc tên thành viên...",
        selectPaymentStatus: "Chọn trạng thái thanh toán",
        startDate: "Từ ngày",
        endDate: "Đến ngày"
      }
    },
    filters: {
      paymentStatus: {
        all: "Tất cả",
        paid: "Đã thanh toán",
        unpaid: "Chưa thanh toán"
      }
    },
    messages: {
      eventDeleted: "Sự kiện đã được xóa thành công",
      eventUpdated: "Sự kiện đã được cập nhật thành công", 
      eventCreated: "Sự kiện đã được tạo thành công",
      deleteError: "Có lỗi xảy ra khi xóa sự kiện",
      saveError: "Có lỗi xảy ra khi lưu sự kiện",
      noPermissionPayment: "Bạn không có quyền thay đổi trạng thái thanh toán",
      paymentStatusUpdated: "Trạng thái thanh toán đã được cập nhật",
      paymentUpdateError: "Không thể cập nhật trạng thái thanh toán",
      noEventsFound: "Chưa có sự kiện nào",
      noEventsFoundFiltered: "Không tìm thấy sự kiện nào",
      createFirstEvent: "Hãy tạo sự kiện cá nhân đầu tiên của bạn!",
      tryDifferentSearch: "Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc"
    },
    confirmations: {
      deleteEvent: "Xóa sự kiện",
      deleteEventMessage: "Tất cả dữ liệu thanh toán sẽ bị mất và không thể khôi phục.",
      confirmDelete: "Xóa sự kiện",
      cancelDelete: "Hủy bỏ"
    }
  },

  // Navigation and menu items
  navigation: {
    main: {
      dashboard: "Tổng quan",
      games: "Trận đấu",
      members: "Thành viên", 
      payments: "Thanh toán",
      history: "Lịch sử",
      personalTracking: "Theo dõi cá nhân",
      settings: "Cài đặt"
    },
    breadcrumbs: {
      home: "Trang chủ",
      back: "Quay lại"
    }
  },

  // Tips and help text
  tips: {
    forms: {
      gameForm: "💡 Kiểm tra kỹ thông tin trước khi gửi nhé!",
      dataSecure: "🔒 Dữ liệu của bạn được lưu trữ an toàn",
      locationTip: "💡 Ghi rõ tên sân để lần sau dễ nhớ nha!"
    }
  },

  // Date and time formats
  formats: {
    dateShort: "dd/MM/yyyy",
    dateLong: "DD/MM/YYYY HH:mm",
    currency: "đ",
    currencySymbol: "₫"
  }
} as const;

// Type definitions for text constants
export type TextConstants = typeof TEXT_CONSTANTS;
export type TextPath = string;

// Helper function to get nested text values safely
export function getText(path: string, constants: any = TEXT_CONSTANTS): string {
  const keys = path.split('.');
  let current = constants;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      console.warn(`Text constant not found: ${path}`);
      return path; // Return path as fallback
    }
  }
  
  return typeof current === 'string' ? current : path;
}

// Convenience functions for common text patterns
export const t = {
  // Game related shortcuts
  game: {
    create: () => getText('game.titles.createGame'),
    edit: () => getText('game.titles.editGame'),
    record: () => getText('game.form.buttons.record'),
    update: () => getText('game.form.buttons.update'),
  },
  
  // Member related shortcuts
  member: {
    manage: () => getText('member.titles.memberManagement'),
    list: () => getText('member.titles.memberList'),
    add: () => getText('member.titles.addMember'),
  },
  
  // Common actions
  action: {
    create: () => getText('common.actions.create'),
    edit: () => getText('common.actions.edit'),
    delete: () => getText('common.actions.delete'),
    save: () => getText('common.actions.save'),
    cancel: () => getText('common.actions.cancel'),
  },
  
  // Common labels
  label: {
    name: () => getText('common.labels.name'),
    date: () => getText('common.labels.date'),
    location: () => getText('common.labels.location'),
    cost: () => getText('common.labels.cost'),
    members: () => getText('common.labels.members'),
  }
};

export default TEXT_CONSTANTS;