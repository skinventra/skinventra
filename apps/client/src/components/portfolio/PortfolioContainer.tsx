import type { ReactNode } from 'react';

interface PortfolioContainerProps {
  children: ReactNode;
  title?: string;
}

export default function PortfolioContainer({ children, title }: PortfolioContainerProps) {
  return (
    <div className="bg-cadet-200 border border-cadet-300 rounded-lg shadow p-6">
      {title && <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>}
      {children}
    </div>
  );
}

