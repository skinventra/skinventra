import { useAuth } from '../hooks/useAuth';
import CreatePortfolioForm from '../components/CreatePortfolioForm';
import PortfolioList from '../components/PortfolioList';
import Header from '../components/Header';

export default function PortfoliosPage() {
  const { user, loading } = useAuth();

  // Handle loading state
  if (loading) {
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
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <CreatePortfolioForm />
          <PortfolioList />
        </div>
      </main>
    </div>
  );
}

