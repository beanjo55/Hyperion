"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GuildCreateHandler {
    constructor() {
        this.name = "guildCreate";
    }
    async handle(guild) {
        this.managers.guild.createConfig(guild.id);
    }
}
exports.event = new GuildCreateHandler;
