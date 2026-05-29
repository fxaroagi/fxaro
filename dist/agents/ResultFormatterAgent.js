"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultFormatterAgent = void 0;
const BaseAgent_1 = require("./BaseAgent");
class ResultFormatterAgent extends BaseAgent_1.BaseAgent {
    constructor(logger) {
        super('result-formatter', logger);
    }
    async execute(task) {
        const startTime = Date.now();
        try {
            this.logger.info(`ResultFormatterAgent formatting: ${task.input.format}`);
            const formatted = this.formatResult(task.input);
            return this.createResult(task.id, 'success', {
                format: task.input.format,
                formatted,
                length: JSON.stringify(formatted).length,
            }, startTime);
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`ResultFormatterAgent error: ${errorMsg}`);
            return this.createResult(task.id, 'error', null, startTime, errorMsg);
        }
    }
    formatResult(input) {
        const { format, data } = input;
        switch (format) {
            case 'json':
                return this.formatAsJson(data);
            case 'markdown':
                return this.formatAsMarkdown(data);
            case 'html':
                return this.formatAsHtml(data);
            case 'csv':
                return this.formatAsCsv(data);
            case 'text':
                return this.formatAsText(data);
            default:
                return data;
        }
    }
    formatAsJson(data) {
        return JSON.stringify(data, null, 2);
    }
    formatAsMarkdown(data) {
        if (Array.isArray(data)) {
            return data.map((item, index) => `## Item ${index + 1}\n${JSON.stringify(item, null, 2)}`).join('\n\n');
        }
        if (typeof data === 'object') {
            return Object.entries(data)
                .map(([key, value]) => `### ${key}\n${value}`)
                .join('\n\n');
        }
        return `${data}`;
    }
    formatAsHtml(data) {
        if (typeof data === 'string') {
            return `<p>${data}</p>`;
        }
        if (Array.isArray(data)) {
            const items = data.map(item => `<li>${item}</li>`).join('');
            return `<ul>${items}</ul>`;
        }
        if (typeof data === 'object') {
            const rows = Object.entries(data)
                .map(([key, value]) => `<tr><td>${key}</td><td>${value}</td></tr>`)
                .join('');
            return `<table><tbody>${rows}</tbody></table>`;
        }
        return `<p>${data}</p>`;
    }
    formatAsCsv(data) {
        if (!Array.isArray(data)) {
            data = [data];
        }
        if (data.length === 0)
            return '';
        const headers = Object.keys(data[0]);
        const headerRow = headers.join(',');
        const dataRows = data
            .map((row) => headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',')
                ? `"${value}"`
                : value;
        }).join(','))
            .join('\n');
        return `${headerRow}\n${dataRows}`;
    }
    formatAsText(data) {
        if (typeof data === 'string') {
            return data;
        }
        if (Array.isArray(data)) {
            return data.join('\n');
        }
        if (typeof data === 'object') {
            return Object.entries(data)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n');
        }
        return String(data);
    }
}
exports.ResultFormatterAgent = ResultFormatterAgent;
//# sourceMappingURL=ResultFormatterAgent.js.map