/**
 * 发布搭子需求页（成员B 维护）
 *
 * 表单字段：标题、分类、内容、地点、时间范围、最大人数、标签。
 * 提交后跳转首页。
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, Users, Tag, X, Plus } from 'lucide-react'
import { createPost } from '@/api/post'

const CATEGORIES = ['学习', '运动', '娱乐', '干饭', '竞赛', '其他']

export default function PublishPage() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [content, setContent] = useState('')
  const [location, setLocation] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [maxMembers, setMaxMembers] = useState(2)
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const addTag = () => {
    const name = tagInput.trim()
    if (!name) return
    if (tags.includes(name)) {
      setTagInput('')
      return
    }
    if (tags.length >= 5) {
      setError('最多添加5个标签')
      return
    }
    setTags([...tags, name])
    setTagInput('')
    setError('')
  }

  const removeTag = (idx: number) => {
    setTags(tags.filter((_, i) => i !== idx))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 前端校验
    if (!title.trim()) return setError('请输入标题')
    if (title.length > 200) return setError('标题不能超过200字')
    if (!category) return setError('请选择分类')
    if (!content.trim()) return setError('请输入内容描述')
    if (startTime && endTime && startTime >= endTime)
      return setError('开始时间必须早于结束时间')
    if (maxMembers < 1) return setError('最大人数至少为1')

    setSubmitting(true)
    try {
      const body: any = {
        title: title.trim(),
        category,
        content: content.trim(),
        location: location.trim() || undefined,
        max_members: maxMembers,
      }
      if (startTime) body.start_time = new Date(startTime).toISOString()
      if (endTime) body.end_time = new Date(endTime).toISOString()
      if (tags.length > 0) body.tags = tags

      const res = await createPost(body)
      if (res.code === 200) {
        navigate('/')
      } else {
        setError(res.message || '发布失败')
      }
    } catch {
      setError('网络错误，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">发布搭子需求</h1>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 标题 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">需求标题 *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            placeholder="例如：找考研搭子一起泡图书馆"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* 分类 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">分类 *</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  category === cat
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 内容 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">需求描述 *</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="详细描述你想找什么样的搭子，对搭子有什么要求..."
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm resize-none
                       focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* 地点 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <MapPin size={14} className="inline mr-1" />活动地点
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="例如：图书馆三楼、体育馆"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* 时间范围 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <Clock size={14} className="inline mr-1" />开始时间
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">结束时间</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* 最大人数 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Users size={14} className="inline mr-1" />最大人数
          </label>
          <input
            type="number"
            value={maxMembers}
            onChange={(e) => setMaxMembers(parseInt(e.target.value) || 1)}
            min={2}
            max={20}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* 标签 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Tag size={14} className="inline mr-1" />标签（最多5个）
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="输入标签名后回车添加"
              className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-3 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/5 text-primary text-xs rounded-md"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(idx)} className="hover:text-red-500">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 提交 */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium
                     hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {submitting ? '发布中...' : '发布需求'}
        </button>
      </form>
    </div>
  )
}
