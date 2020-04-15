"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class VoiceChannelJoinHandler {
    constructor() {
        this.name = "voiceChannelJoin";
    }
    async handle(member, newChannel) {
    }
}
exports.event = new VoiceChannelJoinHandler;
