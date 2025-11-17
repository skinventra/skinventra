import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from '../asset/dto/create-transaction.dto';
import { UpdateTransactionDto } from '../asset/dto/update-transaction.dto';

@Injectable()
export class PortfolioTransactionService {
  private readonly logger = new Logger(PortfolioTransactionService.name);

  constructor(private prisma: PrismaService) {}

  private convertTransaction(transaction: any) {
    return {
      ...transaction,
      price: transaction.price ? Number(transaction.price) : undefined,
      totalPrice: transaction.totalPrice
        ? Number(transaction.totalPrice)
        : undefined,
      asset: transaction.asset
        ? {
            ...transaction.asset,
            currentPrice: transaction.asset.currentPrice
              ? Number(transaction.asset.currentPrice)
              : undefined,
          }
        : undefined,
    };
  }

  async createTransaction(
    portfolioId: string,
    userId: string,
    dto: CreateTransactionDto,
  ) {
    await this.verifyPortfolioAccess(portfolioId, userId);

    const totalPrice = dto.price * dto.quantity;

    const transaction = await this.prisma.assetTransaction.create({
      data: {
        portfolioId,
        assetId: dto.assetId,
        type: dto.type,
        quantity: dto.quantity,
        price: dto.price,
        totalPrice,
        date: dto.date ? new Date(dto.date) : new Date(),
        notes: dto.notes,
      },
      include: {
        asset: true,
      },
    });

    return this.convertTransaction(transaction);
  }

  async getPortfolioTransactions(portfolioId: string, userId: string) {
    await this.verifyPortfolioAccess(portfolioId, userId);

    const transactions = await this.prisma.assetTransaction.findMany({
      where: { portfolioId },
      include: {
        asset: true,
      },
      orderBy: { date: 'desc' },
    });

    return transactions.map((t) => this.convertTransaction(t));
  }

  async getTransaction(
    portfolioId: string,
    transactionId: string,
    userId: string,
  ) {
    await this.verifyPortfolioAccess(portfolioId, userId);

    const transaction = await this.prisma.assetTransaction.findUnique({
      where: { id: transactionId },
      include: {
        asset: true,
      },
    });

    if (!transaction || transaction.portfolioId !== portfolioId) {
      throw new NotFoundException('Transaction not found');
    }

    return this.convertTransaction(transaction);
  }

  async updateTransaction(
    portfolioId: string,
    transactionId: string,
    userId: string,
    dto: UpdateTransactionDto,
  ) {
    await this.verifyPortfolioAccess(portfolioId, userId);

    const transaction = await this.prisma.assetTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction || transaction.portfolioId !== portfolioId) {
      throw new NotFoundException('Transaction not found');
    }

    const updateData: any = {};

    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.assetId !== undefined) updateData.assetId = dto.assetId;
    if (dto.quantity !== undefined) updateData.quantity = dto.quantity;
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.date !== undefined) updateData.date = new Date(dto.date);
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    if (dto.quantity !== undefined || dto.price !== undefined) {
      const quantity = dto.quantity ?? transaction.quantity;
      const price = dto.price ?? Number(transaction.price);
      updateData.totalPrice = quantity * price;
    }

    const updatedTransaction = await this.prisma.assetTransaction.update({
      where: { id: transactionId },
      data: updateData,
      include: {
        asset: true,
      },
    });

    return this.convertTransaction(updatedTransaction);
  }

  async deleteTransaction(
    portfolioId: string,
    transactionId: string,
    userId: string,
  ) {
    await this.verifyPortfolioAccess(portfolioId, userId);

    const transaction = await this.prisma.assetTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction || transaction.portfolioId !== portfolioId) {
      throw new NotFoundException('Transaction not found');
    }

    return this.prisma.assetTransaction.delete({
      where: { id: transactionId },
    });
  }

  async getPortfolioHoldings(portfolioId: string, userId: string) {
    await this.verifyPortfolioAccess(portfolioId, userId);

    const transactions = await this.prisma.assetTransaction.findMany({
      where: { portfolioId },
      include: { asset: true },
      orderBy: { date: 'asc' },
    });

    const holdings = new Map<
      string,
      {
        asset: any;
        quantity: number;
        totalInvested: number;
        averagePrice: number;
        transactions: any[];
      }
    >();

    for (const tx of transactions) {
      const convertedTx = this.convertTransaction(tx);
      
      const existing = holdings.get(tx.assetId) || {
        asset: convertedTx.asset,
        quantity: 0,
        totalInvested: 0,
        averagePrice: 0,
        transactions: [],
      };

      switch (tx.type) {
        case 'BUY':
        case 'TRANSFER_IN':
          existing.quantity += tx.quantity;
          existing.totalInvested += Number(tx.totalPrice);
          break;
        case 'SELL':
        case 'TRANSFER_OUT':
          existing.quantity -= tx.quantity;
          if (existing.quantity > 0) {
            const ratio = tx.quantity / (existing.quantity + tx.quantity);
            existing.totalInvested -= existing.totalInvested * ratio;
          } else {
            existing.totalInvested = 0;
          }
          break;
      }

      existing.averagePrice =
        existing.quantity > 0 ? existing.totalInvested / existing.quantity : 0;

      existing.transactions.push(convertedTx);
      holdings.set(tx.assetId, existing);
    }

    return Array.from(holdings.values()).filter((h) => h.quantity > 0);
  }

  async getPortfolioSummary(portfolioId: string, userId: string) {
    await this.verifyPortfolioAccess(portfolioId, userId);

    const holdings = await this.getPortfolioHoldings(portfolioId, userId);

    let totalValue = 0;
    let totalInvested = 0;

    for (const holding of holdings) {
      const currentPrice = Number(holding.asset.currentPrice || 0);
      totalValue += currentPrice * holding.quantity;
      totalInvested += holding.totalInvested;
    }

    const profitLoss = totalValue - totalInvested;
    const profitLossPercentage =
      totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    return {
      totalValue,
      totalInvested,
      profitLoss,
      profitLossPercentage,
      holdingsCount: holdings.length,
    };
  }

  private async verifyPortfolioAccess(portfolioId: string, userId: string) {
    const portfolio = await this.prisma.portfolio.findUnique({
      where: { id: portfolioId },
    });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    if (portfolio.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return portfolio;
  }
}

