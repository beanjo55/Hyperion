"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ConnectHandler {
    constructor() {
        this.name = "connect";
    }
    async handle(shardID) {
        this.logger.info("Hyperion", "Sharding", `Shard ${shardID} has connected`);
    }
}
exports.event = new ConnectHandler;
