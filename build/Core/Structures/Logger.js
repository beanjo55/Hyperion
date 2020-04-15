"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const signale_1 = __importDefault(require("signale"));
function error(name, subprefix, message) {
    if (subprefix) {
        message = `[${subprefix}] ${message}`;
    }
    signale_1.default.error({
        prefix: `[${name}]`,
        message: message
    });
}
function fatal(name, subprefix, message) {
    if (subprefix) {
        message = `[${subprefix}] ${message}`;
    }
    signale_1.default.fatal({
        prefix: `[${name}]`,
        message: message
    });
}
function debug(name, subprefix, message) {
    if (subprefix) {
        message = `[${subprefix}] ${message}`;
    }
    signale_1.default.debug({
        prefix: `[${name}]`,
        message: message
    });
}
function warn(name, subprefix, message) {
    if (subprefix) {
        message = `[${subprefix}] ${message}`;
    }
    signale_1.default.warn({
        prefix: `[${name}]`,
        message: message
    });
}
function info(name, subprefix, message) {
    if (subprefix) {
        message = `[${subprefix}] ${message}`;
    }
    signale_1.default.info({
        prefix: `[${name}]`,
        message: message
    });
}
function success(name, subprefix, message) {
    if (subprefix) {
        message = `[${subprefix}] ${message}`;
    }
    signale_1.default.success({
        prefix: `[${name}]`,
        message: message
    });
}
exports.logger = {
    debug: debug,
    error: error,
    fatal: fatal,
    info: info,
    success: success,
    warn: warn
};
