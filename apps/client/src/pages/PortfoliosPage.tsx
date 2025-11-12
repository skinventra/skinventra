import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePortfolios } from '../hooks/usePortfolios';
import CreatePortfolioForm from '../components/portfolio/CreatePortfolioForm';
import PortfolioList from '../components/portfolio/PortfolioList';
import PortfolioDetailView from '../components/portfolio/PortfolioDetailView';
import Header from '../components/header/Header';

export default function PortfoliosPage() {
  const { user, loading: authLoading } = useAuth();
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  
  const portfoliosData = usePortfolios();
  const { portfolios } = portfoliosData;

  // Auto-redirect back if selected portfolio is deleted
  useEffect(() => {
    if (selectedPortfolioId) {
      const portfolioExists = portfolios.some(p => p.id === selectedPortfolioId);
      if (!portfolioExists) {
        setSelectedPortfolioId(null);
      }
    }
  }, [portfolios, selectedPortfolioId]);

  // Handle auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-night flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </main>
      </div>
    );
  }

  // Show login message if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-night flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Please login to manage portfolios
            </h2>
            <p className="text-gray-400">
              You need to be authenticated to create and manage your portfolios.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-night flex flex-col">
      <Header />
      
      <main className="flex-1 flex overflow-hidden">
        {selectedPortfolioId ? (
          <PortfolioDetailView 
            portfolioId={selectedPortfolioId}
            onBack={() => setSelectedPortfolioId(null)}
            onSelectPortfolio={setSelectedPortfolioId}
            portfoliosData={portfoliosData}
          />
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-8">
              <div className="max-w-4xl mx-auto space-y-8">
                <CreatePortfolioForm 
                  createPortfolio={portfoliosData.createPortfolio}
                  isCreating={portfoliosData.isCreating}
                  createError={portfoliosData.createError}
                />
                <PortfolioList 
                  onSelectPortfolio={setSelectedPortfolioId}
                  portfoliosData={portfoliosData}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

