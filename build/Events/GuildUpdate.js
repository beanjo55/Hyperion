"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GuildUpdateHandler {
    constructor() {
        this.name = "guildUpdate";
    }
    async handle(guild, oldGuild) {
    }
}
exports.event = new GuildUpdateHandler;
