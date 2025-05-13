import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, birthDate: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  login: async (username: string, birthDate: string) => {
    set({ isLoading: true, error: null });
    try {
      // 生年月日のフォーマットを統一（YYYY-MM-DD）
      const formattedBirthDate = new Date(birthDate).toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('birth_date', formattedBirthDate)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        set({ user: data, isLoading: false });
        localStorage.setItem('user', JSON.stringify(data));
      } else {
        set({ error: 'ユーザー名または生年月日が正しくありません', isLoading: false });
      }
    } catch (error) {
      set({ error: 'ログインに失敗しました', isLoading: false });
      console.error('Login error:', error);
    }
  },
  logout: async () => {
    localStorage.removeItem('user');
    set({ user: null });
  },
}));

// ローカルストレージからユーザー情報を復元する関数
export const initAuth = () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      useAuthStore.setState({ user });
    } catch (error) {
      console.error('Failed to parse stored user:', error);
      localStorage.removeItem('user');
    }
  }
};