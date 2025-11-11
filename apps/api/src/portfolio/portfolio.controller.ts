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
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';

@Controller('portfolios')
@UseGuards(AuthenticatedGuard)
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post()
  create(@Req() req: Request, @Body() createPortfolioDto: CreatePortfolioDto) {
    const userId = req.user!.id;
    return this.portfolioService.create(userId, createPortfolioDto);
  }

  @Get()
  findAll(@Req() req: Request) {
    const userId = req.user!.id;
    return this.portfolioService.findAllByUser(userId);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user!.id;
    return this.portfolioService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updatePortfolioDto: UpdatePortfolioDto,
  ) {
    const userId = req.user!.id;
    return this.portfolioService.update(id, userId, updatePortfolioDto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const userId = req.user!.id;
    return this.portfolioService.remove(id, userId);
  }
}

