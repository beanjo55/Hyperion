/* eslint-disable no-unused-vars */
import {HyperionInterface, GuildConfig} from "../types";
import {Module} from "../Core/Structures/Module";
import {Message, Emoji} from "eris";
class MessageReactionRemoveHandler{
    name: string;
    constructor(){
        this.name = "messageReactionRemove";
    }
    async handle(this: HyperionInterface, msg: Message, emote: Emoji, userID: string){
        //basics
        if(msg.channel.type !== 0){return;}
        const conf: GuildConfig = await this.managers.guild.getConfig(msg.channel.guild.id);
 
        //starboard
        if(conf.modules.starboard !== undefined && conf.modules.starboard.enabled){
            const starboard: Module | undefined = this.modules.get("starboard");
            if(starboard !== undefined){
                starboard.Star(this, msg, emote, userID, conf, "del");
            }
        }
    }
}
exports.event = new MessageReactionRemoveHandler;