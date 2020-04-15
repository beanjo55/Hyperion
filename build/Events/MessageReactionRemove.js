"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MessageReactionRemoveHandler {
    constructor() {
        this.name = "messageReactionRemove";
    }
    async handle(msg, emote, userID) {
        //basics
        if (msg.channel.type !== 0) {
            return;
        }
        const conf = await this.managers.guild.getConfig(msg.channel.guild.id);
        //starboard
        if (conf.modules.starboard !== undefined && conf.modules.starboard.enabled) {
            const starboard = this.modules.get("starboard");
            if (starboard !== undefined) {
                starboard.Star(this, msg, emote, userID, conf, "del");
            }
        }
    }
}
exports.event = new MessageReactionRemoveHandler;
