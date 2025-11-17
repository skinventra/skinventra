import { useHoldings, usePortfolioSummary } from '../../hooks/useHoldings';

interface PortfolioHoldingsProps {
  portfolioId: string;
}

export default function PortfolioHoldings({ portfolioId }: PortfolioHoldingsProps) {
  const { data: holdings, isLoading: holdingsLoading } = useHoldings(portfolioId);
  const { data: summary, isLoading: summaryLoading } = usePortfolioSummary(portfolioId);

  if (holdingsLoading || summaryLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-charleston-green border border-feldgrau rounded-lg p-6 animate-pulse">
          <div className="h-6 bg-feldgrau rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-feldgrau rounded w-3/4"></div>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-charleston-green border border-feldgrau rounded-lg p-4 animate-pulse"
            >
              <div className="h-5 bg-feldgrau rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-feldgrau rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {summary && (
        <div className="bg-charleston-green border border-feldgrau rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Portfolio Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-cadet-500 mb-1">Total Invested</p>
              <p className="text-xl font-semibold text-white">
                ${summary.totalInvested.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-cadet-500 mb-1">Current Value</p>
              <p className="text-xl font-semibold text-white">
                ${summary.totalValue.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-cadet-500 mb-1">Profit/Loss</p>
              <p
                className={`text-xl font-semibold ${
                  summary.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {summary.profitLoss >= 0 ? '+' : ''}${summary.profitLoss.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-cadet-500 mb-1">Return</p>
              <p
                className={`text-xl font-semibold ${
                  summary.profitLossPercentage >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {summary.profitLossPercentage >= 0 ? '+' : ''}
                {summary.profitLossPercentage.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Holdings</h3>
        {!holdings || holdings.length === 0 ? (
          <div className="text-center py-12 bg-charleston-green border border-feldgrau rounded-lg">
            <p className="text-cadet-500">No holdings yet</p>
            <p className="text-sm text-cadet-600 mt-1">
              Add transactions to see your holdings
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {holdings.map((holding) => {
              const currentValue =
                (holding.asset.currentPrice || 0) * holding.quantity;
              const profitLoss = currentValue - holding.totalInvested;
              const profitLossPercentage =
                holding.totalInvested > 0
                  ? (profitLoss / holding.totalInvested) * 100
                  : 0;

              return (
                <div
                  key={holding.asset.id}
                  className="bg-charleston-green border border-feldgrau rounded-lg p-4 hover:border-cadet-500 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {holding.asset.iconUrl && (
                      <img
                        src={holding.asset.iconUrl}
                        alt={holding.asset.name}
                        className="w-16 h-16 object-contain flex-shrink-0"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate mb-2">
                        {holding.asset.name}
                      </h4>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <p className="text-cadet-500">Quantity</p>
                          <p className="text-white font-medium">{holding.quantity}</p>
                        </div>
                        <div>
                          <p className="text-cadet-500">Avg. Price</p>
                          <p className="text-white font-medium">
                            ${holding.averagePrice.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-cadet-500">Invested</p>
                          <p className="text-white font-medium">
                            ${holding.totalInvested.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-cadet-500">Current Value</p>
                          <p className="text-white font-medium">
                            ${currentValue.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-cadet-500">P&L</p>
                          <p
                            className={`font-semibold ${
                              profitLoss >= 0 ? 'text-green-500' : 'text-red-500'
                            }`}
                          >
                            {profitLoss >= 0 ? '+' : ''}${profitLoss.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-cadet-500">Return</p>
                          <p
                            className={`font-semibold ${
                              profitLossPercentage >= 0
                                ? 'text-green-500'
                                : 'text-red-500'
                            }`}
                          >
                            {profitLossPercentage >= 0 ? '+' : ''}
                            {profitLossPercentage.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}



