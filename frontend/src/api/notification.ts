/**
 * 通知 API 封装（成员D 维护）
 */
import client from './client'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** 获取通知列表 */
export async function listNotifications(params?: any): Promise<any> {
  if (USE_MOCK) {
    return {
      code: 200,
      message: 'success',
      data: { total: 0, page: 1, unread_count: 0, list: [] },
    }
  }
  return client.get('/notifications', { params })
}

/** 标记单个通知为已读 */
export async function markRead(id: number): Promise<any> {
  return client.put(`/notifications/${id}/read`)
}

/** 全部已读 */
export async function markAllRead(): Promise<any> {
  return client.put('/notifications/read-all')
}
