import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Building, Menu, X, User as UserIcon } from 'lucide-react';
import AuthModal from './AuthModal';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-900">
            <Building className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold tracking-tight">MJ Properties</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-slate-600 hover:text-blue-600 font-medium">Home</Link>
            <Link to="/properties" className="text-slate-600 hover:text-blue-600 font-medium">Properties</Link>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">
                <Link 
                  to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                  className="flex items-center gap-2 text-slate-700 hover:text-blue-600 font-medium"
                >
                  <UserIcon className="h-5 w-5" />
                  <span>{user?.name}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="ml-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors"
              >
                Login / Sign Up
              </button>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 p-4 flex flex-col gap-4 shadow-lg absolute w-full">
            <Link to="/" className="text-slate-700 font-medium p-2 hover:bg-slate-50 rounded" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/properties" className="text-slate-700 font-medium p-2 hover:bg-slate-50 rounded" onClick={() => setIsMenuOpen(false)}>Properties</Link>
            
            {isAuthenticated ? (
              <>
                <div className="border-t border-slate-100 my-2"></div>
                <Link 
                  to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                  className="text-slate-700 font-medium p-2 hover:bg-slate-50 rounded flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserIcon className="h-5 w-5" />
                  {user?.name} Dashboard
                </Link>
                <button 
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="text-left text-red-600 font-medium p-2 hover:bg-red-50 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <button 
                onClick={() => { setIsAuthModalOpen(true); setIsMenuOpen(false); }}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg mt-2"
              >
                Login / Sign Up
              </button>
            )}
          </div>
        )}
      </nav>

      {isAuthModalOpen && (
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      )}
    </>
  );
};

export default Navbar;
