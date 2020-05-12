/* eslint-disable no-unused-vars */
import {inspect} from "util";
import {HyperionInterface, HyperionGuild} from "../types";
import {Message, Guild} from "eris";
import {Module} from "../Core/Structures/Module";
const eventName = "messageCreate";
class MessageCreateHandler{
    name: string;
    constructor(){
        this.name = "messageCreate";
    }

    async handle(this: HyperionInterface, msg: Message): Promise<void>{
        
        if(!(msg.channel.type === 0 || msg.channel.type === 5)){
            return;
        }
        const guild: Guild = msg.channel.guild;
        if(msg.author.bot){
            return;
        }
        const fetchguild: HyperionGuild = (this.client.guilds.get(guild.id) as HyperionGuild);
        if(!fetchguild){return;}
        if(!fetchguild.fetched){
            try{
                fetchguild.fetchAllMembers();
            }catch(err){
                this.logger.error(`failed to fetch guild ${guild.id}, error: ${inspect(err)}`);
            }
            (this.client.guilds.get(guild.id) as HyperionGuild).fetched = true;
        }
        
        const subscribed: Array<Module> = this.modules.filter((M: Module) => M.subscribedEvents.includes(eventName));
        subscribed.forEach((m: Module) => {
            m.messageCreate(this, msg);
        });
        //this.handler.handler(msg, this);
        //msg.channel.createMessage("```js\n" + inspect(await this.handler(msg), {depth: 1}) + "```");
    }
}
exports.event = new MessageCreateHandler;