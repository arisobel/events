import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import HotelsPage from './pages/HotelsPage'
import EventsPage from './pages/EventsPage'
import TasksPage from './pages/TasksPage'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/hotels" element={
            <PrivateRoute>
              <HotelsPage />
            </PrivateRoute>
          } />
          <Route path="/events" element={
            <PrivateRoute>
              <EventsPage />
            </PrivateRoute>
          } />
          <Route path="/events/:eventId/tasks" element={
            <PrivateRoute>
              <TasksPage />
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
