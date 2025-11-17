export interface Asset {
  id: string;
  name: string;
  iconUrl?: string;
  currentPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
}

export interface AssetTransaction {
  id: string;
  portfolioId: string;
  assetId: string;
  asset?: Asset;
  type: TransactionType;
  quantity: number;
  price: number;
  totalPrice: number;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionDto {
  type: TransactionType;
  assetId: string;
  quantity: number;
  price: number;
  date?: string;
  notes?: string;
}

export interface UpdateTransactionDto {
  type?: TransactionType;
  assetId?: string;
  quantity?: number;
  price?: number;
  date?: string;
  notes?: string;
}

export interface PortfolioHolding {
  asset: Asset;
  quantity: number;
  totalInvested: number;
  averagePrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalInvested: number;
  profitLoss: number;
  profitLossPercentage: number;
  holdingsCount: number;
}

