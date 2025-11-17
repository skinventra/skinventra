import { useState, useRef, useEffect } from 'react';
import { useAssetSearch } from '../../hooks/useAssets';
import type { Asset } from '../../types/asset';

interface AssetSearchInputProps {
  onSelect: (asset: Asset) => void;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export default function AssetSearchInput({
  onSelect,
  placeholder = 'Search for CS2 item...',
  value: controlledValue,
  onChange,
}: AssetSearchInputProps) {
  const [query, setQuery] = useState(controlledValue || '');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: assets, isLoading } = useAssetSearch(query, isOpen);

  useEffect(() => {
    if (controlledValue !== undefined) {
      setQuery(controlledValue);
    }
  }, [controlledValue]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    onChange?.(value);
    setIsOpen(value.length >= 2);
  };

  const handleSelect = (asset: Asset) => {
    setQuery(asset.name);
    onChange?.(asset.name);
    onSelect(asset);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => query.length >= 2 && setIsOpen(true)}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-charleston-green border border-feldgrau rounded-lg text-white placeholder-cadet-500 focus:outline-none focus:border-orange-peel transition-colors"
      />

      {isOpen && query.length >= 2 && (
        <div className="absolute z-[60] w-full mt-1 bg-raisin-black border border-feldgrau rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {isLoading && (
            <div className="px-4 py-3 text-cadet-500 text-sm">Loading...</div>
          )}

          {!isLoading && assets && assets.length === 0 && (
            <div className="px-4 py-3 text-cadet-500 text-sm">No items found</div>
          )}

          {!isLoading &&
            assets?.map((asset) => (
              <button
                key={asset.id}
                onClick={() => handleSelect(asset)}
                className="w-full px-4 py-3 text-left hover:bg-charleston-green transition-colors flex items-center gap-3 border-b border-feldgrau last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
              >
                {asset.iconUrl && (
                  <img
                    src={asset.iconUrl}
                    alt={asset.name}
                    className="w-10 h-10 object-contain bg-charleston-green rounded p-1"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{asset.name}</p>
                  {asset.currentPrice && (
                    <p className="text-cadet-400 text-xs mt-0.5">
                      ${asset.currentPrice.toFixed(2)}
                    </p>
                  )}
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}



