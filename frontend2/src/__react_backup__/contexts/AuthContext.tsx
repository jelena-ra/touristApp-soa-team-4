import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, User, LoginForm, RegisterForm } from '@/types';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginForm) => Promise<boolean>;
  register: (data: RegisterForm) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token on mount
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginForm): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const userData = await response.json();
        const authUser: AuthUser = {
          ...userData.user,
          token: userData.token,
        };
        setUser(authUser);
        localStorage.setItem('auth_user', JSON.stringify(authUser));
        toast({
          title: "Uspešno ste se prijavili!",
          description: `Dobrodošli, ${authUser.username}!`,
        });
        return true;
      } else {
        const error = await response.json();
        toast({
          title: "Greška pri prijavi",
          description: error.message || "Neispravni podaci",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Greška",
        description: "Problem sa mrežom",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterForm): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock API call
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const userData = await response.json();
        const authUser: AuthUser = {
          ...userData.user,
          token: userData.token,
        };
        setUser(authUser);
        localStorage.setItem('auth_user', JSON.stringify(authUser));
        toast({
          title: "Uspešno ste se registrovali!",
          description: `Dobrodošli, ${authUser.username}!`,
        });
        return true;
      } else {
        const error = await response.json();
        toast({
          title: "Greška pri registraciji",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Greška",
        description: "Problem sa mrežom",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    toast({
      title: "Uspešno ste se izlogovali",
      description: "Vidimo se uskoro!",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};