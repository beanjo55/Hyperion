"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-unused-vars */
const util_1 = require("util");
class RawWSHandler {
    constructor() {
        this.name = "rawWS";
    }
    async handle(packet, shardID) {
        if (packet.op !== 7) {
            return;
        }
        console.log(`Shard: ${shardID} packet: ${util_1.inspect(packet)}`);
    }
}
exports.event = new RawWSHandler;
