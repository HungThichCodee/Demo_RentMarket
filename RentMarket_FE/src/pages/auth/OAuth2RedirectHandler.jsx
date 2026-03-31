import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OAuth2RedirectHandler = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            // Lưu token JWT để cấp quyền tiếp theo
            localStorage.setItem('token', token);
            
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const scope = payload.scope || '';
                const isAdmin = scope.split(' ').includes('ROLE_ADMIN') || scope.split(' ').includes('ADMIN');
                navigate(isAdmin ? '/admin' : '/', { replace: true });
            } catch {
                navigate('/', { replace: true });
            }
        } else {
            navigate('/login', { replace: true });
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-center items-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1b64f2] rounded-full animate-spin mb-4" />
            <div className="text-lg text-slate-600 font-medium">Đang xử lý xác thực Google...</div>
        </div>
    );
};

export default OAuth2RedirectHandler;
