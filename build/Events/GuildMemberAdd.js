"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GuildMemberAddHandler {
    constructor() {
        this.name = "guildMemberAdd";
    }
    async handle(guild, member) {
    }
}
exports.event = new GuildMemberAddHandler;
