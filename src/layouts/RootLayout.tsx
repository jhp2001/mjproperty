import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-slate-900 text-slate-400 py-12 text-center">
        <div className="container mx-auto px-4">
          <p className="text-xl font-bold text-white mb-4">MJ Properties</p>
          <p className="mb-4">Find the Right Property. Make the Right Move.</p>
          <p>&copy; 2026 MJ Properties. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default RootLayout;
