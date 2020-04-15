"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class VoiceChannelSwitchHandler {
    constructor() {
        this.name = "voiceChannelSwitch";
    }
    async handle(member, newChannel, oldChannel) {
    }
}
exports.event = new VoiceChannelSwitchHandler;
