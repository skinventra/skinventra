import { Module } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { PortfolioTransactionService } from './portfolio-transaction.service';
import {
  PortfolioTransactionController,
  PortfolioHoldingsController,
} from './portfolio-transaction.controller';

@Module({
  controllers: [
    PortfolioController,
    PortfolioTransactionController,
    PortfolioHoldingsController,
  ],
  providers: [PortfolioService, PortfolioTransactionService],
})
export class PortfolioModule {}
