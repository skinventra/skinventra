import type { ReactNode } from 'react';

type ButtonVariant = 'edit' | 'delete' | 'save' | 'cancel' | 'delete-confirm';

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant: ButtonVariant;
  title: string;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  edit: 'text-blue-400 hover:text-blue-300',
  delete: 'text-red-400 hover:text-red-300',
  'delete-confirm': 'text-red-500 hover:text-red-400 animate-pulse',
  save: 'text-green-400 hover:text-green-300',
  cancel: 'text-gray-400 hover:text-gray-300',
};

export default function ActionButton({
  onClick,
  disabled = false,
  variant,
  title,
  children,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110 ${variantStyles[variant]}`}
      title={title}
    >
      {children}
    </button>
  );
}

