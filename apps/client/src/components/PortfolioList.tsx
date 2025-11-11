import { useState } from 'react';
import { usePortfolios } from '../hooks/usePortfolios';
import EditIcon from './icons/EditIcon';
import DeleteIcon from './icons/DeleteIcon';
import SaveIcon from './icons/SaveIcon';
import CloseIcon from './icons/CloseIcon';
import PortfolioSkeleton from './PortfolioSkeleton';

export default function PortfolioList() {
  const { 
    portfolios, 
    loading, 
    error, 
    updatePortfolio, 
    deletePortfolio,
    isUpdating,
    isDeleting 
  } = usePortfolios();

  // State for inline editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  
  // State for delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Show skeleton during initial loading
  if (loading) {
    return (
      <div className="bg-cadet-200 border border-cadet-300 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 text-white">Portfolios</h2>
        <div className="space-y-4">
          {/* Show 3 skeleton items while loading */}
          <PortfolioSkeleton />
          <PortfolioSkeleton />
          <PortfolioSkeleton />
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="bg-cadet-200 border border-cadet-300 rounded-lg shadow p-6">
        <div className="text-center text-red-400">Error: {error}</div>
      </div>
    );
  }

  // Handle empty state (only after loading is complete)
  if (portfolios.length === 0) {
    return (
      <div className="bg-cadet-200 border border-cadet-300 rounded-lg shadow p-6">
        <div className="text-center text-white">No portfolios yet. Create your first one!</div>
      </div>
    );
  }

  // Start editing a portfolio
  const handleEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  // Save edited portfolio
  const handleSave = async (id: string) => {
    if (!editingTitle.trim()) {
      alert('Title cannot be empty');
      return;
    }

    try {
      await updatePortfolio(id, { title: editingTitle });
      setEditingId(null);
      setEditingTitle('');
    } catch (err) {
      console.error('Failed to update portfolio:', err);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  // Handle delete button click
  const handleDeleteClick = (id: string) => {
    if (deletingId === id) {
      // Second click - confirm deletion
      handleConfirmDelete(id);
    } else {
      // First click - enter confirmation mode
      setDeletingId(id);
      // Auto-cancel after 3 seconds
      setTimeout(() => {
        setDeletingId((current) => current === id ? null : current);
      }, 3000);
    }
  };

  // Confirm and execute deletion
  const handleConfirmDelete = async (id: string) => {
    try {
      await deletePortfolio(id);
      setDeletingId(null);
    } catch (err) {
      console.error('Failed to delete portfolio:', err);
    }
  };

  // Cancel delete confirmation
  const handleCancelDelete = () => {
    setDeletingId(null);
  };


  return (
    <div className="bg-cadet-200 border border-cadet-300 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4 text-white">Portfolios</h2>
      
      <div className="space-y-4">
        {portfolios.map(portfolio => (
          <div 
            key={portfolio.id} 
            className="bg-davys-100 border border-white-200 rounded-lg shadow p-4 group"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Title or Edit Input */}
              <div className="flex-1">
                {editingId === portfolio.id ? (
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-cadet-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    disabled={isUpdating}
                    autoFocus
                  />
                ) : (
                  <h3 className="text-lg font-semibold text-white leading-tight">{portfolio.title}</h3>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pt-0.5">
                {editingId === portfolio.id ? (
                  <>
                    {/* Save Button */}
                    <button
                      onClick={() => handleSave(portfolio.id)}
                      disabled={isUpdating || !editingTitle.trim()}
                      className="p-2 text-green-400 hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110"
                      title="Save"
                    >
                      <SaveIcon />
                    </button>
                    {/* Cancel Button */}
                    <button
                      onClick={handleCancel}
                      disabled={isUpdating}
                      className="p-2 text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110"
                      title="Cancel"
                    >
                      <CloseIcon />
                    </button>
                  </>
                ) : (
                  <>
                    {/* Edit/Cancel Button - changes based on delete state */}
                    {deletingId === portfolio.id ? (
                      <button
                        onClick={handleCancelDelete}
                        disabled={isDeleting}
                        className="p-2 text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110"
                        title="Cancel deletion"
                      >
                        <CloseIcon />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEdit(portfolio.id, portfolio.title)}
                        disabled={isUpdating || isDeleting}
                        className="p-2 text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110"
                        title="Edit"
                      >
                        <EditIcon />
                      </button>
                    )}
                    
                    {/* Delete Button - changes appearance when in confirmation mode */}
                    <button
                      onClick={() => handleDeleteClick(portfolio.id)}
                      disabled={isUpdating || isDeleting || editingId !== null}
                      className={`p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110 ${
                        deletingId === portfolio.id
                          ? 'text-red-500 hover:text-red-400 animate-pulse'
                          : 'text-red-400 hover:text-red-300'
                      }`}
                      title={deletingId === portfolio.id ? 'Click to confirm deletion' : 'Delete'}
                    >
                      <DeleteIcon />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Portfolio Metadata */}
            <div className="mt-2 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Created: {new Date(portfolio.createdAt).toLocaleDateString()}
              </div>
              
              {/* Delete Confirmation Message */}
              {deletingId === portfolio.id && (
                <div className="text-sm text-red-400 animate-pulse font-medium">
                  Click delete again to confirm
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

