"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GuildMemberUpdateHandler {
    constructor() {
        this.name = "guildMemberUpdate";
    }
    async handle(guild, member, oldMember) {
    }
}
exports.event = new GuildMemberUpdateHandler;
