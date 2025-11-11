import { useState, useRef, useEffect } from 'react';

interface UseDeleteConfirmationReturn {
  deletingId: string | null;
  handleDelete: (id: string) => void;
  cancelDelete: () => void;
}

export function useDeleteConfirmation(
  onConfirm: (id: string) => Promise<void>,
  timeout = 3000
): UseDeleteConfirmationReturn {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleDelete = async (id: string) => {
    if (deletingId === id) {
      try {
        await onConfirm(id);
        setDeletingId(null);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      } catch (err) {
        console.error('Failed to delete portfolio:', err);
      }
    } else {
      setDeletingId(id);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setDeletingId((current) => (current === id ? null : current));
      }, timeout);
    }
  };

  const cancelDelete = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setDeletingId(null);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    deletingId,
    handleDelete,
    cancelDelete,
  };
}

