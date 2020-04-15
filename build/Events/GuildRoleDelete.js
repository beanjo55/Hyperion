"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GuildRoleDeleteHandler {
    constructor() {
        this.name = "guildRoleDelete";
    }
    async handle(guild, role) {
    }
}
exports.event = new GuildRoleDeleteHandler;
