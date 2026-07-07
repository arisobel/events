import { ReactNode, useEffect, useMemo, useState } from 'react'

import AdminLayout from '../components/AdminLayout'
import { useAuth } from '../contexts/AuthContext'
import {
  Employee,
  EmployeeCreate,
  Event,
  StaffAssignment,
  StaffAssignmentCreate,
  eventService,
  staffService,
} from '../services/api'

function Field({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <label className={`flex flex-col gap-1 ${className || ''}`}>
      <span className="text-xs font-medium text-gray-500">{label}</span>
      {children}
    </label>
  )
}

type EmployeeFormState = {
  f_full_name: string
  f_default_role: string
  f_document: string
  f_phone: string
  f_email: string
  f_default_daily_cost: string
  f_notes: string
}

const emptyEmployeeForm: EmployeeFormState = {
  f_full_name: '',
  f_default_role: '',
  f_document: '',
  f_phone: '',
  f_email: '',
  f_default_daily_cost: '',
  f_notes: '',
}

type AssignmentFormState = {
  eventId: number | ''
  f_role: string
  f_start_date: string
  f_end_date: string
  f_daily_cost: string
  f_total_cost: string
  f_notes: string
}

const emptyAssignmentForm: AssignmentFormState = {
  eventId: '',
  f_role: '',
  f_start_date: '',
  f_end_date: '',
  f_daily_cost: '',
  f_total_cost: '',
  f_notes: '',
}

