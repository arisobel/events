import { useEffect, useMemo, useState } from 'react'

import {
  Client,
  ClientCreate,
  ClientEventLink,
  ClientOpenReservation,
  ClientStatement,
  ClientUpdate,
  LedgerEntryType,
  Person,
  PersonCreate,
  PersonUpdate,
  clientService,
  financeService,
} from '../services/api'
import AdminLayout from '../components/AdminLayout'
import CountryPicker from '../components/CountryPicker'
import Flag from '../components/Flag'
import { useAuth } from '../contexts/AuthContext'

const normalizeText = (value: string) =>
  value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

const emptyClient: ClientCreate = {
  f_name: '',
  f_client_type: '',
  f_nationality: '',
  f_document: '',
  f_phone: '',
  f_email: '',
  f_notes: '',
}

const emptyPerson: PersonCreate = {
  f_full_name: '',
  f_gender: '',
  f_birth_date: '',
  f_document: '',
  f_phone: '',
  f_email: '',
  f_is_primary: false,
  f_notes: '',
}

function LabeledField({
  label,
  className,
  children,
}: {
  label: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ''}`}>
      <span className="text-xs font-medium text-gray-500">{label}</span>
      {children}
    </label>
  )
}

export default function ClientsPage() {
  const { canSeeFinancials } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)

  const [newClient, setNewClient] = useState<ClientCreate>(emptyClient)
  const [editingClientId, setEditingClientId] = useState<number | null>(null)
  const [clientEditForm, setClientEditForm] = useState<ClientUpdate>({})

  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [eventsByClient, setEventsByClient] = useState<Record<number, ClientEventLink[]>>({})
  const [statementByClient, setStatementByClient] = useState<Record<number, ClientStatement>>({})
  const [openResByClient, setOpenResByClient] = useState<Record<number, ClientOpenReservation[]>>({})
  const emptyLedger = { f_entry_type: 'credit' as LedgerEntryType, f_amount: '', f_date: '', f_description: '', applyTo: 0 }
  const [newLedger, setNewLedger] = useState(emptyLedger)
  const [savingLedger, setSavingLedger] = useState(false)

  const [addingPersonClientId, setAddingPersonClientId] = useState<number | null>(null)
  const [newPerson, setNewPerson] = useState<PersonCreate>(emptyPerson)
  const [editingPersonId, setEditingPersonId] = useState<number | null>(null)
  const [personEditForm, setPersonEditForm] = useState<PersonUpdate>({})

  useEffect(() => {
    void loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setLoading(true)
      setError('')
      setClients(await clientService.getClients())
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }

  const visibleClients = useMemo(() => {
    const q = normalizeText(search.trim())
    if (!q) return clients
    return clients.filter((client) => {
      const haystack = [
        client.f_name,
        client.f_client_type ?? '',
        client.f_document ?? '',
        client.f_phone ?? '',
        client.f_email ?? '',
        ...client.persons.map((p) => p.f_full_name),
      ]
      return haystack.some((value) => normalizeText(value).includes(q))
    })
  }, [clients, search])

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newClient.f_name.trim()) {
      setError('Nome do cliente é obrigatório')
      return
    }
    try {
      setSaving(true)
      setError('')
      await clientService.createClient({
        ...newClient,
        f_client_type: newClient.f_client_type || undefined,
        f_nationality: newClient.f_nationality || undefined,
        f_document: newClient.f_document || undefined,
        f_phone: newClient.f_phone || undefined,
        f_email: newClient.f_email || undefined,
        f_notes: newClient.f_notes || undefined,
      })
      setNewClient(emptyClient)
      setShowCreate(false)
      await loadClients()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao criar cliente')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateClient = async (clientId: number) => {
    try {
      setError('')
      await clientService.updateClient(clientId, clientEditForm)
      setEditingClientId(null)
      setClientEditForm({})
      await loadClients()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao atualizar cliente')
    }
  }

  const handleDeleteClient = async (client: Client) => {
    if (
      !window.confirm(
        `Excluir o cliente "${client.f_name}"? As pessoas cadastradas serão removidas. ` +
          'Grupos já criados em eventos são mantidos, apenas desvinculados.',
      )
    ) {
      return
    }
    try {
      setError('')
      await clientService.deleteClient(client.id)
      await loadClients()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao excluir cliente')
    }
  }

  const toggleExpand = async (clientId: number) => {
    const next = expandedId === clientId ? null : clientId
    setExpandedId(next)
    setNewLedger(emptyLedger)
    if (next && !eventsByClient[clientId]) {
      try {
        const events = await clientService.getClientEvents(clientId)
        setEventsByClient((current) => ({ ...current, [clientId]: events }))
      } catch {
        // eventos são complementares; se falhar, o resto segue
      }
    }
    if (next && canSeeFinancials) void refreshStatement(clientId)
  }

  const refreshStatement = async (clientId: number) => {
    try {
      const [statement, openRes] = await Promise.all([
        clientService.getClientStatement(clientId),
        clientService.getOpenReservations(clientId),
      ])
      setStatementByClient((current) => ({ ...current, [clientId]: statement }))
      setOpenResByClient((current) => ({ ...current, [clientId]: openRes }))
    } catch {
      // extrato é complementar
    }
  }

  const handleAddLedger = async (clientId: number, e: React.FormEvent) => {
    e.preventDefault()
    const amount = Number(newLedger.f_amount)
    if (!amount || amount <= 0) {
      setError('Informe um valor positivo para o lançamento')
      return
    }
    const applyToReservation = newLedger.f_entry_type === 'credit' && newLedger.applyTo > 0
    if (!applyToReservation && !newLedger.f_description.trim()) {
      setError('Informe uma descrição para o ajuste manual')
      return
    }
    try {
      setSavingLedger(true)
      setError('')
      if (applyToReservation) {
        // crédito vinculado a uma reserva vira PAGAMENTO na reserva (dá baixa no evento)
        await financeService.createPayment(newLedger.applyTo, {
          f_amount: amount,
          f_paid_at: newLedger.f_date || undefined,
          f_method: newLedger.f_description.trim() || undefined,
        })
      } else {
        // ajuste avulso (não vincula a nenhum evento)
        await clientService.createLedgerEntry(clientId, {
          f_entry_type: newLedger.f_entry_type,
          f_amount: amount,
          f_date: newLedger.f_date || undefined,
          f_description: newLedger.f_description.trim(),
        })
      }
      setNewLedger(emptyLedger)
      await refreshStatement(clientId)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao lançar na conta corrente')
    } finally {
      setSavingLedger(false)
    }
  }

  const handleDeleteLedger = async (clientId: number, entryId: number) => {
    if (!window.confirm('Excluir este lançamento manual?')) return
    try {
      setError('')
      await clientService.deleteLedgerEntry(clientId, entryId)
      await refreshStatement(clientId)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao excluir lançamento')
    }
  }

  const formatMoney = (value: string | number | null | undefined) => {
    const num = Number(value ?? 0)
    return (Number.isNaN(num) ? 0 : num).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const startAddPerson = (clientId: number) => {
    setAddingPersonClientId(clientId)
    setEditingPersonId(null)
    setNewPerson(emptyPerson)
    if (expandedId !== clientId) setExpandedId(clientId)
  }

  const handleAddPerson = async (clientId: number, e: React.FormEvent) => {
    e.preventDefault()
    if (!newPerson.f_full_name.trim()) {
      setError('Nome da pessoa é obrigatório')
      return
    }
    try {
      setError('')
      await clientService.createPerson(clientId, {
        ...newPerson,
        f_gender: newPerson.f_gender || undefined,
        f_birth_date: newPerson.f_birth_date || undefined,
        f_document: newPerson.f_document || undefined,
        f_phone: newPerson.f_phone || undefined,
        f_email: newPerson.f_email || undefined,
        f_notes: newPerson.f_notes || undefined,
      })
      setAddingPersonClientId(null)
      setNewPerson(emptyPerson)
      await loadClients()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao adicionar pessoa')
    }
  }

  const handleUpdatePerson = async (clientId: number, personId: number) => {
    try {
      setError('')
      await clientService.updatePerson(clientId, personId, personEditForm)
      setEditingPersonId(null)
      setPersonEditForm({})
      await loadClients()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao atualizar pessoa')
    }
  }

  const handleDeletePerson = async (clientId: number, personId: number) => {
    if (!window.confirm('Remover esta pessoa do cadastro do cliente?')) return
    try {
      setError('')
      await clientService.deletePerson(clientId, personId)
      await loadClients()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Falha ao remover pessoa')
    }
  }

  const formatDate = (value: string | null | undefined) =>
    value ? new Date(value).toLocaleDateString('pt-BR') : ''

  const renderPersonFields = (
    person: PersonCreate | PersonUpdate,
    onChange: (field: keyof PersonCreate, value: string | boolean) => void,
  ) => (
    <>
      <LabeledField label="Nome completo *">
        <input
          type="text"
          value={(person.f_full_name as string | undefined) ?? ''}
          onChange={(e) => onChange('f_full_name', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </LabeledField>
      <LabeledField label="Gênero">
        <select
          value={(person.f_gender as string | undefined) ?? ''}
          onChange={(e) => onChange('f_gender', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white"
        >
          <option value="">—</option>
          <option value="male">Masculino</option>
          <option value="female">Feminino</option>
        </select>
      </LabeledField>
      <LabeledField label="Nascimento">
        <input
          type="date"
          value={(person.f_birth_date as string | undefined) ?? ''}
          onChange={(e) => onChange('f_birth_date', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
      </LabeledField>
      <LabeledField label="Documento">
        <input
          type="text"
          value={(person.f_document as string | undefined) ?? ''}
          onChange={(e) => onChange('f_document', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
      </LabeledField>
      <LabeledField label="Telefone">
        <input
          type="text"
          value={(person.f_phone as string | undefined) ?? ''}
          onChange={(e) => onChange('f_phone', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
      </LabeledField>
      <LabeledField label="Email">
        <input
          type="email"
          value={(person.f_email as string | undefined) ?? ''}
          onChange={(e) => onChange('f_email', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
      </LabeledField>
      <label className="md:col-span-2 flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={Boolean(person.f_is_primary)}
          onChange={(e) => onChange('f_is_primary', e.target.checked)}
        />
        Contato principal (titular)
      </label>
    </>
  )

  return (
    <AdminLayout title="Clientes">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-2 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Clientes</h1>
            <p className="text-sm text-gray-500">Cadastro permanente de famílias/organizações, reutilizável entre eventos.</p>
          </div>
          <button
            onClick={() => setShowCreate((c) => !c)}
            className="shrink-0 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm"
          >
            {showCreate ? 'Cancelar' : '+ Novo cliente'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
        )}

        {showCreate && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Novo cliente</h2>
            <form onSubmit={handleCreateClient} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LabeledField label="Nome *">
                <input
                  type="text"
                  placeholder="ex.: Família Zellerkraut"
                  value={newClient.f_name}
                  onChange={(e) => setNewClient((c) => ({ ...c, f_name: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </LabeledField>
              <LabeledField label="Tipo">
                <select
                  value={newClient.f_client_type || ''}
                  onChange={(e) => setNewClient((c) => ({ ...c, f_client_type: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                >
                  <option value="">—</option>
                  <option value="family">Família</option>
                  <option value="company">Empresa / Organização</option>
                </select>
              </LabeledField>
              <LabeledField label="Nacionalidade">
                <CountryPicker
                  value={newClient.f_nationality || ''}
                  onChange={(code) => setNewClient((c) => ({ ...c, f_nationality: code }))}
                />
              </LabeledField>
              <LabeledField label="Documento">
                <input
                  type="text"
                  value={newClient.f_document}
                  onChange={(e) => setNewClient((c) => ({ ...c, f_document: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
              </LabeledField>
              <LabeledField label="Telefone">
                <input
                  type="text"
                  placeholder="+55 11 90000-0000"
                  value={newClient.f_phone}
                  onChange={(e) => setNewClient((c) => ({ ...c, f_phone: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
              </LabeledField>
              <LabeledField label="Email">
                <input
                  type="email"
                  placeholder="nome@email.com"
                  value={newClient.f_email}
                  onChange={(e) => setNewClient((c) => ({ ...c, f_email: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
              </LabeledField>
              <LabeledField label="Notas" className="md:col-span-2">
                <input
                  type="text"
                  value={newClient.f_notes}
                  onChange={(e) => setNewClient((c) => ({ ...c, f_notes: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
              </LabeledField>
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Criar cliente'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="bg-gray-200 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {loading && <div className="text-center text-gray-600 py-12">Carregando clientes...</div>}

        {!loading && clients.length === 0 && (
          <div className="text-center text-gray-600 bg-white rounded-lg shadow p-8">
            <p className="text-lg">Nenhum cliente ainda.</p>
            <p className="text-sm mt-2">Cadastre a primeira família ou organização.</p>
          </div>
        )}

        {!loading && clients.length > 0 && (
          <div className="space-y-4">
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                aria-hidden="true"
              >
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 3.4 9.83l3.63 3.64a.75.75 0 1 0 1.06-1.06l-3.64-3.63A5.5 5.5 0 0 0 9 3.5ZM5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" clipRule="evenodd" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cliente ou pessoa…"
                className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2.5 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>

            {visibleClients.length === 0 ? (
              <div className="text-center text-gray-500 bg-white rounded-lg shadow p-8 text-sm">
                Nenhum cliente corresponde a “{search}”.
              </div>
            ) : (
              <div className="space-y-4">
                {visibleClients.map((client) => {
                  const primary = client.persons.find((p) => p.f_is_primary)
                  const events = eventsByClient[client.id]
                  const statement = statementByClient[client.id]
                  const openRes = openResByClient[client.id] ?? []
                  return (
                    <div key={client.id} className="bg-white rounded-lg shadow p-6">
                      {editingClientId === client.id ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <LabeledField label="Nome *">
                            <input
                              type="text"
                              value={clientEditForm.f_name ?? ''}
                              onChange={(e) => setClientEditForm((c) => ({ ...c, f_name: e.target.value }))}
                              className="px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </LabeledField>
                          <LabeledField label="Tipo">
                            <select
                              value={clientEditForm.f_client_type ?? ''}
                              onChange={(e) => setClientEditForm((c) => ({ ...c, f_client_type: e.target.value }))}
                              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                            >
                              <option value="">—</option>
                              <option value="family">Família</option>
                              <option value="company">Empresa / Organização</option>
                            </select>
                          </LabeledField>
                          <LabeledField label="Nacionalidade">
                            <CountryPicker
                              value={clientEditForm.f_nationality ?? ''}
                              onChange={(code) => setClientEditForm((c) => ({ ...c, f_nationality: code }))}
                            />
                          </LabeledField>
                          <LabeledField label="Documento">
                            <input
                              type="text"
                              value={clientEditForm.f_document ?? ''}
                              onChange={(e) => setClientEditForm((c) => ({ ...c, f_document: e.target.value }))}
                              className="px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </LabeledField>
                          <LabeledField label="Telefone">
                            <input
                              type="text"
                              value={clientEditForm.f_phone ?? ''}
                              onChange={(e) => setClientEditForm((c) => ({ ...c, f_phone: e.target.value }))}
                              className="px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </LabeledField>
                          <LabeledField label="Email">
                            <input
                              type="email"
                              value={clientEditForm.f_email ?? ''}
                              onChange={(e) => setClientEditForm((c) => ({ ...c, f_email: e.target.value }))}
                              className="px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </LabeledField>
                          <LabeledField label="Notas" className="md:col-span-2">
                            <input
                              type="text"
                              value={clientEditForm.f_notes ?? ''}
                              onChange={(e) => setClientEditForm((c) => ({ ...c, f_notes: e.target.value }))}
                              className="px-3 py-2 border border-gray-300 rounded-md"
                            />
                          </LabeledField>
                          <div className="md:col-span-2 flex gap-2">
                            <button
                              onClick={() => handleUpdateClient(client.id)}
                              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={() => {
                                setEditingClientId(null)
                                setClientEditForm({})
                              }}
                              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                                {client.f_nationality && <Flag code={client.f_nationality} size={22} />}
                                {client.f_name}
                                {client.f_client_type && (
                                  <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-50 text-indigo-700">
                                    {client.f_client_type === 'company' ? 'Empresa' : 'Família'}
                                  </span>
                                )}
                              </h2>
                              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                                <span>{client.persons.length} pessoa{client.persons.length === 1 ? '' : 's'}</span>
                                {primary && <span>Titular: {primary.f_full_name}</span>}
                                {client.f_phone && <span>Tel: {client.f_phone}</span>}
                                {client.f_email && <span>{client.f_email}</span>}
                              </div>
                            </div>
                            <div className="flex flex-nowrap gap-2 overflow-x-auto">
                              <button
                                onClick={() => toggleExpand(client.id)}
                                className="shrink-0 whitespace-nowrap bg-slate-100 text-slate-700 px-3 py-2 rounded-md hover:bg-slate-200 text-sm"
                              >
                                {expandedId === client.id ? 'Fechar' : 'Detalhes'}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingClientId(client.id)
                                  setClientEditForm({
                                    f_name: client.f_name,
                                    f_client_type: client.f_client_type || '',
                                    f_nationality: client.f_nationality || '',
                                    f_document: client.f_document || '',
                                    f_phone: client.f_phone || '',
                                    f_email: client.f_email || '',
                                    f_notes: client.f_notes || '',
                                  })
                                }}
                                className="shrink-0 whitespace-nowrap bg-gray-100 text-gray-800 px-3 py-2 rounded-md hover:bg-gray-200 text-sm"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteClient(client)}
                                className="shrink-0 whitespace-nowrap bg-red-50 text-red-700 px-3 py-2 rounded-md hover:bg-red-100 text-sm"
                              >
                                Excluir
                              </button>
                            </div>
                          </div>

                          {expandedId === client.id && (
                            <div className="mt-5 border-t border-gray-200 pt-5 space-y-6">
                              {/* Pessoas */}
                              <div>
                                <div className="flex items-center justify-between">
                                  <h3 className="text-sm font-semibold text-gray-900">
                                    Pessoas ({client.persons.length})
                                  </h3>
                                  <button
                                    onClick={() => startAddPerson(client.id)}
                                    className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md hover:bg-indigo-100 text-sm"
                                  >
                                    + Pessoa
                                  </button>
                                </div>

                                {addingPersonClientId === client.id && (
                                  <form
                                    onSubmit={(e) => handleAddPerson(client.id, e)}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 rounded-lg border border-indigo-100 bg-indigo-50 p-4"
                                  >
                                    {renderPersonFields(newPerson, (field, value) =>
                                      setNewPerson((c) => ({ ...c, [field]: value })),
                                    )}
                                    <div className="md:col-span-2 flex gap-2">
                                      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                                        Salvar pessoa
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setAddingPersonClientId(null)}
                                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  </form>
                                )}

                                {client.persons.length === 0 ? (
                                  <p className="mt-3 text-sm text-gray-500 bg-gray-50 rounded-md p-3">
                                    Nenhuma pessoa cadastrada ainda.
                                  </p>
                                ) : (
                                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {client.persons.map((person: Person) => (
                                      <div
                                        key={person.id}
                                        className={`rounded-lg border border-gray-200 p-3 ${
                                          editingPersonId === person.id ? 'md:col-span-2' : ''
                                        }`}
                                      >
                                        {editingPersonId === person.id ? (
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {renderPersonFields(personEditForm, (field, value) =>
                                              setPersonEditForm((c) => ({ ...c, [field]: value })),
                                            )}
                                            <div className="md:col-span-2 flex gap-2">
                                              <button
                                                onClick={() => handleUpdatePerson(client.id, person.id)}
                                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                                              >
                                                Salvar
                                              </button>
                                              <button
                                                onClick={() => {
                                                  setEditingPersonId(null)
                                                  setPersonEditForm({})
                                                }}
                                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                                              >
                                                Cancelar
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex items-start justify-between gap-2">
                                            <div>
                                              <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-sm font-medium text-gray-900">{person.f_full_name}</p>
                                                {person.f_is_primary && (
                                                  <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">
                                                    Titular
                                                  </span>
                                                )}
                                              </div>
                                              <div className="mt-1 space-y-0.5 text-sm text-gray-600">
                                                {person.f_phone && <p>Tel: {person.f_phone}</p>}
                                                {person.f_email && <p>{person.f_email}</p>}
                                                {person.f_birth_date && <p>Nasc.: {formatDate(person.f_birth_date)}</p>}
                                              </div>
                                            </div>
                                            <div className="flex gap-2">
                                              <button
                                                onClick={() => {
                                                  setEditingPersonId(person.id)
                                                  setPersonEditForm({
                                                    f_full_name: person.f_full_name,
                                                    f_gender: person.f_gender || '',
                                                    f_birth_date: person.f_birth_date || '',
                                                    f_document: person.f_document || '',
                                                    f_phone: person.f_phone || '',
                                                    f_email: person.f_email || '',
                                                    f_is_primary: person.f_is_primary,
                                                    f_notes: person.f_notes || '',
                                                  })
                                                }}
                                                className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-md hover:bg-gray-200 text-sm"
                                              >
                                                Editar
                                              </button>
                                              <button
                                                onClick={() => handleDeletePerson(client.id, person.id)}
                                                className="bg-red-50 text-red-700 px-3 py-1.5 rounded-md hover:bg-red-100 text-sm"
                                              >
                                                Excluir
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Eventos em que participou */}
                              <div>
                                <h3 className="text-sm font-semibold text-gray-900">Participações em eventos</h3>
                                {events === undefined ? (
                                  <p className="mt-2 text-sm text-gray-400">Carregando…</p>
                                ) : events.length === 0 ? (
                                  <p className="mt-2 text-sm text-gray-500">
                                    Ainda não participou de nenhum evento. Importe este cliente para um evento na tela de Guests.
                                  </p>
                                ) : (
                                  <ul className="mt-2 space-y-1 text-sm">
                                    {events.map((ev) => (
                                      <li key={ev.group_id} className="flex items-center gap-2 text-gray-700">
                                        <span className="text-gray-400">•</span>
                                        {ev.event_name}
                                        <span className="text-gray-400">— grupo “{ev.group_name}”</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>

                              {/* Conta corrente (extrato) — só para alçada financeira */}
                              {canSeeFinancials && (
                              <div>
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <h3 className="text-sm font-semibold text-gray-900">Conta corrente</h3>
                                  {statement && (
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                                      <span className="text-gray-500">Débitos: <span className="font-medium text-gray-800">{formatMoney(statement.total_debit)}</span></span>
                                      <span className="text-gray-500">Créditos: <span className="font-medium text-emerald-700">{formatMoney(statement.total_credit)}</span></span>
                                      <span className="text-gray-500">
                                        Saldo:{' '}
                                        <span className={`font-semibold ${Number(statement.balance) < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                                          {formatMoney(statement.balance)}
                                        </span>
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {statement === undefined ? (
                                  <p className="mt-2 text-sm text-gray-400">Carregando…</p>
                                ) : (
                                  <div className="mt-3 overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                                          <th className="py-1.5 pr-3 font-medium">Data</th>
                                          <th className="py-1.5 pr-3 font-medium">Descrição</th>
                                          <th className="py-1.5 pr-3 font-medium text-right">Débito</th>
                                          <th className="py-1.5 pr-3 font-medium text-right">Crédito</th>
                                          <th className="py-1.5 font-medium"></th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {statement.entries.length === 0 ? (
                                          <tr>
                                            <td colSpan={5} className="py-3 text-gray-500">
                                              Sem lançamentos. Débitos e pagamentos aparecem automaticamente conforme reservas e pagamentos; adicione ajustes manuais abaixo.
                                            </td>
                                          </tr>
                                        ) : (
                                          statement.entries.map((entry, idx) => (
                                            <tr key={idx} className="border-b border-gray-50">
                                              <td className="py-1.5 pr-3 whitespace-nowrap text-gray-600">{formatDate(entry.date)}</td>
                                              <td className="py-1.5 pr-3">
                                                {entry.description}
                                                {entry.source === 'manual' && (
                                                  <span className="ml-1 text-xs text-amber-600">(manual)</span>
                                                )}
                                              </td>
                                              <td className="py-1.5 pr-3 text-right text-rose-700">
                                                {entry.entry_type === 'debit' ? formatMoney(entry.amount) : ''}
                                              </td>
                                              <td className="py-1.5 pr-3 text-right text-emerald-700">
                                                {entry.entry_type === 'credit' ? formatMoney(entry.amount) : ''}
                                              </td>
                                              <td className="py-1.5 text-right">
                                                {entry.source === 'manual' && entry.ledger_entry_id != null && (
                                                  <button
                                                    onClick={() => handleDeleteLedger(client.id, entry.ledger_entry_id as number)}
                                                    className="text-xs text-red-600 hover:text-red-800"
                                                  >
                                                    excluir
                                                  </button>
                                                )}
                                              </td>
                                            </tr>
                                          ))
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                )}

                                {/* Lançamento manual */}
                                <form
                                  onSubmit={(e) => handleAddLedger(client.id, e)}
                                  className="mt-3 flex flex-wrap items-end gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3"
                                >
                                  <LabeledField label="Tipo">
                                    <select
                                      value={newLedger.f_entry_type}
                                      onChange={(e) => setNewLedger((c) => ({ ...c, f_entry_type: e.target.value as LedgerEntryType, applyTo: e.target.value === 'credit' ? c.applyTo : 0 }))}
                                      className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                                    >
                                      <option value="credit">Crédito (+)</option>
                                      <option value="debit">Débito (−)</option>
                                    </select>
                                  </LabeledField>
                                  {newLedger.f_entry_type === 'credit' && openRes.length > 0 && (
                                    <LabeledField label="Aplicar a (dar baixa)">
                                      <select
                                        value={newLedger.applyTo}
                                        onChange={(e) => setNewLedger((c) => ({ ...c, applyTo: Number(e.target.value) }))}
                                        className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                                      >
                                        <option value={0}>— Ajuste avulso —</option>
                                        {openRes.map((r) => (
                                          <option key={r.reservation_id} value={r.reservation_id}>
                                            {r.event_name} — saldo {formatMoney(r.balance)}
                                          </option>
                                        ))}
                                      </select>
                                    </LabeledField>
                                  )}
                                  <LabeledField label="Valor">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={newLedger.f_amount}
                                      onChange={(e) => setNewLedger((c) => ({ ...c, f_amount: e.target.value }))}
                                      className="px-3 py-2 border border-gray-300 rounded-md w-32"
                                    />
                                  </LabeledField>
                                  <LabeledField label="Data">
                                    <input
                                      type="date"
                                      value={newLedger.f_date}
                                      onChange={(e) => setNewLedger((c) => ({ ...c, f_date: e.target.value }))}
                                      className="px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                  </LabeledField>
                                  <LabeledField
                                    label={newLedger.applyTo > 0 ? 'Forma (opcional)' : 'Descrição'}
                                    className="flex-1 min-w-[10rem]"
                                  >
                                    <input
                                      type="text"
                                      placeholder={newLedger.applyTo > 0 ? 'PIX, dinheiro, transferência…' : 'ex.: Depósito, desconto, dívida anterior…'}
                                      value={newLedger.f_description}
                                      onChange={(e) => setNewLedger((c) => ({ ...c, f_description: e.target.value }))}
                                      className="px-3 py-2 border border-gray-300 rounded-md w-full"
                                    />
                                  </LabeledField>
                                  <button
                                    type="submit"
                                    disabled={savingLedger}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm disabled:opacity-50"
                                  >
                                    {savingLedger ? '...' : newLedger.applyTo > 0 ? 'Registrar pagamento' : 'Lançar'}
                                  </button>
                                </form>
                              </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
