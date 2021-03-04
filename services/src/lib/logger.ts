import { JsonHelper } from "./helpers/json-helper";

const ESCAPE_DEBUG = "\x1b[38;5;244m";
const ESCAPE_WARN = "\x1b[38;5;178m";
const ESCAPE_ERROR = "\x1b[38;5;196m";
const ESCAPE_END = "\u001b[0m";

export class Logger {

    public readonly level: LogLevel;
    private options: LoggerOptions;

    constructor(options: LoggerOptions) {
        this.options = options;

        // DEBUG warning
        if (this.options.level == LogLevel.Debug) {
            this.w("Your logging is now in DEBUG mode. You might be flooded by tons of log messages.");
        }

        this.level = this.options.level;
    }

    private static stringify(o: object) {
        let result = "";

        for (let key of Object.keys(o)) {
            result += `${key}=${o[key]}, `;
        }

        // Remove last ", " characters
        return result.slice(0, -2);
    }

    public d(message: any, tags?: object): void {
        if (this.options.level > LogLevel.Debug) return;

        if (tags) {
            message += ` (${Logger.stringify(tags)})`;
        }

        console.debug(`${ESCAPE_DEBUG}${message}${ESCAPE_END}`);
    }

    public i(message: any, tags?: object): void {
        if (this.options.level > LogLevel.Info) return;

        if (tags) {
            message += ` (${Logger.stringify(tags)})`;
        }

        console.info(message);
    }

    public w(message: any, tags?: object): void {
        if (this.options.level > LogLevel.Warn) return;

        if (tags) {
            message += ` (${Logger.stringify(tags)})`;
        }

        console.warn(`${ESCAPE_WARN}${message}${ESCAPE_END}`);
    }

    public e(message: any, tags?: object): void {
        if (tags) {
            message += ` (${JsonHelper.stringify(tags)})`;
        }
        console.error(`${ESCAPE_ERROR}${message}${ESCAPE_END}`);
    }

}

export interface LoggerOptions {
    level: LogLevel;
}

export enum LogLevel {
    Debug = 1,
    Info = 2,
    Warn = 3,
    Error = 4
}
