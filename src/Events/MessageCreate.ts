/* eslint-disable no-unused-vars */
const { inspect } = require("util");
import {HyperionInterface, HyperionGuild} from "../types";
import {Message, Guild, TextChannel} from "eris";
class MessageCreateHandler{
    name: String;
    constructor(){
        this.name = "messageCreate";
    }

    async handle(this: HyperionInterface, msg: Message){
        
        if(msg.channel.type !== 0){
            return;
        }
        let guild: Guild = msg.channel.guild;
        if(msg.author.bot){
            return;
        }
        const fetchguild: HyperionGuild = (this.client.guilds.get(guild.id) as HyperionGuild);
        if(!fetchguild){return;}
        if(!fetchguild.fetched){
            fetchguild.fetchAllMembers().catch((err: any) => this.logger.error(`failed to fetch guild ${guild.id}, error: ${inspect(err)}`));
            (this.client.guilds.get(guild.id) as HyperionGuild).fetched = true;
        }
        

        this.handler.handler(msg, this);
        //msg.channel.createMessage("```js\n" + inspect(await this.handler(msg), {depth: 1}) + "```");
    }
}
exports.event = new MessageCreateHandler;