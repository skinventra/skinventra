import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Inject,
  Logger,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { AssetService } from './asset.service';
import { AssetSyncScheduler } from './asset-sync.scheduler';
import { SyncLogService } from './sync-log.service';
import {
  AssetProviderStrategy,
  AssetProviderType,
} from './asset-provider.strategy';
import { SearchAssetDto } from './dto/search-asset.dto';
import { ASSET_CATEGORIES } from './providers/steam-market.config';

@Controller('assets')
export class AssetController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly assetService: AssetService,
    private readonly assetSyncScheduler: AssetSyncScheduler,
    private readonly syncLogService: SyncLogService,
    private readonly providerStrategy: AssetProviderStrategy,
  ) {}

  @Get('search')
  searchAssets(@Query() dto: SearchAssetDto) {
    this.logger.log(
      `Searching assets: q="${dto.q}", limit=${dto.limit}, offset=${dto.offset}`,
      'AssetController',
    );
    return this.assetService.searchAssets(dto.q, dto.limit, dto.offset);
  }

  @Get('count')
  getAssetsCount() {
    return this.assetService.getAssetsCount();
  }

  @Post('sync')
  async syncAssets(
    @Query('categories') categories?: string,
    @Query('offset') offsetParam?: string,
  ) {
    const categoryList = categories
      ? categories.split(',').map((c) => c.trim())
      : undefined;

    const offset = offsetParam ? parseInt(offsetParam, 10) : undefined;

    const mode = categoryList
      ? `priority (${categoryList.join(', ')})`
      : 'all items';

    const resumeInfo = offset ? ` (resuming from offset ${offset})` : '';
    this.logger.log(
      `Manual asset sync triggered: ${mode}${resumeInfo}`,
      'AssetController',
    );

    this.assetSyncScheduler
      .syncAssets(categoryList, offset)
      .catch((error: Error) => {
        this.logger.error(
          `Sync error: ${error.message}`,
          error.stack,
          'AssetController',
        );
      });

    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      message: `Asset sync triggered (${mode})${resumeInfo}`,
      status: this.assetSyncScheduler.getSyncStatus(),
      categories: categoryList,
      startOffset: offset,
    };
  }

  @Get('categories')
  getCategories() {
    return {
      categories: ASSET_CATEGORIES.map((cat) => ({
        id: cat.id,
        name: cat.name,
        priority: cat.priority,
        searchQuery: cat.searchQuery,
      })),
    };
  }

  @Get('sync/status')
  getSyncStatus() {
    return this.assetSyncScheduler.getSyncStatus();
  }

  @Get('sync/history')
  getSyncHistory(@Query('limit') limit?: number) {
    const parsedLimit = limit ? parseInt(String(limit), 10) : 10;
    return this.syncLogService.getRecentSyncs(parsedLimit);
  }

  @Get('providers')
  getAvailableProviders() {
    return {
      current: this.providerStrategy.getCurrentProviderType(),
      available: this.providerStrategy.getAvailableProviders(),
    };
  }

  @Patch('providers/:type')
  switchProvider(@Param('type') type: AssetProviderType) {
    this.logger.log(`Switching asset provider to: ${type}`, 'AssetController');
    this.providerStrategy.setProvider(type);
    return {
      message: `Switched to provider: ${type}`,
      current: this.providerStrategy.getProvider().name,
    };
  }

  @Get(':id')
  getAsset(@Param('id') id: string) {
    return this.assetService.getAssetById(id);
  }
}
