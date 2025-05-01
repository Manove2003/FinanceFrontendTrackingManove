import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarComponent from './Sidebar';
import Navbar from './Navbar';
import Balance from './Balance';

const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-dark text-text-light font-poppins">
      <SidebarComponent />
      <div className="flex flex-col flex-1 ">
        <Navbar />
        <Balance/>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;