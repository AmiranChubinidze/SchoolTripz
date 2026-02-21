'use client'
import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Input } from '@/components/ui/input'
import { usersApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Search, Loader2 } from 'lucide-react'

interface User {
  _id: string
  name: string
  email: string
  role: string
  school: string
  isActive: boolean
  createdAt: string
}

type RoleFilter = 'all' | 'admin' | 'client'

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

const MUTED = '#6B7A96'
const ROLE_TABS: { key: RoleFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'admin', label: 'Admin' },
  { key: 'client', label: 'Client' },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true)
      usersApi
        .list({ limit: 200, search })
        .then(({ data }) => setUsers(data.users))
        .catch(() => {})
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  const filtered =
    roleFilter === 'all' ? users : users.filter((u) => u.role === roleFilter)

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <p
            className="text-[10px] font-semibold tracking-[0.16em] uppercase mb-1"
            style={{ color: '#2E3D56' }}
          >
            Directory
          </p>
          <h1 className="text-lg font-bold text-white">Users</h1>
        </div>

        {/* Controls row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
              style={{ color: MUTED }}
              aria-hidden="true"
            />
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs text-white placeholder:text-[#3D4F6E]"
              style={{
                background: '#141F35',
                border: '1px solid rgba(255,255,255,0.08)',
                height: '36px',
              }}
              aria-label="Search users"
            />
          </div>

          {/* Role filter tabs */}
          <div
            className="flex items-center rounded-lg p-0.5"
            style={{ background: '#0D1526', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {ROLE_TABS.map(({ key, label }) => {
              const active = roleFilter === key
              return (
                <button
                  key={key}
                  onClick={() => setRoleFilter(key)}
                  className="px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"
                  style={
                    active
                      ? { background: '#141F35', color: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }
                      : { color: MUTED }
                  }
                >
                  {label}
                  {key !== 'all' && (
                    <span
                      className="ml-1.5 stat-number text-xs"
                      style={{ color: active ? '#A78BFA' : '#3D4F6E' }}
                    >
                      {users.filter((u) => u.role === key).length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-32">
            <Loader2 className="h-7 w-7 animate-spin" style={{ color: '#7C3AED' }} />
          </div>
        ) : (
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: '#141F35', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['User', 'School', 'Role', 'Joined', 'Status'].map((h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3.5 text-left text-[10px] font-semibold tracking-[0.12em] uppercase ${i === 1 ? 'hidden sm:table-cell' : ''} ${i === 3 ? 'hidden md:table-cell' : ''}`}
                      style={{ color: MUTED }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr
                    key={user._id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                    className="transition-colors"
                  >
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-8 w-8 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-bold"
                          style={{
                            background: user.role === 'admin' ? 'rgba(124,58,237,0.15)' : '#1C2D47',
                            color: user.role === 'admin' ? '#A78BFA' : MUTED,
                          }}
                        >
                          {getInitials(user.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate">{user.name}</p>
                          <p className="text-[10px] truncate" style={{ color: MUTED }}>{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* School */}
                    <td
                      className="px-5 py-3.5 text-xs hidden sm:table-cell"
                      style={{ color: '#A0B0C8' }}
                    >
                      {user.school || '—'}
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded font-semibold tracking-wide uppercase"
                        style={
                          user.role === 'admin'
                            ? { background: 'rgba(124,58,237,0.15)', color: '#A78BFA' }
                            : { background: 'rgba(255,255,255,0.06)', color: MUTED }
                        }
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Joined */}
                    <td
                      className="px-5 py-3.5 text-[10px] hidden md:table-cell"
                      style={{ color: MUTED }}
                    >
                      {formatDate(user.createdAt)}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                          style={{ background: user.isActive ? '#10B981' : '#3D4F6E' }}
                        />
                        <span
                          className="text-xs"
                          style={{ color: user.isActive ? '#34D399' : MUTED }}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="px-5 py-14 text-center text-sm" style={{ color: MUTED }}>
                {search
                  ? 'No users match your search.'
                  : `No ${roleFilter === 'all' ? '' : roleFilter + ' '}users found.`}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
