import { Logger } from 'winston';
import { RATE_LIMITS } from '../config/constants';

interface ApiProvider {
  name: string;
  requestCount: number;
  windowStart: number;
  available: boolean;
}

export class ApiRotationManager {
  private providers: Map<string, ApiProvider> = new Map();
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this.initializeProviders();
  }

  private initializeProviders() {
    const providerNames = ['openrouter', 'groq', 'huggingface'];
    for (const name of providerNames) {
      this.providers.set(name, {
        name,
        requestCount: 0,
        windowStart: Date.now(),
        available: true,
      });
    }
  }

  async selectProvider(preferredProvider?: string): Promise<string> {
    const now = Date.now();

    // Update request counts and check rate limits
    for (const [name, provider] of this.providers.entries()) {
      const limits = RATE_LIMITS[name as keyof typeof RATE_LIMITS];
      if (!limits) continue;

      if (now - provider.windowStart > limits.window) {
        provider.requestCount = 0;
        provider.windowStart = now;
        provider.available = true;
      }

      if (provider.requestCount >= limits.requests) {
        provider.available = false;
      }
    }

    // Try preferred provider first
    if (preferredProvider && this.isProviderAvailable(preferredProvider)) {
      this.incrementRequestCount(preferredProvider);
      this.logger.debug(`Selected preferred provider: ${preferredProvider}`);
      return preferredProvider;
    }

    // Fall back to first available provider
    for (const [name, provider] of this.providers.entries()) {
      if (provider.available) {
        this.incrementRequestCount(name);
        this.logger.debug(`Selected fallback provider: ${name}`);
        return name;
      }
    }

    this.logger.warn('No providers available, returning primary fallback');
    this.incrementRequestCount('openrouter');
    return 'openrouter';
  }

  private isProviderAvailable(name: string): boolean {
    const provider = this.providers.get(name);
    return provider?.available || false;
  }

  private incrementRequestCount(providerName: string) {
    const provider = this.providers.get(providerName);
    if (provider) {
      provider.requestCount++;
    }
  }

  getProviderStatus(): Record<string, any> {
    const status: Record<string, any> = {};
    for (const [name, provider] of this.providers.entries()) {
      const limits = RATE_LIMITS[name as keyof typeof RATE_LIMITS];
      status[name] = {
        available: provider.available,
        requests: provider.requestCount,
        limit: limits?.requests || 0,
        window: limits?.window || 0,
      };
    }
    return status;
  }

  resetAllProviders() {
    for (const provider of this.providers.values()) {
      provider.requestCount = 0;
      provider.windowStart = Date.now();
      provider.available = true;
    }
    this.logger.info('All providers reset');
  }
}
