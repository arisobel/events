import { useEffect, useState } from 'react'

import { AdminUserCreate, Role, User, adminService } from '../services/api'
import AdminLayout from '../components/AdminLayout'

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  gestor_financeiro: 'Financeiro',
  gestor_campo: 'Campo',
}

const roleLabel = (name: string) => ROLE_LABELS[name] ?? name

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newUser, setNewUser] = useState<AdminUserCreate>({ f_username: '', f_email: '', password: '' })

  useEffect(() => {
    void load()
  }, [])

  const load = async () => {
    try {
      setLoading(true)
      setError('')
      const [usersData, rolesData] = await Promise.all([adminService.getUsers(), adminService.getRoles()])
      setUsers(usersData)
      setRoles(rolesData)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao carregar usuários')
    } finally {
      setLoading(false)
    }
  }

  const replaceUser = (updated: User) =>
    setUsers((current) => current.map((u) => (u.id === updated.id ? updated : u)))

  const toggleRole = async (user: User, role: Role) => {
    const has = user.roles.includes(role.f_name)
    try {
      setBusy(true)
      setError('')
      const updated = has
        ? await adminService.removeRole(user.id, role.id)
        : await adminService.assignRole(user.id, role.id)
      replaceUser(updated)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao alterar papel')
    } finally {
      setBusy(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUser.f_username.trim() || !newUser.password.trim()) {
      setError('Usuário e senha são obrigatórios')
      return
    }
    try {
      setBusy(true)
      setError('')
      await adminService.createUser({
        ...newUser,
        f_email: newUser.f_email?.trim() || undefined,
      })
      setNewUser({ f_username: '', f_email: '', password: '' })
      setShowCreate(false)
      await load()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao criar usuário')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AdminLayout title="Usuários & Papéis">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-2 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Usuários & Papéis</h1>
            <p className="text-sm text-gray-500">
              Papéis definem o acesso. <strong>Financeiro</strong> vê valores/conta corrente; <strong>Campo</strong> opera sem valores; <strong>Admin</strong> vê tudo.
            </p>
          </div>
          <button
            onClick={() => setShowCreate((c) => !c)}
            className="shrink-0 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm"
          >
            {showCreate ? 'Cancelar' : '+ Novo usuário'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
        )}

        {showCreate && (
          <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Usuário *</span>
              <input
                type="text"
                value={newUser.f_username}
                onChange={(e) => setNewUser((c) => ({ ...c, f_username: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Email</span>
              <input
                type="email"
                value={newUser.f_email}
                onChange={(e) => setNewUser((c) => ({ ...c, f_email: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500">Senha *</span>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser((c) => ({ ...c, password: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </label>
            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={busy}
                className="bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                Criar usuário
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center text-gray-600 py-12">Carregando...</div>
        ) : (
          <div className="bg-white rounded-lg shadow divide-y divide-gray-100">
            {users.map((user) => (
              <div key={user.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {user.f_username}
                    {user.f_is_active !== 'T' && <span className="ml-2 text-xs text-red-600">(inativo)</span>}
                  </p>
                  {user.f_email && <p className="text-sm text-gray-500">{user.f_email}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => {
                    const active = user.roles.includes(role.f_name)
                    return (
                      <button
                        key={role.id}
                        onClick={() => toggleRole(user, role)}
                        disabled={busy}
                        title={role.f_notes ?? ''}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors disabled:opacity-50 ${
                          active
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {active ? '✓ ' : ''}
                        {roleLabel(role.f_name)}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
            {users.length === 0 && <div className="p-6 text-center text-gray-500 text-sm">Nenhum usuário.</div>}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
