"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GuildRoleUpdateHandler {
    constructor() {
        this.name = "guildRoleUpdate";
    }
    async handle(guild, role, oldRole) {
    }
}
exports.event = new GuildRoleUpdateHandler;
