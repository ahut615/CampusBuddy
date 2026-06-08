/**
 * 申请 API 封装（成员C 维护）
 *
 * 包含：提交申请、我的申请列表、收到的申请列表、需求申请列表、审核申请
 */
import client from './client'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** 提交申请 */
export async function submitApplication(data: {
  post_id: number
  message?: string
}): Promise<any> {
  if (USE_MOCK) {
    return {
      code: 200,
      message: '申请提交成功',
      data: { id: Date.now(), created_at: new Date().toISOString() },
    }
  }
  return client.post('/applications', data)
}

/** 我的申请列表（含关联需求信息，支持状态筛选+分页） */
export async function myApplications(params?: {
  status?: number
  page?: number
  page_size?: number
}): Promise<any> {
  if (USE_MOCK) {
    return {
      code: 200,
      message: 'success',
      data: { total: 0, page: 1, list: [] },
    }
  }
  return client.get('/applications/me', { params })
}

/** 我收到的申请列表（聚合我发布的所有需求收到的申请） */
export async function receivedApplications(params?: {
  status?: number
  page?: number
  page_size?: number
}): Promise<any> {
  if (USE_MOCK) {
    return {
      code: 200,
      message: 'success',
      data: { total: 0, page: 1, list: [] },
    }
  }
  return client.get('/applications/received', { params })
}

/** 获取单个需求收到的申请列表（仅发布者可查看） */
export async function postApplications(
  postId: number,
  params?: { status?: number },
): Promise<any> {
  if (USE_MOCK) {
    return {
      code: 200,
      message: 'success',
      data: [],
    }
  }
  return client.get(`/posts/${postId}/applications`, { params })
}

/** 审核申请（通过/拒绝） */
export async function reviewApplication(
  id: number,
  status: number, // 1=通过 2=拒绝
): Promise<any> {
  if (USE_MOCK) {
    return {
      code: 200,
      message: '审核成功',
      data: {},
    }
  }
  return client.put(`/applications/${id}`, { status })
}
