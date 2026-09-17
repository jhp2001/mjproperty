import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  
  const [mobile, setMobile] = useState('');
  const [step, setStep] = useState<'mobile' | 'otp' | 'register'>('mobile');
  const [otp, setOtp] = useState('');
  
  // Registration fields
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('buyer');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mobile.length < 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    // Simulate sending OTP
    setStep('otp');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Attempt login first
    const success = await login(mobile, otp);
    setIsLoading(false);
    
    if (success) {
      onClose();
    } else {
      // If login fails, check if OTP is correct ('123456') but user not found
      if (otp === '123456') {
        setStep('register');
      } else {
        setError('Invalid OTP. Use 123456 for demo.');
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    
    setIsLoading(true);
    const success = await register(name, mobile, role, otp);
    setIsLoading(false);
    
    if (success) {
      onClose();
    } else {
      setError('Registration failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {step === 'register' ? 'Complete Profile' : 'Welcome to MJ Properties'}
          </h2>
          <p className="text-slate-500 mb-6">
            {step === 'mobile' && 'Enter your mobile number to continue'}
            {step === 'otp' && `Enter the OTP sent to ${mobile}`}
            {step === 'register' && 'New mobile number detected. How do you want to use our platform?'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          {step === 'mobile' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-slate-300"
                    placeholder="9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Get OTP
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Enter OTP (Use 123456)</label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center tracking-widest text-lg"
                  placeholder="------"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <div className="text-center">
                <button type="button" onClick={() => setStep('mobile')} className="text-sm text-blue-600 hover:underline">
                  Change Mobile Number
                </button>
              </div>
            </form>
          )}

          {step === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-3 pt-2">
                <label className="block text-sm font-medium text-slate-700">I am a:</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('buyer')}
                    className={`py-3 px-4 border rounded-lg text-center transition-colors ${
                      role === 'buyer' 
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium ring-1 ring-blue-600' 
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('broker')}
                    className={`py-3 px-4 border rounded-lg text-center transition-colors ${
                      role === 'broker' 
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium ring-1 ring-blue-600' 
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    Broker
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 mt-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
