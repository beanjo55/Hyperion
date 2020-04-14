/* eslint-disable no-unused-vars */
import {HyperionInterface, GuildConfig} from "../types";
import {Module} from "../Core/Structures/Module";
import {Message, MessageContent, Emoji} from "eris";

class MessageReactionAddHandler{
    name: String;
    constructor(){
        this.name = "messageReactionAdd";
    }
    async handle(this: HyperionInterface, msg: Message, emote: Emoji, userID: String){


        //basics
        if(msg.channel.type !== 0){return;}
        const conf: GuildConfig = await this.managers.guild.getConfig(msg.channel.guild.id);

        //starboard
        if(conf.modules.starboard !== undefined && conf.modules.starboard.enabled){
            const starboard: Module | undefined = this.modules.get("starboard");
            if(starboard !== undefined){
                starboard.Star(this, msg, emote, userID, conf, "add");
            }
        }
        console.log(emote);
        

    }
}
exports.event = new MessageReactionAddHandler;