const formatMoney = (value?: string | number | null) => {
  if (value == null || value === '') return null
  const num = Number(value)
  if (Number.isNaN(num)) return null
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function StaffPage() {
  const { canSeeFinancials } = useAuth()

  const [employees, setEmployees] = useState<Employee[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [assignmentsByEmployee, setAssignmentsByEmployee] = useState<Record<number, StaffAssignment[]>>({})
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [showEmployeeForm, setShowEmployeeForm] = useState(false)
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null)
  const [savingEmployee, setSavingEmployee] = useState(false)
  const [employeeForm, setEmployeeForm] = useState<EmployeeFormState>(emptyEmployeeForm)

  const [engagingEmployeeId, setEngagingEmployeeId] = useState<number | null>(null)
  const [savingAssignment, setSavingAssignment] = useState(false)
  const [assignmentForm, setAssignmentForm] = useState<AssignmentFormState>(emptyAssignmentForm)

  const eventNames = useMemo(() => {
    const map: Record<number, string> = {}
    events.forEach((ev) => { map[ev.id] = ev.f_name })
    return map
  }, [events])

  useEffect(() => {
    void loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadAll = async () => {
    try {
      setLoading(true)
      setError('')
      const [emps, evs] = await Promise.all([
        staffService.getEmployees(),
        eventService.getEvents(),
      ])
      setEmployees(emps)
      setEvents(evs)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao carregar colaboradores')
    } finally {
      setLoading(false)
    }
  }

  const doSearch = async () => {
    try {
      setError('')
      setEmployees(await staffService.getEmployees(search.trim() || undefined))
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha na busca')
    }
  }

  const loadAssignments = async (employeeId: number) => {
    try {
      const items = await staffService.getEmployeeAssignments(employeeId)
      setAssignmentsByEmployee((current) => ({ ...current, [employeeId]: items }))
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao carregar engajamentos')
    }
  }

  const toggleExpand = (employeeId: number) => {
    if (expandedId === employeeId) {
      setExpandedId(null)
      return
    }
    setExpandedId(employeeId)
    setEngagingEmployeeId(null)
    void loadAssignments(employeeId)
  }

  // ---- Employee form ----

  const openNewEmployee = () => {
    setEditingEmployeeId(null)
    setEmployeeForm(emptyEmployeeForm)
    setShowEmployeeForm(true)
    setError('')
  }

  const openEditEmployee = (employee: Employee) => {
    setEditingEmployeeId(employee.id)
    setEmployeeForm({
      f_full_name: employee.f_full_name || '',
      f_default_role: employee.f_default_role || '',
      f_document: employee.f_document || '',
      f_phone: employee.f_phone || '',
      f_email: employee.f_email || '',
      f_default_daily_cost:
        employee.f_default_daily_cost != null ? String(employee.f_default_daily_cost) : '',
      f_notes: employee.f_notes || '',
    })
    setShowEmployeeForm(true)
    setError('')
  }

  const closeEmployeeForm = () => {
    setShowEmployeeForm(false)
    setEditingEmployeeId(null)
    setEmployeeForm(emptyEmployeeForm)
  }

  const handleSubmitEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employeeForm.f_full_name.trim()) {
      setError('Nome é obrigatório')
      return
    }
    const payload: EmployeeCreate = {
      f_full_name: employeeForm.f_full_name,
      f_default_role: employeeForm.f_default_role || undefined,
      f_document: employeeForm.f_document || undefined,
      f_phone: employeeForm.f_phone || undefined,
      f_email: employeeForm.f_email || undefined,
      f_notes: employeeForm.f_notes || undefined,
    }
    if (canSeeFinancials && employeeForm.f_default_daily_cost !== '') {
      payload.f_default_daily_cost = employeeForm.f_default_daily_cost
    }
    try {
      setSavingEmployee(true)
      setError('')
      if (editingEmployeeId) {
        await staffService.updateEmployee(editingEmployeeId, payload)
      } else {
        await staffService.createEmployee(payload)
      }
      closeEmployeeForm()
      await loadAll()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao salvar colaborador')
    } finally {
      setSavingEmployee(false)
    }
  }

  const handleDeleteEmployee = async (employee: Employee) => {
    if (!window.confirm(`Excluir colaborador "${employee.f_full_name}"?`)) return
    try {
      setError('')
      await staffService.deleteEmployee(employee.id)
      await loadAll()
    } catch (err: any) {
      // 409 quando há engajamentos (histórico de custo)
      setError(err.response?.data?.detail || 'Falha ao excluir colaborador')
    }
  }

  // ---- Assignment form ----

  const openEngageForm = (employeeId: number) => {
    setEngagingEmployeeId(employeeId)
    setAssignmentForm({ ...emptyAssignmentForm, eventId: events[0]?.id ?? '' })
    setError('')
  }

  const handleSubmitAssignment = async (e: React.FormEvent, employeeId: number) => {
    e.preventDefault()
    if (!assignmentForm.eventId) {
      setError('Selecione o evento do engajamento')
      return
    }
    const payload: StaffAssignmentCreate = {
      f_employee_id: employeeId,
      f_role: assignmentForm.f_role || undefined,
      f_start_date: assignmentForm.f_start_date || null,
      f_end_date: assignmentForm.f_end_date || null,
      f_notes: assignmentForm.f_notes || undefined,
    }
    if (canSeeFinancials) {
      if (assignmentForm.f_daily_cost !== '') payload.f_daily_cost = assignmentForm.f_daily_cost
      if (assignmentForm.f_total_cost !== '') payload.f_total_cost = assignmentForm.f_total_cost
    }
    try {
      setSavingAssignment(true)
      setError('')
      await staffService.createAssignment(Number(assignmentForm.eventId), payload)
      setEngagingEmployeeId(null)
      await loadAssignments(employeeId)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao criar engajamento')
    } finally {
      setSavingAssignment(false)
    }
  }

  const handleDeleteAssignment = async (employeeId: number, assignment: StaffAssignment) => {
    if (!window.confirm('Remover este engajamento?')) return
    try {
      setError('')
      await staffService.deleteAssignment(assignment.id)
      await loadAssignments(employeeId)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao remover engajamento')
    }
  }

  const handleLodge = async (employeeId: number, eventId: number) => {
    try {
      setError('')
      setNotice('')
      const result = await staffService.lodgeEmployee(employeeId, eventId)
      setNotice(
        result.created_guest
          ? `Colaborador adicionado como hóspede no grupo Staff do evento (grupo #${result.group_id}). Aloque o quarto na tela de Rooms/Guests.`
          : 'Este colaborador já está no grupo Staff do evento.',
      )
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao hospedar colaborador')
    }
  }

  return (
    <AdminLayout title="Staff">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void doSearch() }}
              placeholder="Buscar por nome..."
              className="px-3 py-2 border border-gray-300 rounded-md text-sm w-56"
            />
            <button
              onClick={() => void doSearch()}
              className="bg-slate-200 text-slate-700 px-3 py-2 rounded-md hover:bg-slate-300 text-sm"
            >
              Buscar
            </button>
          </div>
          <button
            onClick={openNewEmployee}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            + Novo colaborador
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        )}
        {notice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded mb-4">
            {notice}
          </div>
        )}

        {showEmployeeForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingEmployeeId ? 'Editar colaborador' : 'Novo colaborador'}
            </h2>
            <form onSubmit={handleSubmitEmployee} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nome completo *">
                <input
                  type="text"
                  value={employeeForm.f_full_name}
                  onChange={(e) => setEmployeeForm((c) => ({ ...c, f_full_name: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                  required
                />
              </Field>
              <Field label="Função padrão">
                <input
                  type="text"
                  placeholder="mashguiach, monitor, cozinha, manutenção..."
                  value={employeeForm.f_default_role}
                  onChange={(e) => setEmployeeForm((c) => ({ ...c, f_default_role: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                />
              </Field>
              <Field label="Telefone">
                <input
                  type="text"
                  value={employeeForm.f_phone}
                  onChange={(e) => setEmployeeForm((c) => ({ ...c, f_phone: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                />
              </Field>
              <Field label="Email">
                <input
                  type="text"
                  value={employeeForm.f_email}
                  onChange={(e) => setEmployeeForm((c) => ({ ...c, f_email: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                />
              </Field>
              <Field label="Documento">
                <input
                  type="text"
                  value={employeeForm.f_document}
                  onChange={(e) => setEmployeeForm((c) => ({ ...c, f_document: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                />
              </Field>
              {canSeeFinancials && (
                <Field label="Custo/dia padrão (R$)">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={employeeForm.f_default_daily_cost}
                    onChange={(e) => setEmployeeForm((c) => ({ ...c, f_default_daily_cost: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md w-full"
                  />
                </Field>
              )}
              <Field label="Observações" className="md:col-span-2">
                <input
                  type="text"
                  value={employeeForm.f_notes}
                  onChange={(e) => setEmployeeForm((c) => ({ ...c, f_notes: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                />
              </Field>
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={savingEmployee}
                  className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingEmployee ? 'Salvando...' : editingEmployeeId ? 'Salvar alterações' : 'Criar colaborador'}
                </button>
                <button
                  type="button"
                  onClick={closeEmployeeForm}
                  className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {loading && <div className="text-center text-gray-600 py-12">Carregando colaboradores...</div>}

        {!loading && employees.length === 0 && (
          <div className="text-center text-gray-600 bg-white rounded-lg shadow p-8">
            <p className="text-lg">Nenhum colaborador cadastrado.</p>
            <p className="text-sm mt-2">Cadastre a equipe que opera os eventos (mashguichim, monitores, cozinha...).</p>
          </div>
        )}

        {!loading && employees.length > 0 && (
          <div className="space-y-3">
            {employees.map((employee) => {
              const assignments = assignmentsByEmployee[employee.id] || []
              const expanded = expandedId === employee.id
              const defaultCost = formatMoney(employee.f_default_daily_cost)
              return (
                <div key={employee.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900">{employee.f_full_name}</h3>
                      <p className="text-sm text-slate-500">
                        {employee.f_default_role || 'sem função padrão'}
                        {employee.f_phone ? ` · ${employee.f_phone}` : ''}
                        {defaultCost ? ` · ${defaultCost}/dia` : ''}
                        {employee.f_person_id != null ? ' · vinculado a pessoa raiz' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleExpand(employee.id)}
                        className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md hover:bg-slate-200"
                      >
                        {expanded ? 'Fechar' : 'Engajamentos'}
                      </button>
                      <button
                        onClick={() => openEditEmployee(employee)}
                        className="text-xs text-blue-700 hover:text-blue-900 px-2 py-1.5"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee)}
                        className="text-xs text-red-600 hover:text-red-800 px-2 py-1.5"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-900">
                          Engajamentos ({assignments.length})
                        </h4>
                        <button
                          onClick={() => openEngageForm(employee.id)}
                          className="text-xs text-emerald-700 hover:text-emerald-900"
                        >
                          + Engajar em evento
                        </button>
                      </div>

                      {engagingEmployeeId === employee.id && (
                        <form
                          onSubmit={(e) => handleSubmitAssignment(e, employee.id)}
                          className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 rounded-md p-3 mb-3"
                        >
                          <Field label="Evento *" className="col-span-2">
                            <select
                              value={assignmentForm.eventId}
                              onChange={(e) => setAssignmentForm((c) => ({ ...c, eventId: Number(e.target.value) || '' }))}
                              className="px-3 py-2 border border-gray-300 rounded-md w-full"
                              required
                            >
                              <option value="">Selecione o evento</option>
                              {events.map((ev) => (
                                <option key={ev.id} value={ev.id}>{ev.f_name}</option>
                              ))}
                            </select>
                          </Field>
                          <Field label="Função no evento" className="col-span-2">
                            <input
                              type="text"
                              placeholder={employee.f_default_role || 'ex.: mashguiach'}
                              value={assignmentForm.f_role}
                              onChange={(e) => setAssignmentForm((c) => ({ ...c, f_role: e.target.value }))}
                              className="px-3 py-2 border border-gray-300 rounded-md w-full"
                            />
                          </Field>
                          <Field label="Início (pode ser antes do evento)">
                            <input
                              type="date"
                              value={assignmentForm.f_start_date}
                              onChange={(e) => setAssignmentForm((c) => ({ ...c, f_start_date: e.target.value }))}
                              className="px-3 py-2 border border-gray-300 rounded-md w-full"
                            />
                          </Field>
                          <Field label="Fim">
                            <input
                              type="date"
                              value={assignmentForm.f_end_date}
                              onChange={(e) => setAssignmentForm((c) => ({ ...c, f_end_date: e.target.value }))}
                              className="px-3 py-2 border border-gray-300 rounded-md w-full"
                            />
                          </Field>
                          {canSeeFinancials && (
                            <>
                              <Field label="Diária (R$, override)">
                                <input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={assignmentForm.f_daily_cost}
                                  onChange={(e) => setAssignmentForm((c) => ({ ...c, f_daily_cost: e.target.value }))}
                                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                                />
                              </Field>
                              <Field label="Total fechado (R$)">
                                <input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={assignmentForm.f_total_cost}
                                  onChange={(e) => setAssignmentForm((c) => ({ ...c, f_total_cost: e.target.value }))}
                                  className="px-3 py-2 border border-gray-300 rounded-md w-full"
                                />
                              </Field>
                            </>
                          )}
                          <Field label="Observações" className="col-span-2">
                            <input
                              type="text"
                              value={assignmentForm.f_notes}
                              onChange={(e) => setAssignmentForm((c) => ({ ...c, f_notes: e.target.value }))}
                              className="px-3 py-2 border border-gray-300 rounded-md w-full"
                            />
                          </Field>
                          <div className="col-span-2 md:col-span-4 flex gap-2">
                            <button
                              type="submit"
                              disabled={savingAssignment}
                              className="bg-emerald-600 text-white px-4 py-1.5 rounded-md hover:bg-emerald-700 disabled:opacity-50 text-sm"
                            >
                              {savingAssignment ? 'Salvando...' : 'Engajar'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEngagingEmployeeId(null)}
                              className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-md hover:bg-gray-300 text-sm"
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                      )}

                      {assignments.length === 0 ? (
                        <div className="text-sm text-gray-500 bg-gray-50 rounded-md p-3">
                          Nenhum engajamento ainda.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {assignments.map((assignment) => {
                            const derived = formatMoney(assignment.derived_total_cost)
                            const daily = formatMoney(assignment.effective_daily_cost)
                            return (
                              <div
                                key={assignment.id}
                                className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm flex-wrap gap-2"
                              >
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900">
                                    {eventNames[assignment.f_event_id] || `Evento #${assignment.f_event_id}`}
                                    {assignment.f_role ? ` · ${assignment.f_role}` : ''}
                                  </p>
                                  <p className="text-gray-500">
                                    {assignment.f_start_date && assignment.f_end_date
                                      ? `${assignment.f_start_date} → ${assignment.f_end_date}` +
                                        (assignment.work_days ? ` (${assignment.work_days} dias)` : '')
                                      : 'período não definido'}
                                    {canSeeFinancials && daily ? ` · ${daily}/dia` : ''}
                                    {canSeeFinancials && derived ? ` · total ${derived}` : ''}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => handleLodge(employee.id, assignment.f_event_id)}
                                    title="Adicionar como hóspede no grupo Staff do evento"
                                    className="text-xs bg-violet-50 text-violet-700 px-2 py-1 rounded-md hover:bg-violet-100"
                                  >
                                    🛏 Hospedar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAssignment(employee.id, assignment)}
                                    className="text-xs text-red-600 hover:text-red-800"
                                  >
                                    Remover
                                  </button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
