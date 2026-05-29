"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaGeneratorAgent = void 0;
const BaseAgent_1 = require("./BaseAgent");
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("../config/constants");
class MediaGeneratorAgent extends BaseAgent_1.BaseAgent {
    constructor(logger) {
        super('media-generator', logger);
        this.replicateKey = constants_1.CONFIG.APIS.REPLICATE_API_KEY || '';
        this.hfKey = constants_1.CONFIG.APIS.HUGGINGFACE_API_KEY || '';
    }
    async execute(task) {
        const startTime = Date.now();
        try {
            this.logger.info(`MediaGeneratorAgent generating: ${task.input.mediaType}`);
            const mediaUrl = await this.generateMedia(task.input);
            return this.createResult(task.id, 'success', {
                mediaType: task.input.mediaType,
                mediaUrl,
            }, startTime);
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`MediaGeneratorAgent error: ${errorMsg}`);
            return this.createResult(task.id, 'error', null, startTime, errorMsg);
        }
    }
    async generateMedia(input) {
        const { mediaType, prompt } = input;
        if (mediaType === 'image') {
            return await this.generateImage(prompt);
        }
        else if (mediaType === 'video') {
            return await this.generateVideo(prompt);
        }
        else {
            throw new Error(`Unsupported media type: ${mediaType}`);
        }
    }
    async generateImage(prompt) {
        try {
            const response = await this.retryable(() => axios_1.default.post('https://api.replicate.com/v1/predictions', {
                version: 'fluxpro',
                input: {
                    prompt,
                    guidance: 7.5,
                    num_outputs: 1,
                },
            }, {
                headers: {
                    'Authorization': `Token ${this.replicateKey}`,
                    'Content-Type': 'application/json',
                },
            }));
            return response.data.output[0] || response.data.urls?.[0] || '';
        }
        catch (error) {
            this.logger.error(`Failed to generate image: ${error}`);
            throw error;
        }
    }
    async generateVideo(prompt) {
        try {
            const response = await this.retryable(() => axios_1.default.post('https://api-inference.huggingface.co/models/damo-vilab/text-to-video-ms-1.7b', { inputs: prompt }, {
                headers: {
                    'Authorization': `Bearer ${this.hfKey}`,
                },
            }));
            return response.data[0]?.url || '';
        }
        catch (error) {
            this.logger.error(`Failed to generate video: ${error}`);
            throw error;
        }
    }
}
exports.MediaGeneratorAgent = MediaGeneratorAgent;
//# sourceMappingURL=MediaGeneratorAgent.js.map