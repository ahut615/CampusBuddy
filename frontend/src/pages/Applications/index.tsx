/**
 * 申请管理页（成员C 维护）
 *
 * 功能：
 *   - Tab 切换：「我的申请」「收到的申请」
 *   - 状态筛选：全部 / 待审核 / 已通过 / 已拒绝
 *   - 审核操作：通过 / 拒绝按钮（仅「收到的申请」Tab）
 *   - 分页加载
 *   - 加载 / 空数据 / 错误状态处理
 */
import { useState, useEffect, useCallback } from 'react'
import {
  myApplications,
  receivedApplications,
  reviewApplication,
} from '@/api/application'
import { useAuthStore } from '@/store/authStore'
import {
  Clock,
  User,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Inbox,
} from 'lucide-react'

// ---- 类型定义 ----
interface ApplicantInfo {
  id: number
  nickname: string
  avatar_url?: string
  major?: string
  grade?: string
}

interface PostInfo {
  id: number
  title: string
  category?: string
  status?: number
}

interface ApplicationItem {
  id: number
  post_id?: number
  applicant_id?: number
  status: number // 0=待审核 1=已通过 2=已拒绝
  message?: string
  created_at: string
  post?: PostInfo | null
  applicant?: ApplicantInfo | null
}

// 状态常量
const STATUS_PENDING = 0
const STATUS_APPROVED = 1
const STATUS_REJECTED = 2

