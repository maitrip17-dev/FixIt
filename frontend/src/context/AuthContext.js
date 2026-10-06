import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on application load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Verify token validity with the server in the background
          const response = await api.get('/auth/me');
          if (response.data?.user) {
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
        } catch (error) {
          console.warn('Stored session invalid or expired, resetting session.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Log in user
   * @param {string} email
   * @param {string} password
   */
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = response.data;

    // Save to state
    setToken(receivedToken);
    setUser(receivedUser);

    // Persist in localStorage
    localStorage.setItem('token', receivedToken);
    localStorage.setItem('user', JSON.stringify(receivedUser));

    return response.data;
  };

  /**
   * Register a new user
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @param {string} role
   */
  const register = async (name, email, password, role = 'user', skillCategory = 'Other', city = 'Other') => {
    const response = await api.post('/auth/register', { name, email, password, role, skillCategory, city });
    const { token: receivedToken, user: receivedUser } = response.data;

    // Save to state
    setToken(receivedToken);
    setUser(receivedUser);

    // Persist in localStorage
    localStorage.setItem('token', receivedToken);
    localStorage.setItem('user', JSON.stringify(receivedUser));

    return response.data;
  };

  /**
   * Log out current user and clear stored credentials
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
