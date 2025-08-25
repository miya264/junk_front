'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/authService';
import type { Coworker } from '@/services/projectService';

export interface User {
  id: number;
  email: string;
  name: string;
  full_name: string;
  department_name: string;
  position?: string;
  token?: string; // クッキーから取得するため、オプショナル
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // coworkerデータをUser型に変換
  const coworkerToUser = (coworker: Coworker): User => ({
    id: coworker.id,
    email: coworker.email,
    name: coworker.name,
    full_name: coworker.full_name || coworker.name,
    department_name: coworker.department_name || '未設定',
    position: coworker.position,
  });

  useEffect(() => {
    // ページ読み込み時にクッキーからJWTを確認してユーザー情報を取得
    const checkAuth = async () => {
      try {
        // サーバーサイドでクッキーからJWTを読み取り、ユーザー情報を取得
        const verificationResult = await AuthService.verifyToken();
        if (verificationResult.valid && verificationResult.user) {
          setUser(coworkerToUser(verificationResult.user));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // エラー時はユーザー情報をクリア
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AuthService.login({ email, password });
      
      // APIからcoworkerデータを受け取り、User型に変換
      const userData = coworkerToUser(response.user);
      setUser(userData);
      
      // JWT はサーバーサイドでhttpOnlyクッキーに設定される
      // クライアントサイドでは何もしない
      
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : 'ログインに失敗しました');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout(); // サーバーサイドでクッキーを削除
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}