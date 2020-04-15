"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MessageReactionAddHandler {
    constructor() {
        this.name = "messageReactionAdd";
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
                starboard.Star(this, msg, emote, userID, conf, "add");
            }
        }
        console.log(emote);
    }
}
exports.event = new MessageReactionAddHandler;
