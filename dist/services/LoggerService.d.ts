import * as winston from 'winston';
export declare class LoggerService {
    private logger;
    constructor(serviceName?: string);
    getLogger(): winston.Logger;
    info(message: string): void;
    error(message: string, error?: Error): void;
    warn(message: string): void;
    debug(message: string): void;
}
//# sourceMappingURL=LoggerService.d.ts.map