import { useState } from 'react';

interface UsePortfolioEditReturn {
  editingId: string | null;
  editingTitle: string;
  setEditingTitle: (title: string) => void;
  startEdit: (id: string, currentTitle: string) => void;
  saveEdit: (id: string) => Promise<void>;
  cancelEdit: () => void;
}

export function usePortfolioEdit(
  onSave: (id: string, title: string) => Promise<void>
): UsePortfolioEditReturn {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const startEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const saveEdit = async (id: string) => {
    if (!editingTitle.trim()) {
      alert('Title cannot be empty');
      return;
    }

    try {
      await onSave(id, editingTitle);
      cancelEdit();
    } catch (err) {
      console.error('Failed to update portfolio:', err);
      throw err;
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  return {
    editingId,
    editingTitle,
    setEditingTitle,
    startEdit,
    saveEdit,
    cancelEdit,
  };
}

