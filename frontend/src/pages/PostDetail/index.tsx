/**
 * 需求详情页（成员B 维护）
 *
 * 展示需求完整信息 + 发布人信息 + 标签 + 申请按钮。
 * 路径：/post/:id
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, Clock, Users, Tag, ArrowLeft, Calendar } from 'lucide-react'
import { getPost } from '@/api/post'
import { submitApplication } from '@/api/application'
import { useAuthStore } from '@/store/authStore'

const STATUS_MAP: Record<number, { label: string; cls: string }> = {
  1: { label: '招募中', cls: 'bg-green-100 text-green-700' },
  2: { label: '已满员', cls: 'bg-yellow-100 text-yellow-700' },
  3: { label: '已结束', cls: 'bg-gray-100 text-gray-500' },
}

const CATEGORY_ICONS: Record<string, string> = {
  学习: '📚',
  运动: '⚽',
  娱乐: '🎮',
  干饭: '🍔',
  竞赛: '🏆',
  其他: '📌',
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isLoggedIn, user } = useAuthStore()

  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applyMsg, setApplyMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getPost(Number(id))
      .then((res) => {
        if (res.code === 200) {
          setPost(res.data)
        } else {
          setError(res.message || '需求不存在')
        }
      })
      .catch(() => setError('加载失败，请稍后重试'))
      .finally(() => setLoading(false))
  }, [id])

  const handleApply = async () => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    setApplying(true)
    setError('')
    try {
      const res = await submitApplication({
        post_id: Number(id),
        message: applyMsg.trim() || undefined,
      })
      if (res.code === 200) {
        // 刷新数据
        const detail = await getPost(Number(id))
        if (detail.code === 200) setPost(detail.data)
        setApplyMsg('')
      } else {
        setError(res.message || '申请失败')
      }
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setApplying(false)
    }
  }

  // ---- 加载态 ----
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ---- 错误态 ----
  if (error && !post) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-sm">{error}</p>
        <Link to="/" className="mt-4 text-sm text-primary hover:underline">
          返回首页
        </Link>
      </div>
    )
  }

  if (!post) return null

  const isOwner = user?.id === post.user_id
  const canApply =
    isLoggedIn && !isOwner && post.status === 1 && !post.has_applied

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 返回按钮 */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft size={16} />
        返回
      </button>

      {/* 标题 + 状态 + 分类 */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{CATEGORY_ICONS[post.category] || '📌'}</span>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/5 text-primary text-xs font-medium">
                {post.category}
              </span>
              {post.status && STATUS_MAP[post.status] && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_MAP[post.status].cls}`}
                >
                  {STATUS_MAP[post.status].label}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 内容 */}
      <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* 详情信息 */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {post.location && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <MapPin size={16} className="text-gray-400" />
            <span className="text-gray-600">{post.location}</span>
          </div>
        )}
        {post.start_time && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-gray-600">
              {new Date(post.start_time).toLocaleString('zh-CN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
              {post.end_time &&
                ` — ${new Date(post.end_time).toLocaleString('zh-CN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}`}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <Users size={16} className="text-gray-400" />
          <span className="text-gray-600">最多 {post.max_members} 人</span>
        </div>
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <Clock size={16} className="text-gray-400" />
          <span className="text-gray-600">
            {new Date(post.created_at).toLocaleDateString('zh-CN')} 发布
          </span>
        </div>
      </div>

      {/* 标签 */}
      {post.tags?.length > 0 && (
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-gray-400" />
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag: any) => (
              <span
                key={tag.id}
                className="px-2.5 py-1 bg-primary/5 text-primary text-xs rounded-md"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 发布者信息 */}
      {post.user && (
        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm text-primary font-bold">
            {(post.user.nickname || post.user.username)?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {post.user.nickname || post.user.username}
            </p>
            <p className="text-xs text-gray-400">@{post.user.username}</p>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 申请区域 */}
      <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm space-y-4">
        {/* 未登录 */}
        {!isLoggedIn && (
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-3">登录后即可申请</p>
            <Link
              to="/login"
              className="inline-block px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              去登录
            </Link>
          </div>
        )}

        {/* 自己的需求 */}
        {isOwner && (
          <div className="text-center">
            <p className="text-sm text-gray-400">这是你发布的需求</p>
            <Link
              to="/publish"
              className="inline-block mt-2 text-sm text-primary hover:underline"
            >
              编辑需求
            </Link>
          </div>
        )}

        {/* 已申请 */}
        {!isOwner && isLoggedIn && post.has_applied && (
          <div className="text-center">
            <p className="text-sm text-green-600 font-medium">已申请，等待发布者审核</p>
          </div>
        )}

        {/* 可申请 */}
        {canApply && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                申请附言（可选）
              </label>
              <textarea
                value={applyMsg}
                onChange={(e) => setApplyMsg(e.target.value)}
                rows={3}
                placeholder="简单介绍一下自己，让发布者更愿意通过你的申请..."
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm resize-none
                           focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <button
              onClick={handleApply}
              disabled={applying}
              className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium
                         hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {applying ? '提交中...' : '立即申请'}
            </button>
          </>
        )}

        {/* 非招募中状态 */}
        {!isOwner && isLoggedIn && !post.has_applied && post.status !== 1 && (
          <div className="text-center">
            <p className="text-sm text-gray-400">
              {post.status === 2 ? '已满员，无法申请' : '已结束，无法申请'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
