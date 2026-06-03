/**
 * 需求 API 封装（成员B 维护）
 */
import client from './client'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** 获取需求列表 */
export async function listPosts(params?: any): Promise<any> {
  if (USE_MOCK) {
    return {
      code: 200,
      message: 'success',
      data: { total: 0, page: 1, page_size: 10, list: [] },
    }
  }
  return client.get('/posts', { params })
}

/** 获取需求详情 */
export async function getPost(id: number): Promise<any> {
  if (USE_MOCK) {
    return { code: 200, message: 'success', data: {} }
  }
  return client.get(`/posts/${id}`)
}

/** 创建需求 */
export async function createPost(data: any): Promise<any> {
  return client.post('/posts', data)
}

/** 编辑需求 */
export async function updatePost(id: number, data: any): Promise<any> {
  return client.put(`/posts/${id}`, data)
}

/** 删除需求 */
export async function deletePost(id: number): Promise<any> {
  return client.delete(`/posts/${id}`)
}
