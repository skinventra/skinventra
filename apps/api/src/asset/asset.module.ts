import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { AssetSyncScheduler } from './asset-sync.scheduler';
import { SyncLogService } from './sync-log.service';
import { SyncDataLoggerService } from './sync-data-logger.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AssetProviderStrategy, AssetProviderType } from './asset-provider.strategy';
import { SteamMarketProvider } from './providers';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [AssetController],
  providers: [
    AssetService,
    AssetSyncScheduler,
    SyncLogService,
    SyncDataLoggerService,
    AssetProviderStrategy,
    SteamMarketProvider,
    {
      provide: 'ASSET_PROVIDER_SETUP',
      useFactory: (
        strategy: AssetProviderStrategy,
        steamProvider: SteamMarketProvider,
      ) => {
        strategy.registerProvider(AssetProviderType.STEAM_MARKET, steamProvider);
        strategy.setProvider(AssetProviderType.STEAM_MARKET);
        return strategy;
      },
      inject: [AssetProviderStrategy, SteamMarketProvider],
    },
  ],
  exports: [AssetService, AssetProviderStrategy],
})
export class AssetModule {}

