/**
 * 个人中心页（成员A）
 *
 * 展示用户信息 + 编辑资料（昵称、专业、年级、简介、标签）
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Edit3, Save, X, LogOut } from 'lucide-react'
import { getCurrentUser, updateProfile } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

interface Profile {
  id: number
  username: string
  email: string
  avatar_url: string | null
  nickname: string | null
  major: string | null
  grade: string | null
  bio: string | null
  tags: string[]
  created_at: string
}

export default function ProfilePage() {
  const { isLoggedIn, logout } = useAuthStore()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  // 编辑表单
  const [nickname, setNickname] = useState('')
  const [major, setMajor] = useState('')
  const [grade, setGrade] = useState('')
  const [bio, setBio] = useState('')
  const [tagsInput, setTagsInput] = useState('')

  const fetchProfile = useCallback(async () => {
    try {
      const res = await getCurrentUser()
      if (res.code === 200) {
        setProfile(res.data)
      }
    } catch {
      // 未登录
    }
  }, [])

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    fetchProfile()
  }, [isLoggedIn, navigate, fetchProfile])

  const startEdit = () => {
    if (!profile) return
    setNickname(profile.nickname || '')
    setMajor(profile.major || '')
    setGrade(profile.grade || '')
    setBio(profile.bio || '')
    setTagsInput((profile.tags || []).join('，'))
    setEditing(true)
    setMsg('')
  }

  const cancelEdit = () => {
    setEditing(false)
    setMsg('')
  }

  const handleSave = async () => {
    setSaving(true)
    setMsg('')
    try {
      const tags = tagsInput
        .split(/[,，]/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0)

      const res = await updateProfile({
        nickname: nickname || null,
        major: major || null,
        grade: grade || null,
        bio: bio || null,
        tags: tags.length > 0 ? tags : null,
      })
      if (res.code === 200) {
        setMsg('保存成功')
        setEditing(false)
        fetchProfile()
      } else {
        setMsg(res.message || '保存失败')
      }
    } catch {
      setMsg('网络错误')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!profile) {
    return (
      <div className="text-center py-20 text-gray-400">
        <User size={48} className="mx-auto mb-3 opacity-30" />
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* 头像区 */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary-100 flex items-center justify-center mb-3">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <User size={36} className="text-primary-500" />
          )}
        </div>
        <h2 className="text-lg font-semibold">{profile.nickname || profile.username}</h2>
        <p className="text-sm text-gray-400">{profile.email}</p>
      </div>

      {/* 操作提示 */}
      {msg && (
        <div className={`text-sm px-4 py-2 rounded-lg mb-4 text-center ${msg.includes('成功') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {msg}
        </div>
      )}

      {/* 展示模式 */}
      {!editing ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">个人资料</h3>
            <button onClick={startEdit} className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600">
              <Edit3 size={14} />编辑
            </button>
          </div>

          <Field label="昵称" value={profile.nickname} />
          <Field label="专业" value={profile.major} />
          <Field label="年级" value={profile.grade} />
          <Field label="简介" value={profile.bio} />

          <div>
            <span className="text-xs text-gray-400">标签</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {(profile.tags || []).length > 0 ? (
                profile.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full">{t}</span>
                ))
              ) : (
                <span className="text-sm text-gray-300">暂无标签</span>
              )}
            </div>
          </div>

          <hr className="border-gray-100" />

          <button onClick={handleLogout} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600">
            <LogOut size={14} />退出登录
          </button>
        </div>
      ) : (
        /* 编辑模式 */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">编辑资料</h3>
            <div className="flex gap-2">
              <button onClick={cancelEdit} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
                <X size={14} />取消
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600 disabled:opacity-50">
                <Save size={14} />{saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>

          <EditField label="昵称" value={nickname} onChange={setNickname} placeholder="你的昵称" />
          <EditField label="专业" value={major} onChange={setMajor} placeholder="如：计算机科学与技术" />
          <EditField label="年级" value={grade} onChange={setGrade} placeholder="如：2023级" />
          <div>
            <label className="block text-xs text-gray-400 mb-1">简介</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="介绍一下自己..." />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">标签（用逗号分隔）</label>
            <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="考研，羽毛球，早起" />
          </div>
        </div>
      )}
    </div>
  )
}

/** 展示模式字段 */
function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <span className="text-xs text-gray-400">{label}</span>
      <p className="text-sm text-gray-700">{value || '未设置'}</p>
    </div>
  )
}

/** 编辑模式字段 */
function EditField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder={placeholder} />
    </div>
  )
}
