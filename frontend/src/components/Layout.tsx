/**
 * 全局布局组件 — 导航栏 + 页面内容区。
 *
 * 所有需要导航栏的页面通过 React Router 的 <Outlet> 渲染在此布局中。
 * 各模块负责人如需修改导航栏，请提 PR 通知全员。
 */
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import {
  Home,
  User,
  Bell,
  FileText,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isLoggedIn, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/', icon: Home, label: '首页' },
    { to: '/publish', icon: FileText, label: '发布', auth: true },
    { to: '/applications', icon: FileText, label: '申请', auth: true },
    { to: '/notifications', icon: Bell, label: '通知', auth: true },
    { to: '/profile', icon: User, label: '我的', auth: true },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-lg font-bold text-primary-600">
            Campus Buddy
          </Link>

          {/* 导航链接 */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              // 需要登录的导航项，未登录时隐藏
              if (item.auth && !isLoggedIn) return null

              const isActive = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={16} />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}

            {/* 登录/退出 */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">退出</span>
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-1 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <LogIn size={16} />
                  <span className="hidden sm:inline">登录</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1 px-3 py-2 rounded-md text-sm bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                >
                  <UserPlus size={16} />
                  <span className="hidden sm:inline">注册</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* 页面内容 */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
