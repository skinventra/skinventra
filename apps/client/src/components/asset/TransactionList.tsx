import { useTransactions, useDeleteTransaction } from '../../hooks/useTransactions';
import type { AssetTransaction } from '../../types/asset';
import { DeleteIcon } from '../icons/DeleteIcon';

interface TransactionListProps {
  portfolioId: string;
}

export default function TransactionList({ portfolioId }: TransactionListProps) {
  const { data: transactions, isLoading } = useTransactions(portfolioId);
  const deleteTransaction = useDeleteTransaction(portfolioId);

  const handleDelete = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await deleteTransaction.mutateAsync(transactionId);
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      alert('Failed to delete transaction');
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'BUY':
        return 'Buy';
      case 'SELL':
        return 'Sell';
      case 'TRANSFER_IN':
        return 'Transfer In';
      case 'TRANSFER_OUT':
        return 'Transfer Out';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BUY':
      case 'TRANSFER_IN':
        return 'text-green-500';
      case 'SELL':
      case 'TRANSFER_OUT':
        return 'text-red-500';
      default:
        return 'text-cadet-500';
    }
  };

  if (isLoading) {
    return (
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
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-cadet-500">No transactions yet</p>
        <p className="text-sm text-cadet-600 mt-1">
          Click "Add Transaction" to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="bg-charleston-green border border-feldgrau rounded-lg p-4 hover:border-cadet-500 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {transaction.asset?.iconUrl && (
                <img
                  src={transaction.asset.iconUrl}
                  alt={transaction.asset.name}
                  className="w-12 h-12 object-contain flex-shrink-0"
                />
              )}

              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">
                  {transaction.asset?.name || 'Unknown Asset'}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-sm">
                  <span className={`font-medium ${getTypeColor(transaction.type)}`}>
                    {getTypeLabel(transaction.type)}
                  </span>
                  <span className="text-cadet-500">
                    {transaction.quantity}x @ ${Number(transaction.price).toFixed(2)}
                  </span>
                  <span className="text-cadet-600">
                    {new Date(transaction.date).toLocaleDateString()}
                  </span>
                </div>
                {transaction.notes && (
                  <p className="text-sm text-cadet-500 mt-2">{transaction.notes}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-right">
                <p className="text-white font-semibold">
                  ${Number(transaction.totalPrice).toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(transaction.id)}
                disabled={deleteTransaction.isPending}
                className="text-cadet-500 hover:text-red-500 transition-colors disabled:opacity-50"
                title="Delete transaction"
              >
                <DeleteIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}



