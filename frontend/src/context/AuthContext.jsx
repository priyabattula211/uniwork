import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('uniworkToken');

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/users/me')
      .then((response) => setUser(response.data.profile))
      .catch(() => {
        localStorage.removeItem('uniworkToken');
      })
      .finally(() => setLoading(false));
  }, []);

  async function authenticate(endpoint, payload) {
    const response = await api.post(endpoint, payload);
    localStorage.setItem('uniworkToken', response.data.token);
    setUser(response.data.user);
    return response.data.user;
  }

  async function login(email, password) {
    return authenticate('/auth/login', { email, password });
  }

  async function signup(payload) {
    return authenticate('/auth/signup', payload);
  }

  function logout() {
    localStorage.removeItem('uniworkToken');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}