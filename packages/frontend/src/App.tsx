import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SteamLoginButton from './components/SteamLoginButton'
import UserProfile from './components/UserProfile'
import AuthSuccess from './components/AuthSuccess'
import { useAuth } from './hooks/useAuth'

function HomePage() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {user ? (
        <UserProfile user={user} onLogout={logout} />
      ) : (
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Welcome to SkinVentra
          </h1>
          <SteamLoginButton />
        </div>
      )}
    </main>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
      </Routes>
    </Router>
  )
}

export default App
