import { usePortfolios } from '../hooks/usePortfolios';
import { usePortfolioEdit } from '../hooks/usePortfolioEdit';
import { useDeleteConfirmation } from '../hooks/useDeleteConfirmation';
import PortfolioSkeleton from './PortfolioSkeleton';
import PortfolioContainer from './PortfolioContainer';
import PortfolioCard from './PortfolioCard';

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

  const {
    deletingId,
    handleDelete,
    cancelDelete,
  } = useDeleteConfirmation(deletePortfolio);

  if (loading) {
    return (
      <PortfolioContainer title="Portfolios">
        <div className="space-y-4">
          <PortfolioSkeleton />
          <PortfolioSkeleton />
          <PortfolioSkeleton />
        </div>
      </PortfolioContainer>
    );
  }

  if (error) {
    return (
      <PortfolioContainer>
        <div className="text-center text-red-400">Error: {error}</div>
      </PortfolioContainer>
    );
  }

  if (portfolios.length === 0) {
    return (
      <PortfolioContainer>
        <div className="text-center text-white">No portfolios yet. Create your first one!</div>
      </PortfolioContainer>
    );
  }

  return (
    <PortfolioContainer title="Portfolios">
      <div className="space-y-4">
        {portfolios.map(portfolio => (
          <PortfolioCard
            key={portfolio.id}
            portfolio={portfolio}
            isEditing={editingId === portfolio.id}
            editingTitle={editingTitle}
            isDeletingConfirmation={deletingId === portfolio.id}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
            onEdit={() => startEdit(portfolio.id, portfolio.title)}
            onSave={() => saveEdit(portfolio.id)}
            onCancel={cancelEdit}
            onDelete={() => handleDelete(portfolio.id)}
            onCancelDelete={cancelDelete}
            onTitleChange={setEditingTitle}
          />
        ))}
      </div>
    </PortfolioContainer>
  );
}

