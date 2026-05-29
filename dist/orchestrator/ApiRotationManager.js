"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiRotationManager = void 0;
const constants_1 = require("../config/constants");
class ApiRotationManager {
    constructor(logger) {
        this.providers = new Map();
        this.logger = logger;
        this.initializeProviders();
    }
    initializeProviders() {
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
    async selectProvider(preferredProvider) {
        const now = Date.now();
        // Update request counts and check rate limits
        for (const [name, provider] of this.providers.entries()) {
            const limits = constants_1.RATE_LIMITS[name];
            if (!limits)
                continue;
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
    isProviderAvailable(name) {
        const provider = this.providers.get(name);
        return provider?.available || false;
    }
    incrementRequestCount(providerName) {
        const provider = this.providers.get(providerName);
        if (provider) {
            provider.requestCount++;
        }
    }
    getProviderStatus() {
        const status = {};
        for (const [name, provider] of this.providers.entries()) {
            const limits = constants_1.RATE_LIMITS[name];
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
exports.ApiRotationManager = ApiRotationManager;
//# sourceMappingURL=ApiRotationManager.js.map