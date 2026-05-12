import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '../contexts/AuthContext'
import { eventService } from '../services/api'
import { getDefaultEventPath } from '../utils/events'

export default function AppEntryRedirect() {
  const { isAuthenticated, loading } = useAuth()
  const [targetPath, setTargetPath] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    const resolveTarget = async () => {
      try {
        const events = await eventService.getEvents()
        setTargetPath(getDefaultEventPath(events))
      } catch (error) {
        console.error('Failed to resolve entry path:', error)
        setTargetPath('/events')
      }
    }

    void resolveTarget()
  }, [isAuthenticated])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!targetPath) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Resolving active event...</div>
      </div>
    )
  }

  return <Navigate to={targetPath} replace />
}
