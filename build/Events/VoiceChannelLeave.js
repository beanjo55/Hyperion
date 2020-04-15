"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class VoiceChannelLeaveHandler {
    constructor() {
        this.name = "voiceChannelLeave";
    }
    async handle(member, oldChannel) {
    }
}
exports.event = new VoiceChannelLeaveHandler;
