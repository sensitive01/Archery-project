import React, { createContext, useState, useContext, useEffect } from "react";
import { loginUser, registerUser } from "../services/authService";
import { getStudent } from "../services/userService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('authUserId');
    if (token && userId) {
      // fetch fresh user data
      getStudent(userId).then((data) => {
        setUser(data);
        setLoading(false);
      }).catch((err) => {
        console.error('Failed to fetch user data:', err);
        // clear invalid auth
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUserId');
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const data = await loginUser(email, password);
      setUser(data);
      if (data && data.token && data._id) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('authUserId', data._id);
      }
      return { success: true, user: data };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        errorType: error.errorType,
      };
    }
  };

  const register = async (firstName, lastName, email, password) => {
    try {
      const { ok, data } = await registerUser({
        firstName,
        lastName,
        email,
        password,
      });
      if (!ok) {
        throw new Error(data.message || "Registration failed");
      }
      setUser(data);
      if (data && data.token && data._id) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('authUserId', data._id);
      }
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUserId');
  };

  const loginWithUserData = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, token: localStorage.getItem('authToken'), login, register, logout, loading, loginWithUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
