export interface Portfolio {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePortfolioDto {
  title: string;
}

export interface UpdatePortfolioDto {
  title?: string;
}

