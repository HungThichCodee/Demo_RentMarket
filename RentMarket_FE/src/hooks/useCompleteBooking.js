import { useState } from 'react';
import axios from 'axios';

export const useCompleteBooking = () => {
    const [isLoading, setIsLoading] = useState(false);

    const completeBooking = async (bookingId, onSuccess, onError) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Assuming API Gateway is at localhost:8080 or rental-service is configured
            const response = await axios.put(`http://localhost:8080/rental/bookings/${bookingId}/complete`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (onSuccess) onSuccess(response.data);
        } catch (error) {
            if (onError) onError(error.response?.data?.message || 'Lỗi hệ thống');
        } finally {
            setIsLoading(false);
        }
    };

    return { completeBooking, isLoading };
};
