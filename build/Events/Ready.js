"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ReadyHandler {
    constructor() {
        this.name = "ready";
    }
    async handle() {
        this.logger.success("Hyperion", "Ready Event", "Hyperion Ready");
        this.client.editStatus(undefined, { name: "v2", type: 0 });
    }
}
exports.event = new ReadyHandler;
