import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

// Rate limiting configuration
const RATE_LIMIT = {
  maxAttempts: 5,
  timeWindow: 5 * 60 * 1000, // 5 minutes
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [signInAttempts, setSignInAttempts] = useState([]);

  // Clean up old attempts
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setSignInAttempts(prev => prev.filter(time => now - time < RATE_LIMIT.timeWindow));
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const checkRateLimit = () => {
    const now = Date.now();
    const recentAttempts = signInAttempts.filter(time => now - time < RATE_LIMIT.timeWindow);
    
    if (recentAttempts.length >= RATE_LIMIT.maxAttempts) {
      throw new Error('Too many sign-in attempts. Please try again later.');
    }
    
    setSignInAttempts([...recentAttempts, now]);
  };

  const signup = async (email, password) => {
    try {
      await checkRateLimit();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setError(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      await checkRateLimit();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setError(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setError(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
} 