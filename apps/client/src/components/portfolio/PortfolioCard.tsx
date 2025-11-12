import type { Portfolio } from '../../types/portfolio';
import EditIcon from '../icons/EditIcon';
import DeleteIcon from '../icons/DeleteIcon';
import SaveIcon from '../icons/SaveIcon';
import CloseIcon from '../icons/CloseIcon';
import ActionButton from '../ui/ActionButton';

interface PortfolioCardProps {
  portfolio: Portfolio;
  isEditing: boolean;
  editingTitle: string;
  isDeletingConfirmation: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onCancelDelete: () => void;
  onTitleChange: (title: string) => void;
  onSelect: () => void;
}

export default function PortfolioCard({
  portfolio,
  isEditing,
  editingTitle,
  isDeletingConfirmation,
  isUpdating,
  isDeleting,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onCancelDelete,
  onTitleChange,
  onSelect,
}: PortfolioCardProps) {
  const handleCardClick = () => {
    if (!isEditing && !isDeletingConfirmation) {
      onSelect();
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div 
      className="bg-davys-100 border border-white-200 rounded-lg shadow p-4 group cursor-pointer hover:border-mint transition-colors"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Title or Edit Input */}
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && editingTitle.trim()) {
                  onSave();
                } else if (e.key === 'Escape') {
                  onCancel();
                }
              }}
              className="w-full px-3 py-2 border border-cadet-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              disabled={isUpdating}
              autoFocus
            />
          ) : (
            <h3 className="text-lg font-semibold text-white leading-tight">
              {portfolio.title}
            </h3>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pt-0.5">
          {isEditing ? (
            <>
              <ActionButton
                onClick={(e) => handleActionClick(e, onSave)}
                disabled={isUpdating || !editingTitle.trim()}
                variant="save"
                title="Save"
              >
                <SaveIcon />
              </ActionButton>
              <ActionButton
                onClick={(e) => handleActionClick(e, onCancel)}
                disabled={isUpdating}
                variant="cancel"
                title="Cancel"
              >
                <CloseIcon />
              </ActionButton>
            </>
          ) : (
            <>
              {isDeletingConfirmation ? (
                <ActionButton
                  onClick={(e) => handleActionClick(e, onCancelDelete)}
                  disabled={isDeleting}
                  variant="cancel"
                  title="Cancel deletion"
                >
                  <CloseIcon />
                </ActionButton>
              ) : (
                <ActionButton
                  onClick={(e) => handleActionClick(e, onEdit)}
                  disabled={isUpdating || isDeleting}
                  variant="edit"
                  title="Edit"
                >
                  <EditIcon />
                </ActionButton>
              )}

              <ActionButton
                onClick={(e) => handleActionClick(e, onDelete)}
                disabled={isUpdating || isDeleting}
                variant={isDeletingConfirmation ? 'delete-confirm' : 'delete'}
                title={isDeletingConfirmation ? 'Click to confirm deletion' : 'Delete'}
              >
                <DeleteIcon />
              </ActionButton>
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
        {isDeletingConfirmation && (
          <div className="text-sm text-red-400 animate-pulse font-medium">
            Click delete again to confirm
          </div>
        )}
      </div>
    </div>
  );
}

