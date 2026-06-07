/**
 * 通知中心页（成员D 维护）
 *
 * 功能：未读/已读通知列表（Tab切换）、全部已读按钮、单条标记已读。
 */
import { useState, useEffect, useCallback } from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { listNotifications, markRead, markAllRead } from '@/api/notification'

interface NotificationItem {
  id: number
  title: string
  content: string
  is_read: number
  created_at: string | null
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('unread')
  const [markingAll, setMarkingAll] = useState(false)

  // 根据当前Tab加载对应通知
  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = { page: 1, page_size: 100 }
      if (activeTab === 'unread') {
        params.is_read = 0
      } else if (activeTab === 'read') {
        params.is_read = 1
      }
      const res = await listNotifications(params)
      if (res.code === 200) {
        setNotifications(res.data.list || [])
        setUnreadCount(res.data.unread_count || 0)
      }
    } catch (error) {
      console.error('获取通知列表失败:', error)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // 标记单个为已读
  const handleMarkRead = async (id: number) => {
    try {
      const res = await markRead(id)
      if (res.code === 200) {
        // 更新本地状态：将该通知移入已读
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, is_read: 1 } : n
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }

  // 全部已读
  const handleMarkAllRead = async () => {
    setMarkingAll(true)
    try {
      const res = await markAllRead()
      if (res.code === 200) {
        // 将所有未读通知改为已读
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: 1 }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('全部已读失败:', error)
    } finally {
      setMarkingAll(false)
    }
  }

  // 格式化时间
  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHour = Math.floor(diffMs / 3600000)
    const diffDay = Math.floor(diffMs / 86400000)

    if (diffMin < 1) return '刚刚'
    if (diffMin < 60) return `${diffMin}分钟前`
    if (diffHour < 24) return `${diffHour}小时前`
    if (diffDay < 7) return `${diffDay}天前`
    return date.toLocaleDateString('zh-CN')
  }

  return (
    <div>
      {/* 页面标题栏 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary-600" />
          <h1 className="text-xl font-bold">通知中心</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-1">
              {unreadCount} 条未读
            </Badge>
          )}
        </div>

        {/* 全部已读按钮 */}
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="gap-1"
          >
            <CheckCheck className="h-4 w-4" />
            {markingAll ? '处理中...' : '全部已读'}
          </Button>
        )}
      </div>

      {/* Tab 切换：未读 / 已读 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="unread">
            未读通知
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="read">已读通知</TabsTrigger>
        </TabsList>

        {/* 通知列表 */}
        <TabsContent value={activeTab}>
          {loading ? (
            <div className="text-center py-12 text-gray-400">加载中...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-400">
                {activeTab === 'unread' ? '暂无未读通知' : '暂无已读通知'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((item) => (
                <Card
                  key={item.id}
                  className={`transition-colors cursor-pointer hover:shadow-md ${
                    item.is_read === 0
                      ? 'border-l-4 border-l-primary-500 bg-primary-50/50'
                      : 'bg-white'
                  }`}
                  onClick={() => {
                    if (item.is_read === 0) {
                      handleMarkRead(item.id)
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* 标题行 */}
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className={`text-sm font-semibold truncate ${
                              item.is_read === 0
                                ? 'text-gray-900'
                                : 'text-gray-500'
                            }`}
                          >
                            {item.title}
                          </h3>
                          {item.is_read === 0 && (
                            <span className="inline-block w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                          )}
                        </div>
                        {/* 内容 */}
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                          {item.content}
                        </p>
                        {/* 时间 */}
                        <span className="text-xs text-gray-400">
                          {formatTime(item.created_at)}
                        </span>
                      </div>

                      {/* 单条标记已读按钮 */}
                      {item.is_read === 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-shrink-0 gap-1 text-gray-400 hover:text-primary-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMarkRead(item.id)
                          }}
                        >
                          <Check className="h-4 w-4" />
                          <span className="hidden sm:inline">已读</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
