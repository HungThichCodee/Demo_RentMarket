import { Component } from 'react';

class DashboardErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[DashboardErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-red-500 text-[32px]">
              error
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Đã xảy ra lỗi không mong muốn
          </h2>
          <p className="text-sm text-slate-500 mb-6 max-w-md">
            {this.state.error?.message || 'Vui lòng tải lại trang hoặc liên hệ quản trị viên.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Tải lại trang
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DashboardErrorBoundary;
