/* eslint-disable no-unused-vars */
import {IHyperion} from "../types";
import {Module} from "../Core/Structures/Module";
import {Message, Emoji} from "eris";
import { IGuild } from "../MongoDB/Guild";
const eventName = "messageReactionAdd";
class MessageReactionAddHandler{
    name: string;
    constructor(){
        this.name = "messageReactionAdd";
    }
    async handle(this: IHyperion, msg: Message, emote: Emoji, userID: string): Promise<void>{
        const subscribed: Array<Module> = this.modules.filter((M: Module) => M.subscribedEvents.includes(eventName));
        subscribed.forEach((m: Module) => {
            m.messageReactionAdd(this, msg, emote, userID);
        });

        //basics
        if(msg.channel.type !== 0){return;}
        const conf: IGuild | null = await this.managers.guild.getConfig(msg.channel.guild.id);
        if(!conf){return;}
        //starboard
        if(conf.modules?.starboard !== undefined && conf.modules?.starboard.enabled){
            const starboard: Module | undefined = this.modules.get("starboard");
            if(starboard !== undefined){
                starboard.Star(this, msg, emote, userID, conf, "add");
            }
        }

        

    }
}
export default new MessageReactionAddHandler;