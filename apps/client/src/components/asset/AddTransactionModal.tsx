import { useState } from 'react';
import { useCreateTransaction } from '../../hooks/useTransactions';
import AssetSearchInput from './AssetSearchInput';
import type { Asset } from '../../types/asset';
import { TransactionType } from '../../types/asset';
import { CloseIcon } from '../icons/CloseIcon';

interface AddTransactionModalProps {
  portfolioId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddTransactionModal({
  portfolioId,
  onClose,
  onSuccess,
}: AddTransactionModalProps) {
  const [type, setType] = useState<TransactionType>(TransactionType.BUY);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetSearch, setAssetSearch] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);
  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  );
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{
    asset?: string;
    quantity?: string;
    price?: string;
  }>({});

  const createTransaction = useCreateTransaction(portfolioId);

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);
    setAssetSearch(asset.name);
    setErrors({ ...errors, asset: undefined });
    if (asset.currentPrice) {
      setPrice(asset.currentPrice);
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!selectedAsset) {
      newErrors.asset = 'Please select an asset';
    }

    if (quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (price < 0) {
      newErrors.price = 'Price must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createTransaction.mutateAsync({
        type,
        assetId: selectedAsset!.id,
        quantity,
        price,
        date,
        notes: notes || undefined,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create transaction:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-raisin-black border border-feldgrau rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-feldgrau">
          <h2 className="text-xl font-semibold text-white">Add Transaction</h2>
          <button
            onClick={onClose}
            className="text-cadet-500 hover:text-white transition-colors"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-cadet-100 mb-2">
              Transaction Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TransactionType)}
              className="w-full px-4 py-2 bg-charleston-green border border-feldgrau rounded-lg text-white focus:outline-none focus:border-orange-peel transition-colors [&>option]:text-cadet-100 [&>option]:bg-charleston-green"
            >
              <option value={TransactionType.BUY} className="text-cadet-100 bg-charleston-green">Buy</option>
              <option value={TransactionType.SELL} className="text-cadet-100 bg-charleston-green">Sell</option>
              <option value={TransactionType.TRANSFER_IN} className="text-cadet-100 bg-charleston-green">Transfer In</option>
              <option value={TransactionType.TRANSFER_OUT} className="text-cadet-100 bg-charleston-green">Transfer Out</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-cadet-100 mb-2">
              Asset
            </label>
            <AssetSearchInput
              value={assetSearch}
              onChange={setAssetSearch}
              onSelect={handleAssetSelect}
              placeholder="Search for CS2 item..."
            />
            {errors.asset && (
              <p className="mt-2 text-sm text-red-400">{errors.asset}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-cadet-100 mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => {
                  setQuantity(Number(e.target.value));
                  if (errors.quantity) {
                    setErrors({ ...errors, quantity: undefined });
                  }
                }}
                className={`w-full px-4 py-2 bg-charleston-green border rounded-lg text-white focus:outline-none transition-colors ${
                  errors.quantity
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-feldgrau focus:border-orange-peel'
                }`}
                required
              />
              {errors.quantity && (
                <p className="mt-1 text-xs text-red-400">{errors.quantity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-cadet-100 mb-2">
                Price (per unit)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => {
                  setPrice(Number(e.target.value));
                  if (errors.price) {
                    setErrors({ ...errors, price: undefined });
                  }
                }}
                className={`w-full px-4 py-2 bg-charleston-green border rounded-lg text-white focus:outline-none transition-colors ${
                  errors.price
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-feldgrau focus:border-orange-peel'
                }`}
                required
              />
              {errors.price && (
                <p className="mt-1 text-xs text-red-400">{errors.price}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-cadet-100 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 bg-charleston-green border border-feldgrau rounded-lg text-white focus:outline-none focus:border-orange-peel transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cadet-100 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-charleston-green border border-feldgrau rounded-lg text-white placeholder-cadet-500 focus:outline-none focus:border-orange-peel transition-colors resize-none"
              placeholder="Add any notes..."
            />
          </div>

          {selectedAsset && (
            <div className="p-3 bg-charleston-green border border-feldgrau rounded-lg">
              <p className="text-sm text-cadet-100 mb-1">Total:</p>
              <p className="text-lg font-semibold text-white">
                ${(price * quantity).toFixed(2)}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-feldgrau text-white rounded-lg hover:bg-feldgrau transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTransaction.isPending}
              className="flex-1 px-4 py-2 bg-orange-peel text-raisin-black font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createTransaction.isPending ? 'Adding...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



