import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import AuthSuccess from './components/AuthSuccess'

function HomePage() {
  return (
    <div className="min-h-screen bg-night flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        {/* Main content will be added here */}
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
