"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WebhooksUpdateHandler {
    constructor() {
        this.name = "webhooksUpdate";
    }
    async handle(data, channelID, guildID) {
    }
}
exports.event = new WebhooksUpdateHandler;
