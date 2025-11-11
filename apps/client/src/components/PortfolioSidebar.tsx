import type { Portfolio } from '../types/portfolio';

interface PortfolioSidebarProps {
  portfolios: Portfolio[];
  currentPortfolioId: string;
  onSelectPortfolio: (id: string) => void;
  onBack: () => void;
}

export default function PortfolioSidebar({ 
  portfolios, 
  currentPortfolioId,
  onSelectPortfolio,
  onBack
}: PortfolioSidebarProps) {
  return (
    <aside className="w-64 bg-davys-200 border-r border-white-200 overflow-y-auto flex-shrink-0">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Portfolios</h2>
          <button
            onClick={onBack}
            className="text-xs text-mint hover:text-mint-light transition-colors px-2 py-1 rounded hover:bg-davys-100"
            title="Back to all portfolios"
          >
            View All
          </button>
        </div>
        
        <div className="space-y-2">
          {portfolios.map(portfolio => (
            <button
              key={portfolio.id}
              onClick={() => onSelectPortfolio(portfolio.id)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                currentPortfolioId === portfolio.id
                  ? 'bg-mint text-night font-medium'
                  : 'text-white hover:bg-davys-100'
              }`}
            >
              <div className="truncate">{portfolio.title}</div>
              <div className="text-xs opacity-70 mt-1">
                {new Date(portfolio.createdAt).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

