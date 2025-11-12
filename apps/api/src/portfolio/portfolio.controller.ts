import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('portfolios')
@UseGuards(AuthenticatedGuard)
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post()
  create(
    @CurrentUser() user: Express.User,
    @Body() createPortfolioDto: CreatePortfolioDto,
  ) {
    return this.portfolioService.create(user.id, createPortfolioDto);
  }

  @Get()
  findAll(@CurrentUser() user: Express.User) {
    return this.portfolioService.findAllByUser(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: Express.User, @Param('id') id: string) {
    return this.portfolioService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: Express.User,
    @Param('id') id: string,
    @Body() updatePortfolioDto: UpdatePortfolioDto,
  ) {
    return this.portfolioService.update(id, user.id, updatePortfolioDto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: Express.User, @Param('id') id: string) {
    return this.portfolioService.remove(id, user.id);
  }
}