// 状态标签配置
const STATUS_CONFIG: Record<number, { label: string; className: string; icon: typeof Clock }> = {
  [STATUS_PENDING]: {
    label: '待审核',
    className: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  [STATUS_APPROVED]: {
    label: '已通过',
    className: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  [STATUS_REJECTED]: {
    label: '已拒绝',
    className: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
}

// 状态筛选选项
const STATUS_FILTERS = [
  { value: undefined, label: '全部' },
  { value: STATUS_PENDING, label: '待审核' },
  { value: STATUS_APPROVED, label: '已通过' },
  { value: STATUS_REJECTED, label: '已拒绝' },
]

// Tab 类型
type TabKey = 'my' | 'received'

const PAGE_SIZE = 10

export default function ApplicationsPage() {
  const { isLoggedIn } = useAuthStore()

  // ---- 状态 ----
  const [activeTab, setActiveTab] = useState<TabKey>('my')
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined)
  const [applications, setApplications] = useState<ApplicationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [reviewingId, setReviewingId] = useState<number | null>(null) // 正在审核的申请ID

  // ---- 数据加载 ----
  const fetchData = useCallback(
    async (currentPage: number = 1, isLoadMore: boolean = false) => {
      setLoading(true)
      setError(null)

      try {
        const params = {
          page: currentPage,
          page_size: PAGE_SIZE,
          ...(statusFilter !== undefined ? { status: statusFilter } : {}),
        }

        const result =
          activeTab === 'my'
            ? await myApplications(params)
            : await receivedApplications(params)

        if (result.code === 200) {
          const { list, total: totalCount } = result.data
          setApplications((prev) =>
            isLoadMore ? [...prev, ...list] : list,
          )
          setTotal(totalCount || 0)
          setPage(currentPage)
        } else {
          setError(result.message || '加载失败')
        }
      } catch (err: any) {
        setError(err?.message || '网络请求失败，请稍后重试')
      } finally {
        setLoading(false)
      }
    },
    [activeTab, statusFilter],
  )

  // Tab 或筛选条件变化时重新加载
  useEffect(() => {
    fetchData(1, false)
  }, [fetchData])

  // ---- 审核操作 ----
  const handleReview = async (applicationId: number, newStatus: number) => {
    if (reviewingId) return // 防止重复点击

    setReviewingId(applicationId)

    try {
      const result = await reviewApplication(applicationId, newStatus)

      if (result.code === 200) {
        // 更新本地列表状态
        setApplications((prev) =>
          prev.map((app) =>
            app.id === applicationId ? { ...app, status: newStatus } : app,
          ),
        )
      } else {
        alert(result.message || '操作失败')
      }
    } catch (err: any) {
      alert(err?.message || '网络请求失败，请稍后重试')
    } finally {
      setReviewingId(null)
    }
  }

  // ---- 格式化时间 ----
  const formatTime = (isoString: string) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHour = Math.floor(diffMs / 3600000)
    const diffDay = Math.floor(diffMs / 86400000)

    if (diffMin < 1) return '刚刚'
    if (diffMin < 60) return `${diffMin} 分钟前`
    if (diffHour < 24) return `${diffHour} 小时前`
    if (diffDay < 30) return `${diffDay} 天前`
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  // 是否有更多数据
  const hasMore = applications.length < total

  // ---- 未登录 ----
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <AlertCircle size={48} className="mb-4" />
        <p className="text-lg">请先登录后查看申请管理</p>
      </div>
    )
  }

  // ---- 渲染 ----
  return (
    <div className="max-w-3xl mx-auto">
      {/* 页面标题 */}
      <h1 className="text-xl font-bold mb-6">申请管理</h1>

      {/* Tab 切换 */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4">
        {([
          { key: 'my' as TabKey, label: '我的申请' },
          { key: 'received' as TabKey, label: '收到的申请' },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              if (activeTab !== tab.key) {
                setActiveTab(tab.key)
                setApplications([]) // 切换 Tab 时清空旧数据
              }
            }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 状态筛选 */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.label}
            onClick={() => setStatusFilter(filter.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              statusFilter === filter.value
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* 加载中 */}
      {loading && applications.length === 0 && (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 size={28} className="animate-spin mr-2" />
          <span>加载中...</span>
        </div>
      )}

      {/* 错误状态 */}
      {error && applications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <AlertCircle size={40} className="mb-3 text-red-400" />
          <p className="mb-3">{error}</p>
          <button
            onClick={() => fetchData(1)}
            className="flex items-center gap-1 px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <RefreshCw size={14} />
            重试
          </button>
        </div>
      )}

      {/* 空数据 */}
      {!loading && !error && applications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Inbox size={48} className="mb-3" />
          <p>暂无数据</p>
        </div>
      )}

      {/* 申请列表 */}
      {applications.length > 0 && (
        <div className="space-y-3">
          {applications.map((app) => {
            const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG[0]
            const StatusIcon = statusCfg.icon

            return (
              <div
                key={app.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
              >
                {/* 第一行：头像/图标 + 标题 + 状态标签 */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* 头像或图标 */}
                    {activeTab === 'my' ? (
                      <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                        <FileText size={18} className="text-primary-500" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {app.applicant?.avatar_url ? (
                          <img
                            src={app.applicant.avatar_url}
                            alt="头像"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={18} className="text-gray-400" />
                        )}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      {/* 标题行 */}
                      <h3 className="font-medium text-sm text-gray-900 truncate">
                        {activeTab === 'my'
                          ? app.post?.title || '需求已删除'
                          : app.applicant?.nickname || `用户 #${app.applicant_id}`}
                      </h3>

                      {/* 副标题 */}
                      {activeTab === 'my' && app.post && (
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                          <MapPin size={12} />
                          <span>{app.post.category || '未分类'}</span>
                        </div>
                      )}
                      {activeTab === 'received' && app.applicant && (
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                          {app.applicant.major && (
                            <>
                              <span>{app.applicant.major}</span>
                              <span>·</span>
                            </>
                          )}
                          {app.applicant.grade && (
                            <span>{app.applicant.grade}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 状态标签 */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${statusCfg.className}`}
                  >
                    <StatusIcon size={12} />
                    {statusCfg.label}
                  </span>
                </div>

                {/* 申请留言 */}
                {app.message && (
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mb-2">
                    {app.message}
                  </p>
                )}

                {/* 底部：时间 + 操作按钮 */}
                <div className="flex items-center justify-between mt-2">
                  {/* 时间 */}
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={12} />
                    {formatTime(app.created_at)}
                  </span>

                  {/* 操作按钮（仅「收到的申请」中待审核的申请） */}
                  {activeTab === 'received' && app.status === STATUS_PENDING && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReview(app.id, STATUS_REJECTED)}
                        disabled={reviewingId === app.id}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                      >
                        {reviewingId === app.id ? (
                          <Loader2 size={12} className="animate-spin inline mr-1" />
                        ) : null}
                        拒绝
                      </button>
                      <button
                        onClick={() => handleReview(app.id, STATUS_APPROVED)}
                        disabled={reviewingId === app.id}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
                      >
                        {reviewingId === app.id ? (
                          <Loader2 size={12} className="animate-spin inline mr-1" />
                        ) : null}
                        通过
                      </button>
                    </div>
                  )}

                  {/* 已审核的申请显示关联需求 */}
                  {activeTab === 'received' && app.status !== STATUS_PENDING && app.post && (
                    <span className="text-xs text-gray-400 truncate max-w-[200px]">
                      需求：{app.post.title}
                    </span>
                  )}
                </div>
              </div>
            )
          })}

          {/* 加载更多 */}
          {hasMore && (
            <div className="flex justify-center pt-2 pb-4">
              <button
                onClick={() => fetchData(page + 1, true)}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 text-sm text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    加载中...
                  </>
                ) : (
                  <>
                    加载更多
                    <span className="text-xs text-gray-400">
                      （{applications.length}/{total}）
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
