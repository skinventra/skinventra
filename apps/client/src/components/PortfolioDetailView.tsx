import { useEffect } from 'react';
import { usePortfolioEdit } from '../hooks/usePortfolioEdit';
import PortfolioSidebar from './PortfolioSidebar';
import ActionButton from './ActionButton';
import EditIcon from './icons/EditIcon';
import SaveIcon from './icons/SaveIcon';
import CloseIcon from './icons/CloseIcon';
import type { Portfolio } from '../types/portfolio';

interface PortfolioDetailViewProps {
  portfolioId: string;
  onBack: () => void;
  onSelectPortfolio: (id: string) => void;
  portfoliosData: {
    portfolios: Portfolio[];
    loading: boolean;
    error: string | null;
    updatePortfolio: (id: string, data: { title?: string }) => Promise<void>;
    isUpdating: boolean;
  };
}

export default function PortfolioDetailView({ 
  portfolioId, 
  onBack,
  onSelectPortfolio,
  portfoliosData
}: PortfolioDetailViewProps) {
  const { portfolios, loading, error, updatePortfolio, isUpdating } = portfoliosData;

  const {
    editingId,
    editingTitle,
    setEditingTitle,
    startEdit,
    saveEdit,
    cancelEdit,
  } = usePortfolioEdit(async (id, title) => {
    await updatePortfolio(id, { title });
  });

  // Reset editing state when switching portfolios
  useEffect(() => {
    cancelEdit();
  }, [portfolioId]);

  const portfolio = portfolios.find(p => p.id === portfolioId);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Portfolio not found
          </h2>
          <button
            onClick={onBack}
            className="text-mint hover:text-mint-light transition-colors"
          >
            Back to portfolios
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PortfolioSidebar 
        portfolios={portfolios}
        currentPortfolioId={portfolioId}
        onSelectPortfolio={onSelectPortfolio}
        onBack={onBack}
      />
      
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-davys-100 border border-white-200 rounded-lg shadow-lg p-6 mb-6 group">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  {editingId === portfolio.id ? (
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && editingTitle.trim()) {
                          saveEdit(portfolio.id);
                        } else if (e.key === 'Escape') {
                          cancelEdit();
                        }
                      }}
                      className="w-full px-3 py-2 border border-cadet-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 text-2xl"
                      disabled={isUpdating}
                      autoFocus
                    />
                  ) : (
                    <h1 className="text-3xl font-bold text-white">
                      {portfolio.title}
                    </h1>
                  )}
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {editingId === portfolio.id ? (
                    <>
                      <ActionButton
                        onClick={() => saveEdit(portfolio.id)}
                        disabled={isUpdating || !editingTitle.trim()}
                        variant="save"
                        title="Save"
                      >
                        <SaveIcon />
                      </ActionButton>
                      <ActionButton
                        onClick={cancelEdit}
                        disabled={isUpdating}
                        variant="cancel"
                        title="Cancel"
                      >
                        <CloseIcon />
                      </ActionButton>
                    </>
                  ) : (
                    <ActionButton
                      onClick={() => startEdit(portfolio.id, portfolio.title)}
                      disabled={isUpdating}
                      variant="edit"
                      title="Edit"
                    >
                      <EditIcon />
                    </ActionButton>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <div>
                  <span className="text-gray-400">Created:</span>{' '}
                  <span className="text-white">
                    {new Date(portfolio.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Last Updated:</span>{' '}
                  <span className="text-white">
                    {new Date(portfolio.updatedAt).toLocaleString()}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-gray-400">Portfolio ID:</span>{' '}
                  <span className="text-white font-mono text-sm">
                    {portfolio.id}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-davys-100 border border-white-200 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Portfolio Items
              </h2>
              <div className="text-center text-gray-400 py-12">
                Items functionality coming soon...
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

