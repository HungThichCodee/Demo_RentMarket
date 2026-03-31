import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const MainLayout = () => (
  <div className="relative flex min-h-screen w-full flex-col bg-[#f8f9fa] text-slate-900">
    <Header />
    <main className="flex-1 flex flex-col w-full">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default MainLayout;
