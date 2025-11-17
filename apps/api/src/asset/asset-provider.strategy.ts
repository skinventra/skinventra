import { Injectable, Logger } from '@nestjs/common';
import { AssetProvider } from './providers/asset-provider.interface';

export enum AssetProviderType {
  STEAM_MARKET = 'steam_market',
}

@Injectable()
export class AssetProviderStrategy {
  private readonly logger = new Logger(AssetProviderStrategy.name);
  private currentProvider: AssetProvider;
  private readonly providers = new Map<AssetProviderType, AssetProvider>();

  registerProvider(type: AssetProviderType, provider: AssetProvider): void {
    this.providers.set(type, provider);
    this.logger.log(`Registered provider: ${provider.name} (${type})`);

    if (!this.currentProvider) {
      this.currentProvider = provider;
      this.logger.log(`Set default provider: ${provider.name}`);
    }
  }

  setProvider(type: AssetProviderType): void {
    const provider = this.providers.get(type);

    if (!provider) {
      throw new Error(
        `Provider ${type} not registered. Available: ${Array.from(this.providers.keys()).join(', ')}`,
      );
    }

    this.currentProvider = provider;
    this.logger.log(`Switched to provider: ${provider.name}`);
  }

  getProvider(): AssetProvider {
    if (!this.currentProvider) {
      throw new Error('No asset provider configured');
    }
    return this.currentProvider;
  }

  getCurrentProviderType(): AssetProviderType | undefined {
    for (const [type, provider] of this.providers.entries()) {
      if (provider === this.currentProvider) {
        return type;
      }
    }
    return undefined;
  }

  getAvailableProviders(): Array<{ type: AssetProviderType; name: string }> {
    return Array.from(this.providers.entries()).map(([type, provider]) => ({
      type,
      name: provider.name,
    }));
  }
}

