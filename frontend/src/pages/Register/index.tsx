/**
 * 注册页（成员A 维护）
 *
 * 待实现：用户名+邮箱+密码+确认密码表单，调用 register API。
 */
import { Link } from 'react-router-dom'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">注册 Campus Buddy</h1>
        <p className="text-gray-400 text-center text-sm">
          成员A请在此实现注册表单
        </p>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-primary-500 hover:underline">
            已有账号？去登录
          </Link>
        </div>
      </div>
    </div>
  )
}
