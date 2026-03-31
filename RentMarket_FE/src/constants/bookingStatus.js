// ==========================================
// Booking Status constants — đồng bộ với BookingStatus.java
// State Machine: PENDING_PAYMENT → PAID_WAITING_APPROVAL → APPROVED → IN_PROGRESS → COMPLETED / CANCELLED / REJECTED
// ==========================================

export const BOOKING_STATUS = {
  PENDING_PAYMENT:       'PENDING_PAYMENT',
  PAID_WAITING_APPROVAL: 'PAID_WAITING_APPROVAL',
  APPROVED:              'APPROVED',
  IN_PROGRESS:           'IN_PROGRESS',
  COMPLETED:             'COMPLETED',
  CANCELLED:             'CANCELLED',
  REJECTED:              'REJECTED',
};

export const BOOKING_STATUS_LABEL = {
  [BOOKING_STATUS.PENDING_PAYMENT]:       'Chờ thanh toán',
  [BOOKING_STATUS.PAID_WAITING_APPROVAL]: 'Đã thanh toán – Chờ duyệt',
  [BOOKING_STATUS.APPROVED]:              'Chủ đồ đã duyệt',
  [BOOKING_STATUS.IN_PROGRESS]:           'Đang thuê',
  [BOOKING_STATUS.COMPLETED]:             'Hoàn tất',
  [BOOKING_STATUS.CANCELLED]:             'Đã huỷ',
  [BOOKING_STATUS.REJECTED]:              'Bị từ chối',
};

export const BOOKING_STATUS_COLOR = {
  [BOOKING_STATUS.PENDING_PAYMENT]:       'bg-orange-50 text-orange-600 border border-orange-100',
  [BOOKING_STATUS.PAID_WAITING_APPROVAL]: 'bg-amber-50 text-amber-600 border border-amber-100',
  [BOOKING_STATUS.APPROVED]:              'bg-emerald-50 text-emerald-600 border border-emerald-100',
  [BOOKING_STATUS.IN_PROGRESS]:           'bg-blue-50 text-[#1b64f2] border border-blue-100',
  [BOOKING_STATUS.COMPLETED]:             'bg-purple-50 text-purple-600 border border-purple-100',
  [BOOKING_STATUS.CANCELLED]:             'bg-slate-50 text-slate-500 border border-gray-200',
  [BOOKING_STATUS.REJECTED]:              'bg-red-50 text-red-600 border border-red-100',
};

export const BOOKING_STATUS_OPTIONS = [
  { value: '',                                    label: 'Tất cả' },
  { value: BOOKING_STATUS.PENDING_PAYMENT,        label: 'Chờ thanh toán' },
  { value: BOOKING_STATUS.PAID_WAITING_APPROVAL,  label: 'Đã thanh toán – Chờ duyệt' },
  { value: BOOKING_STATUS.APPROVED,               label: 'Chủ đồ đã duyệt' },
  { value: BOOKING_STATUS.IN_PROGRESS,            label: 'Đang thuê' },
  { value: BOOKING_STATUS.COMPLETED,              label: 'Hoàn tất' },
  { value: BOOKING_STATUS.CANCELLED,              label: 'Đã huỷ' },
  { value: BOOKING_STATUS.REJECTED,               label: 'Bị từ chối' },
];
