/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
import {Message, MessageContent, Emoji} from "eris";

class MessageReactionAddHandler{
    name: String;
    constructor(){
        this.name = "messageReactionAdd";
    }
    async handle(this: HyperionInterface, msg: Message, emote: Emoji, userID: String){
        if(!msg.member){return;}
        const Starpost: MessageContent = {
            content: `${msg.id} | ${msg.channel.mention}`,
            embed: {
                color: this.defaultColor,
                timestamp: new Date,
                description: msg.content,
                author: {
                    icon_url: msg.member.avatarURL,
                    name: `${msg.author.username}#${msg.author.discriminator}`
                }
            }
        };

        //basics
        if(msg.channel.type !== 0){return;}
        const conf = await this.managers.guild.getConfig(msg.channel.guild.id);

        //starboard
        if(conf.modules.starboard === undefined || conf.modules.starboard.enabled === false){return;}
        if(!emote){return;}
        if(emote.name !== "⭐"){return;}
        if(conf.starboard.starChannel === undefined || conf.starboard.starChannel === ""){return;}
        if(msg.author.id === userID && !conf.starboard.selfstar){return;}
        if(conf.starboard.ignoredChannels.includes(msg.channel.id)){return;}

        if(!this.stars[msg.id]){
            let data = {
                count: 1,
                sent: false
            };
            this.stars[msg.id] = data;
        }else{
            this.stars[msg.id].count++;
        }

        if(this.stars[msg.id].count > 3 && !this.stars[msg.id].sent){
            this.client.createMessage(conf.starboard.starChannel, Starpost);
            this.stars[msg.id].sent = true;
        }

    }
}
exports.event = new MessageReactionAddHandler;