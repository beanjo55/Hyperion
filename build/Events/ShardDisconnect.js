"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ShardDisconnectHandler {
    constructor() {
        this.name = "shardDisconnect";
    }
    async handle(err, shardID) {
        this.logger.warn("Hyperion", "Sharding", `Shard ${shardID} disconnected, ${err}`);
    }
}
exports.event = new ShardDisconnectHandler;
