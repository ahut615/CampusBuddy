/**
 * Axios 实例 — 统一请求客户端。
 *
 * 功能：
 *   - 自动拼接 baseURL
 *   - 请求拦截器：自动携带 JWT Token
 *   - 响应拦截器：统一处理 401 跳转登录页
 *
 * 所有模块的 API 封装都通过此 client 发起请求。
 */
import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ========== 请求拦截器：自动注入 JWT ==========
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ========== 响应拦截器：统一错误处理 ==========
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期或无效，清除状态并跳转登录
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  },
)

export default client
