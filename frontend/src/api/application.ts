/**
 * 申请 API 封装（成员C 维护）
 */
import client from './client'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** 提交申请 */
export async function submitApplication(data: {
  post_id: number
  message?: string
}): Promise<any> {
  return client.post('/applications', data)
}

/** 我的申请列表 */
export async function myApplications(params?: any): Promise<any> {
  if (USE_MOCK) {
    return {
      code: 200,
      message: 'success',
      data: { total: 0, page: 1, list: [] },
    }
  }
  return client.get('/applications/me', { params })
}

/** 审核申请 */
export async function reviewApplication(
  id: number,
  status: number,
): Promise<any> {
  return client.put(`/applications/${id}`, { status })
}
