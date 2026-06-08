/**
 * 首页 — 搭子需求广场（成员B 维护）
 *
 * 功能：搜索框、分类筛选标签、需求卡片列表（分页）、空状态/加载态。
 */
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Clock, Users, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { listPosts } from '@/api/post'

const CATEGORIES = [
  { key: '', label: '全部' },
  { key: '学习', label: '学习' },
  { key: '运动', label: '运动' },
  { key: '娱乐', label: '娱乐' },
  { key: '干饭', label: '干饭' },
  { key: '竞赛', label: '竞赛' },
  { key: '其他', label: '其他' },
]

const STATUS_MAP: Record<number, { label: string; cls: string }> = {
  1: { label: '招募中', cls: 'bg-green-100 text-green-700' },
  2: { label: '已满员', cls: 'bg-yellow-100 text-yellow-700' },
  3: { label: '已结束', cls: 'bg-gray-100 text-gray-500' },
}

export default function HomePage() {
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page, page_size: 10 }
      if (keyword.trim()) params.keyword = keyword.trim()
      if (category) params.category = category
      const res = await listPosts(params)
      setData(res.data)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [keyword, category, page])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchPosts()
  }

  const handleCategoryChange = (cat: string) => {
    setCategory(cat)
    setPage(1)
  }

  const totalPages = data?.total_pages || 0

  return (
    <div className="space-y-6">
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">发现搭子</h1>
        <Link
          to="/publish"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          发布需求
        </Link>
      </div>

      {/* 搜索框 */}
      <form onSubmit={handleSearch} className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜索搭子需求..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                     placeholder:text-gray-400"
        />
      </form>

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleCategoryChange(cat.key)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === cat.key
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 加载态 */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-sm text-gray-500">加载中...</span>
        </div>
      )}

      {/* 空状态 */}
      {!loading && data && data.items?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Search size={48} className="mb-4 opacity-30" />
          <p className="text-sm">暂无搭子需求</p>
          <p className="text-xs mt-1">来发布第一个需求吧</p>
        </div>
      )}

      {/* 需求卡片列表 */}
      {!loading && data?.items?.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.items.map((post: any) => (
            <Link
              key={post.id}
              to={`/post/${post.id}`}
              className="block p-4 bg-white rounded-xl border border-gray-100 shadow-sm
                         hover:shadow-md hover:border-gray-200 transition-all"
            >
              {/* 卡片头部：标题 + 状态 */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1">
                  {post.title}
                </h3>
                {post.status && STATUS_MAP[post.status] && (
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_MAP[post.status].cls}`}
                  >
                    {STATUS_MAP[post.status].label}
                  </span>
                )}
              </div>

              {/* 内容摘要 */}
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                {post.content}
              </p>

              {/* 标签 */}
              {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {post.tags.map((tag: any) => (
                    <span
                      key={tag.id}
                      className="px-2 py-0.5 bg-primary/5 text-primary text-xs rounded-md"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* 底部信息 */}
              <div className="flex items-center gap-4 text-xs text-gray-400">
                {post.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={12} />
                    {post.location}
                  </span>
                )}
                {post.start_time && (
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(post.start_time).toLocaleDateString('zh-CN')}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Users size={12} />
                  {post.max_members}人
                </span>
              </div>

              {/* 发布者 */}
              {post.user && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium">
                    {(post.user.nickname || post.user.username)?.[0] || '?'}
                  </div>
                  <span className="text-xs text-gray-500">
                    {post.user.nickname || post.user.username}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50
                       disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-500 px-3">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50
                       disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
