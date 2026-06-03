/**
 * App 根组件 — React Router 路由配置。
 *
 * 各模块负责人添加路由规则：
 *   在 <Routes> 中添加自己的 <Route> 即可。
 *   不要删除或修改他人的 Route。
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'

// ===== 各模块页面导入 =====
// 用户模块（成员A）
import LoginPage from '@/pages/Login'
import RegisterPage from '@/pages/Register'
import ProfilePage from '@/pages/Profile'

// 需求模块（成员B）
import HomePage from '@/pages/Home'
import PostDetailPage from '@/pages/PostDetail'
import PublishPage from '@/pages/Publish'

// 申请模块（成员C）
import ApplicationsPage from '@/pages/Applications'

// 通知模块（成员D）
import NotificationsPage from '@/pages/Notifications'

function App() {
  return (
    <Routes>
      {/* 带导航栏的页面 */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/post/:id" element={<PostDetailPage />} />
        <Route path="/publish" element={<PublishPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      {/* 登录/注册页（无导航栏） */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* 兜底 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
