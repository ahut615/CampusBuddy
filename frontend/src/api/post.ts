/**
 * 需求 API 封装（成员B 维护）
 *
 * 提供需求 CRUD 全部接口的 TypeScript 封装。
 */
import client from './client'

// ── 类型定义 ──────────────────────────────────────────
export interface PostItem {
  id: number
  user_id: number
  title: string
  content: string
  category: string
  location?: string
  start_time?: string
  end_time?: string
  max_members: number
  status: number // 1=招募中 2=已满 3=已结束
  created_at: string
  updated_at?: string
  user?: {
    id: number
    username: string
    nickname?: string
    avatar_url?: string
  }
  tags?: { id: number; name: string }[]
  has_applied?: boolean
}

export interface CreatePostParams {
  title: string
  content: string
  category: string
  location?: string
  start_time?: string
  end_time?: string
  max_members?: number
  tags?: string[]
}

export interface UpdatePostParams {
  title?: string
  content?: string
  category?: string
  location?: string
  start_time?: string
  end_time?: string
  max_members?: number
  status?: number
  tags?: string[]
}

export interface ListPostsParams {
  keyword?: string
  category?: string
  status?: number
  page?: number
  page_size?: number
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface ListPostsData {
  items: PostItem[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// Mock 开关
const MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const MOCK_POSTS: PostItem[] = [
  {
    id: 1,
    user_id: 1,
    title: '找考研搭子一起泡图书馆',
    content: '大三考研党，目标院校华科，每天图书馆三楼，希望找一个能互相监督的搭子。',
    category: '学习',
    location: '图书馆三楼',
    start_time: '2026-06-15T08:00:00',
    max_members: 2,
    status: 1,
    created_at: '2026-06-08T10:00:00',
    user: { id: 1, username: 'zhangsan', nickname: '张三' },
    tags: [{ id: 1, name: '考研' }, { id: 2, name: '华科' }],
    has_applied: false,
  },
  {
    id: 2,
    user_id: 2,
    title: '周末羽毛球约起',
    content: '每周六下午体育馆羽毛球，目前两人，再找两个球友。水平不限，开心就好。',
    category: '运动',
    location: '体育馆',
    start_time: '2026-06-13T14:00:00',
    max_members: 4,
    status: 1,
    created_at: '2026-06-07T15:00:00',
    user: { id: 2, username: 'lisi', nickname: '李四' },
    tags: [{ id: 3, name: '羽毛球' }],
    has_applied: true,
  },
]

// ── API 函数 ──────────────────────────────────────────

/** 获取需求列表（搜索+筛选+分页） */
export async function listPosts(
  params?: ListPostsParams,
): Promise<ApiResponse<ListPostsData>> {
  if (MOCK) {
    let items = [...MOCK_POSTS]
    if (params?.keyword) {
      const kw = params.keyword.toLowerCase()
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(kw) ||
          p.content.toLowerCase().includes(kw),
      )
    }
    if (params?.category) {
      items = items.filter((p) => p.category === params.category)
    }
    return {
      code: 200,
      message: 'success',
      data: {
        items,
        total: items.length,
        page: params?.page || 1,
        page_size: params?.page_size || 10,
        total_pages: 1,
      },
    }
  }
  return client.get('/posts', { params })
}

/** 获取需求详情 */
export async function getPost(id: number): Promise<ApiResponse<PostItem>> {
  if (MOCK) {
    const post = MOCK_POSTS.find((p) => p.id === id)
    return post
      ? { code: 200, message: 'success', data: { ...post } }
      : { code: 404, message: '需求不存在', data: {} as any }
  }
  return client.get(`/posts/${id}`)
}

/** 创建需求 */
export async function createPost(
  data: CreatePostParams,
): Promise<ApiResponse<{ id: number }>> {
  return client.post('/posts', data)
}

/** 编辑需求 */
export async function updatePost(
  id: number,
  data: UpdatePostParams,
): Promise<ApiResponse<PostItem>> {
  return client.put(`/posts/${id}`, data)
}

/** 删除需求 */
export async function deletePost(id: number): Promise<ApiResponse<{}>> {
  return client.delete(`/posts/${id}`)
}
