import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { taskService, Task, TaskCreate } from '../services/api'

export default function TasksPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Form state
  const [newTask, setNewTask] = useState<TaskCreate>({
    f_title: '',
    f_description: '',
    f_priority: 'medium',
    f_task_type: '',
  })

  useEffect(() => {
    if (eventId) {
      loadTasks()
    }
  }, [eventId])

  const loadTasks = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await taskService.getTasks(Number(eventId))
      setTasks(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.f_title.trim()) {
      setError('Title is required')
      return
    }

    try {
      setCreating(true)
      setError('')
      await taskService.createTask(Number(eventId), newTask)
      setNewTask({
        f_title: '',
        f_description: '',
        f_priority: 'medium',
        f_task_type: '',
      })
      setShowCreateForm(false)
      await loadTasks()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create task')
    } finally {
      setCreating(false)
    }
  }

  const handleStatusChange = async (taskId: number, newStatus: Task['f_status']) => {
    try {
      setError('')
      await taskService.updateTaskStatus(taskId, newStatus)
      await loadTasks()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update task status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'low':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getStatusButtonText = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return 'Start'
      case 'in_progress':
        return 'Complete'
      case 'completed':
        return 'Reopen'
      default:
        return 'Update'
    }
  }

  const getNextStatus = (currentStatus: string): Task['f_status'] => {
    switch (currentStatus) {
      case 'pending':
        return 'in_progress'
      case 'in_progress':
        return 'completed'
      case 'completed':
        return 'pending'
      default:
        return 'pending'
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus === 'all') return true
    return task.f_status === filterStatus
  })

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/hotels')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Event Tasks
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.f_username}
              </span>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {showCreateForm ? 'Cancel' : '+ New Task'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Create Task Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Create New Task
            </h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={newTask.f_title}
                  onChange={(e) => setNewTask({ ...newTask, f_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={newTask.f_description}
                  onChange={(e) => setNewTask({ ...newTask, f_description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={newTask.f_priority}
                    onChange={(e) => setNewTask({ ...newTask, f_priority: e.target.value as TaskCreate['f_priority'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <input
                    type="text"
                    id="type"
                    value={newTask.f_task_type}
                    onChange={(e) => setNewTask({ ...newTask, f_task_type: e.target.value })}
                    placeholder="e.g., setup, cleaning, maintenance"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Task'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b border-gray-200">
            {['all', 'pending', 'in_progress', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  filterStatus === status
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                {status !== 'all' && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 rounded-full">
                    {tasks.filter(t => t.f_status === status).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        {loading && (
          <div className="text-center text-gray-600 py-12">
            Loading tasks...
          </div>
        )}

        {!loading && filteredTasks.length === 0 && (
          <div className="text-center text-gray-600 bg-white rounded-lg shadow p-12">
            <p className="text-lg mb-2">No tasks found.</p>
            <p className="text-sm">
              {tasks.length === 0 
                ? 'Create your first task to get started.' 
                : `No ${filterStatus} tasks.`}
            </p>
          </div>
        )}

        {!loading && filteredTasks.length > 0 && (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {task.f_title}
                    </h3>
                    {task.f_description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {task.f_description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.f_status)}`}>
                    {task.f_status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.f_priority)}`}>
                    {task.f_priority.toUpperCase()}
                  </span>
                  {task.f_task_type && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {task.f_task_type}
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    Created: {new Date(task.f_created_at).toLocaleDateString()}
                  </span>
                  
                  {task.f_status !== 'cancelled' && (
                    <button
                      onClick={() => handleStatusChange(task.id, getNextStatus(task.f_status))}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium ${
                        task.f_status === 'completed'
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {getStatusButtonText(task.f_status)}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
