"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GuildRoleCreateHandler {
    constructor() {
        this.name = "guildRoleCreate";
    }
    async handle(guild, role) {
    }
}
exports.event = new GuildRoleCreateHandler;
