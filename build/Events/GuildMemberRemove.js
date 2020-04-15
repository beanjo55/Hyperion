"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GuildMemberRemoveHandler {
    constructor() {
        this.name = "guildMemberRemove";
    }
    async handle(guild, member) {
    }
}
exports.event = new GuildMemberRemoveHandler;
