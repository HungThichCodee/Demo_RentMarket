import React, { useState } from 'react';
import { useCompleteBooking } from '../../hooks/useCompleteBooking';

// Component nút bấm Quyết toan (Hoàn tất đơn) dành cho Chủ đồ
const ButtonComplete = ({ bookingId, onCompleted }) => {
    const { completeBooking, isLoading } = useCompleteBooking();
    const [toast, setToast] = useState(null);

    const handleComplete = () => {
        completeBooking(
            bookingId,
            (res) => {
                setToast({ message: 'Đã hoàn tất đơn và nhận tiền 70% vào ví!', type: 'success' });
                if (onCompleted) {
                    setTimeout(() => onCompleted(bookingId), 2000); // Trigger update sau 2s
                }
            },
            (err) => {
                setToast({ message: err, type: 'error' });
                setTimeout(() => setToast(null), 3000); // Ẩn lỗi sau 3s
            }
        );
    };

    return (
        <div className="flex flex-col items-center">
            {/* Toast Message mô phỏng */}
            {toast && (
                <div className={`fixed top-4 right-4 p-4 rounded shadow-lg z-50 animate-fade-in ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {toast.message}
                </div>
            )}
            
            <button 
                onClick={handleComplete} 
                disabled={isLoading}
                className={`text-center py-2 px-6 rounded-lg font-bold text-sm transition-all cursor-pointer shadow-md flex items-center justify-center min-w-[160px] cursor-pointer
                    ${isLoading 
                        ? 'bg-gray-400 cursor-not-allowed text-gray-200' 
                        : 'bg-emerald-500 hover:bg-emerald-600 outline-none hover:shadow-lg hover:scale-[1.02] text-white active:scale-95'
                    }`}
            >
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Đang Khớp Lệnh...
                    </span>
                ) : (
                    <div className="flex flex-col items-center">
                        <span>Đã nhận lại đồ</span>
                        <span className="text-[10px] font-normal leading-tight opacity-90">(Quyết Toán 70/30)</span>
                    </div>
                )}
            </button>
        </div>
    );
};

export default ButtonComplete;
