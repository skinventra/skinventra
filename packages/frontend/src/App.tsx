import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import UserProfile from './components/UserProfile'
import AuthSuccess from './components/AuthSuccess'
import { useAuth } from './hooks/useAuth'

function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-night flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        {user && <UserProfile user={user} onLogout={logout} />}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login-success" element={<AuthSuccess />} />
      </Routes>
    </Router>
  )
}

export default App
