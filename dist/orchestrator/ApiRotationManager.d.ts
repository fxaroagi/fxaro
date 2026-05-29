import { Logger } from 'winston';
export declare class ApiRotationManager {
    private providers;
    private logger;
    constructor(logger: Logger);
    private initializeProviders;
    selectProvider(preferredProvider?: string): Promise<string>;
    private isProviderAvailable;
    private incrementRequestCount;
    getProviderStatus(): Record<string, any>;
    resetAllProviders(): void;
}
//# sourceMappingURL=ApiRotationManager.d.ts.map