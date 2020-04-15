"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DebugHandler {
    constructor() {
        this.name = "debug";
    }
    async handle(message, shardID) {
        if (this.logLevel < 5) {
            return;
        }
        if (message.toLowerCase().includes("duplicate presence")) {
            return;
        }
        this.logger.info("Hyperion", "Debug", message);
    }
}
exports.event = new DebugHandler;
