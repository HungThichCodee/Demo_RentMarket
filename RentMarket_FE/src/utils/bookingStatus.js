export const BOOKING_STATUS = {
    PENDING_PAYMENT: 'PENDING_PAYMENT',
    PAID_WAITING_APPROVAL: 'PAID_WAITING_APPROVAL',
    APPROVED: 'APPROVED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED'
  };
  
  export const bookingStatusConfig = {
    [BOOKING_STATUS.PENDING_PAYMENT]: {
      label: 'Chờ thanh toán',
      color: 'bg-gray-100 text-gray-800 border-[0.5px] border-gray-200',
      icon: 'hourglass_empty',
      id: 'PENDING_PAYMENT'
    },
    [BOOKING_STATUS.PAID_WAITING_APPROVAL]: {
      label: 'Chờ chủ đồ duyệt',
      color: 'bg-orange-100 text-orange-800 border-[0.5px] border-orange-200',
      icon: 'sync',
      id: 'PAID_WAITING_APPROVAL'
    },
    [BOOKING_STATUS.APPROVED]: {
      label: 'Đã duyệt (Giao hàng)',
      color: 'bg-blue-100 text-blue-800 border-[0.5px] border-blue-200',
      icon: 'local_shipping',
      id: 'APPROVED'
    },
    [BOOKING_STATUS.IN_PROGRESS]: {
      label: 'Đang thuê',
      color: 'bg-purple-100 text-purple-800 border-[0.5px] border-purple-200',
      icon: 'timelapse',
      id: 'IN_PROGRESS'
    },
    [BOOKING_STATUS.COMPLETED]: {
      label: 'Đã hoàn tất',
      color: 'bg-emerald-100 text-emerald-800 border-[0.5px] border-emerald-200',
      icon: 'check_circle',
      id: 'COMPLETED'
    },
    [BOOKING_STATUS.REJECTED]: {
      label: 'Bị từ chối',
      color: 'bg-red-100 text-red-800 border-[0.5px] border-red-200',
      icon: 'cancel',
      id: 'REJECTED'
    },
    [BOOKING_STATUS.CANCELLED]: {
      label: 'Đã huỷ',
      color: 'bg-gray-100 text-gray-600 border-[0.5px] border-gray-300',
      icon: 'block',
      id: 'CANCELLED'
    }
  };