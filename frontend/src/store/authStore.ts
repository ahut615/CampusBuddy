/**
 * Zustand 用户状态管理。
 *
 * 存储当前登录用户信息，供所有模块使用。
 * 登录成功后调用 setUser + setToken，退出时调用 logout。
 */
import { create } from 'zustand'

interface User {
  id: number
  username: string
  nickname?: string
  avatar_url?: string
  major?: string
  grade?: string
  bio?: string
  tags?: string[]
}

interface AuthState {
  user: User | null
  token: string | null
  isLoggedIn: boolean

  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoggedIn: !!localStorage.getItem('token'),

  setUser: (user) => set({ user, isLoggedIn: true }),

  setToken: (token) => {
    localStorage.setItem('token', token)
    set({ token, isLoggedIn: true })
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, isLoggedIn: false })
  },
}))
