import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  setupRecaptcha: (containerId: string) => void;
  sendOtp: (mobile: string) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<{ success: boolean; isNewUser?: boolean }>;
  completeRegistration: (name: string, role: Role) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Fetch user details from Firestore
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          // User is authenticated but profile is not completed
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setupRecaptcha = (containerId: string) => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
      });
    }
  };

  const sendOtp = async (mobile: string): Promise<boolean> => {
    setError(null);
    try {
      const appVerifier = (window as any).recaptchaVerifier;
      if (!appVerifier) throw new Error("Recaptcha not initialized");
      
      const phoneNumber = `+91${mobile}`;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      return true;
    } catch (err: any) {
      setError(err.message);
      // Reset recaptcha if there's an error
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.render().then((widgetId: any) => {
          (window as any).grecaptcha.reset(widgetId);
        });
      }
      return false;
    }
  };

  const verifyOtp = async (otp: string): Promise<{ success: boolean; isNewUser?: boolean }> => {
    setError(null);
    try {
      if (!confirmationResult) throw new Error("No OTP requested");
      
      const result = await confirmationResult.confirm(otp);
      const fbUser = result.user;
      
      // Check if user exists in DB
      const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
      if (userDoc.exists()) {
        setUser(userDoc.data() as User);
        return { success: true, isNewUser: false };
      } else {
        // DB entry doesn't exist, need to complete registration
        setFirebaseUser(fbUser);
        return { success: true, isNewUser: true };
      }
    } catch (err: any) {
      setError(err.message);
      return { success: false };
    }
  };

  const completeRegistration = async (name: string, role: Role): Promise<boolean> => {
    setError(null);
    try {
      if (!firebaseUser) throw new Error("Not authenticated");
      
      // Extract mobile from the Firebase User's phone number, removing +91
      const fullPhone = firebaseUser.phoneNumber || "";
      const mobile = fullPhone.startsWith('+91') ? fullPhone.substring(3) : fullPhone;

      const newUser: User = {
        id: firebaseUser.uid,
        name,
        mobile,
        role,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      setUser(newUser);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      setupRecaptcha,
      sendOtp, 
      verifyOtp, 
      completeRegistration, 
      logout, 
      isLoading, 
      error 
    }}>
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
