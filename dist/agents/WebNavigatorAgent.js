"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebNavigatorAgent = void 0;
const BaseAgent_1 = require("./BaseAgent");
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
class WebNavigatorAgent extends BaseAgent_1.BaseAgent {
    constructor(logger) {
        super('web-navigator', logger);
    }
    async execute(task) {
        const startTime = Date.now();
        try {
            this.logger.info(`WebNavigatorAgent fetching: ${task.input.url}`);
            const content = await this.fetchAndParse(task.input.url, task.input.selector);
            return this.createResult(task.id, 'success', {
                url: task.input.url,
                content,
                contentLength: content.length,
            }, startTime);
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`WebNavigatorAgent error: ${errorMsg}`);
            return this.createResult(task.id, 'error', null, startTime, errorMsg);
        }
    }
    async fetchAndParse(url, selector) {
        const response = await this.retryable(() => axios_1.default.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        }));
        const $ = cheerio.load(response.data);
        if (selector) {
            return $(selector).map((i, elem) => $(elem).text()).get();
        }
        return {
            title: $('title').text(),
            headings: $('h1, h2, h3')
                .map((i, elem) => $(elem).text())
                .get(),
            links: $('a')
                .map((i, elem) => ({
                text: $(elem).text(),
                href: $(elem).attr('href'),
            }))
                .get(),
            text: $('body').text().substring(0, 5000),
        };
    }
}
exports.WebNavigatorAgent = WebNavigatorAgent;
//# sourceMappingURL=WebNavigatorAgent.js.map