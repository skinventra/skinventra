import { useState } from 'react';
import type { FormEvent } from 'react';
import { usePortfolios } from '../hooks/usePortfolios';

export default function CreatePortfolioForm() {
  const [title, setTitle] = useState('');
  const { createPortfolio, isCreating, createError } = usePortfolios();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!title.trim()) {
      alert('Portfolio title cannot be empty');
      return;
    }

    try {
      // Create portfolio
      await createPortfolio({ title: title.trim() });
      
      // Clear form on success
      setTitle('');
    } catch (err) {
      // Error is already handled in the hook and shown via createError
      console.error('Failed to create portfolio:', err);
    }
  };

  return (
    <div className="bg-cadet-200 border border-cadet-300 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4 text-white">Create New Portfolio</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input field for title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
            Portfolio Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter portfolio title..."
            disabled={isCreating}
            className="w-full px-4 py-2 border border-cadet-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isCreating || !title.trim()}
          className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isCreating ? 'Creating...' : 'Create Portfolio'}
        </button>

        {/* Display error if exists */}
        {createError && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {createError}
          </div>
        )}
      </form>
    </div>
  );
}

