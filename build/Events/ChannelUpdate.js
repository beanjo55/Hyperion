"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ChannelUpdateHandler {
    constructor() {
        this.name = "channelUpdate";
    }
    async handle(channel, oldChannel) {
    }
}
exports.event = new ChannelUpdateHandler;
