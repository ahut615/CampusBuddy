/**
 * 登录页（成员A 维护）
 *
 * 待实现：用户名+密码表单，调用 login API，成功后存储 token 并跳转首页。
 * 使用 shadcn/ui 组件（Button, Input, Card 等）。
 */
import { Link } from 'react-router-dom'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">登录 Campus Buddy</h1>
        <p className="text-gray-400 text-center text-sm">
          成员A请在此实现登录表单（shadcn/ui Input + Button）
        </p>
        <div className="mt-4 text-center">
          <Link to="/register" className="text-sm text-primary-500 hover:underline">
            没有账号？去注册
          </Link>
        </div>
      </div>
    </div>
  )
}
