import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { PortfolioTransactionService } from './portfolio-transaction.service';
import { CreateTransactionDto } from '../asset/dto/create-transaction.dto';
import { UpdateTransactionDto } from '../asset/dto/update-transaction.dto';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';

@Controller('portfolios/:portfolioId/transactions')
@UseGuards(AuthenticatedGuard)
export class PortfolioTransactionController {
  constructor(
    private readonly transactionService: PortfolioTransactionService,
  ) {}

  @Post()
  createTransaction(
    @Param('portfolioId') portfolioId: string,
    @Body() dto: CreateTransactionDto,
    @Req() req: Request,
  ) {
    const userId = req.user!.id;
    return this.transactionService.createTransaction(portfolioId, userId, dto);
  }

  @Get()
  getTransactions(
    @Param('portfolioId') portfolioId: string,
    @Req() req: Request,
  ) {
    const userId = req.user!.id;
    return this.transactionService.getPortfolioTransactions(
      portfolioId,
      userId,
    );
  }

  @Get(':transactionId')
  getTransaction(
    @Param('portfolioId') portfolioId: string,
    @Param('transactionId') transactionId: string,
    @Req() req: Request,
  ) {
    const userId = req.user!.id;
    return this.transactionService.getTransaction(
      portfolioId,
      transactionId,
      userId,
    );
  }

  @Patch(':transactionId')
  updateTransaction(
    @Param('portfolioId') portfolioId: string,
    @Param('transactionId') transactionId: string,
    @Body() dto: UpdateTransactionDto,
    @Req() req: Request,
  ) {
    const userId = req.user!.id;
    return this.transactionService.updateTransaction(
      portfolioId,
      transactionId,
      userId,
      dto,
    );
  }

  @Delete(':transactionId')
  deleteTransaction(
    @Param('portfolioId') portfolioId: string,
    @Param('transactionId') transactionId: string,
    @Req() req: Request,
  ) {
    const userId = req.user!.id;
    return this.transactionService.deleteTransaction(
      portfolioId,
      transactionId,
      userId,
    );
  }
}

@Controller('portfolios/:portfolioId/holdings')
@UseGuards(AuthenticatedGuard)
export class PortfolioHoldingsController {
  constructor(
    private readonly transactionService: PortfolioTransactionService,
  ) {}

  @Get()
  getHoldings(
    @Param('portfolioId') portfolioId: string,
    @Req() req: Request,
  ) {
    const userId = req.user!.id;
    return this.transactionService.getPortfolioHoldings(portfolioId, userId);
  }

  @Get('summary')
  getSummary(@Param('portfolioId') portfolioId: string, @Req() req: Request) {
    const userId = req.user!.id;
    return this.transactionService.getPortfolioSummary(portfolioId, userId);
  }
}

