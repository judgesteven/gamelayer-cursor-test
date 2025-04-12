import { createContext, useContext, useState, useEffect } from 'react';
import { createPlayer } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signup = async (email, password, username) => {
    try {
      // Create a new player in GameLayer
      const playerData = {
        name: username,
        email: email,
        points: 0,
        credits: 0,
        level: 1
      };

      const newPlayer = await createPlayer(playerData);
      
      // Create user session
      const userSession = {
        id: newPlayer.id,
        email,
        username,
        points: 0,
        credits: 0,
        level: 1
      };

      localStorage.setItem('user', JSON.stringify(userSession));
      setUser(userSession);
      return userSession;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const login = (email, password) => {
    // In a real app, you would verify credentials with a backend
    // For now, we'll just check if the user exists in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.email === email) {
        setUser(userData);
        return userData;
      }
    }
    throw new Error('Invalid credentials');
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 