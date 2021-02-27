"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = exports.Logger = void 0;
const json_helper_1 = require("./helpers/json-helper");
const ESCAPE_DEBUG = "\x1b[38;5;244m";
const ESCAPE_WARN = "\x1b[38;5;178m";
const ESCAPE_ERROR = "\x1b[38;5;196m";
const ESCAPE_END = "\u001b[0m";
class Logger {
    constructor(options) {
        this.options = options;
        if (this.options.level == LogLevel.Debug) {
            this.w("Your logging is now in DEBUG mode. You might be flooded by tons of log messages.");
        }
        this.level = this.options.level;
    }
    d(message, tags) {
        if (this.options.level > LogLevel.Debug)
            return;
        if (tags) {
            message += ` (${Logger.stringify(tags)})`;
        }
        console.debug(`${ESCAPE_DEBUG}${message}${ESCAPE_END}`);
    }
    i(message, tags) {
        if (this.options.level > LogLevel.Info)
            return;
        if (tags) {
            message += ` (${Logger.stringify(tags)})`;
        }
        console.info(message);
    }
    w(message, tags) {
        if (this.options.level > LogLevel.Warn)
            return;
        if (tags) {
            message += ` (${Logger.stringify(tags)})`;
        }
        console.warn(`${ESCAPE_WARN}${message}${ESCAPE_END}`);
    }
    e(message, tags) {
        if (tags) {
            message += ` (${json_helper_1.JsonHelper.stringify(tags)})`;
        }
        console.error(`${ESCAPE_ERROR}${message}${ESCAPE_END}`);
    }
    static stringify(o) {
        let result = "";
        for (let key of Object.keys(o)) {
            result += `${key}=${o[key]}, `;
        }
        return result.slice(0, -2);
    }
}
exports.Logger = Logger;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Debug"] = 1] = "Debug";
    LogLevel[LogLevel["Info"] = 2] = "Info";
    LogLevel[LogLevel["Warn"] = 3] = "Warn";
    LogLevel[LogLevel["Error"] = 4] = "Error";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
//# sourceMappingURL=logger.js.map