import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import AuthSuccess from './components/AuthSuccess'
import PortfoliosPage from './pages/PortfoliosPage'

function HomePage() {
  return (
    <div className="min-h-screen bg-night flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-mint mb-6">Skinventra</h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            Skinventra is a SaaS platform for tracking and analyzing Steam inventory. 
            Users can manage portfolios, monitor item prices, calculate P&L, and access 
            advanced analytics. Free and paid tiers with Steam OAuth and automated price updates.
          </p>
        </div>
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
        <Route path="/portfolios" element={<PortfoliosPage />} />
      </Routes>
    </Router>
  )
}

export default App
