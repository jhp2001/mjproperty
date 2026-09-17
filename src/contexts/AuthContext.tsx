import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (mobile: string, otp: string) => Promise<boolean>;
  register: (name: string, mobile: string, role: Role, otp: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// For MVP, we use localStorage to persist mock users
const MOCK_USERS_KEY = 'mj_properties_users';
const CURRENT_USER_KEY = 'mj_properties_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize admin if not exists
    const usersJson = localStorage.getItem(MOCK_USERS_KEY);
    let users: User[] = usersJson ? JSON.parse(usersJson) : [];
    
    if (!users.find(u => u.role === 'admin')) {
      users.push({
        id: 'admin-1',
        name: 'Admin',
        mobile: '9999999999',
        role: 'admin',
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
    }

    // Load current user session
    const currentUserJson = localStorage.getItem(CURRENT_USER_KEY);
    if (currentUserJson) {
      setUser(JSON.parse(currentUserJson));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (mobile: string, otp: string): Promise<boolean> => {
    // In mock: OTP is always '123456'
    if (otp !== '123456') return false;

    const usersJson = localStorage.getItem(MOCK_USERS_KEY);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    
    const foundUser = users.find(u => u.mobile === mobile);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = async (name: string, mobile: string, role: Role, otp: string): Promise<boolean> => {
    if (otp !== '123456') return false;

    const usersJson = localStorage.getItem(MOCK_USERS_KEY);
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    
    if (users.find(u => u.mobile === mobile)) {
      return false; // Already exists
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      mobile,
      role,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
    
    setUser(newUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
