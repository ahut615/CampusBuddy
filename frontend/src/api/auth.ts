/**
 * 用户认证 API 封装（成员A 维护）
 */
import client from './client'

// Mock 模式开关
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}

/** 用户登录 */
export async function login(data: LoginRequest): Promise<any> {
  if (USE_MOCK) {
    return {
      code: 200,
      message: '登录成功',
      data: { token: 'mock-jwt-token-12345' },
    }
  }
  return client.post('/auth/login', data)
}

/** 用户注册 */
export async function register(data: RegisterRequest): Promise<any> {
  if (USE_MOCK) {
    return {
      code: 200,
      message: '注册成功',
      data: { id: 1, username: data.username, email: data.email },
    }
  }
  return client.post('/auth/register', data)
}

/** 获取当前用户信息 */
export async function getCurrentUser(): Promise<any> {
  if (USE_MOCK) {
    return {
      code: 200,
      message: 'success',
      data: {
        id: 1,
        username: 'test_user',
        nickname: '张三',
        avatar_url: '',
        major: '计算机科学与技术',
        grade: '2023级',
        bio: '热爱学习，喜欢打球',
        tags: ['考研', '羽毛球'],
      },
    }
  }
  return client.get('/users/me')
}

/** 修改个人资料 */
export async function updateProfile(data: any): Promise<any> {
  if (USE_MOCK) {
    return { code: 200, message: '修改成功', data: {} }
  }
  return client.put('/users/me', data)
}
