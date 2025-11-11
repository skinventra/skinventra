export interface Portfolio {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePortfolioDto {
  title: string;
}

export interface UpdatePortfolioDto {
  title?: string;
}

