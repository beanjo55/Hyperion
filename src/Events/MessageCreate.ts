/* eslint-disable no-unused-vars */
import {inspect} from "util";
import {IHyperion, HyperionGuild} from "../types";
import {Message, Guild} from "eris";
const eventName = "messageCreate";
class MessageCreateHandler{
    name: string;
    constructor(){
        this.name = "messageCreate";
    }

    async handle(this: IHyperion, msg: Message): Promise<void>{
        
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
                this.logger.error("Hyperion", `failed to fetch guild ${guild.id}, error: ${inspect(err)}`, "Member Fetch");
            }
            (this.client.guilds.get(guild.id) as HyperionGuild).fetched = true;
        }
        
        const subscribed = this.modules.filter(M => M.subscribedEvents.includes(eventName));
        subscribed.forEach(m => {
            m.messageCreate(this, msg);
        });
    }
}
export default new MessageCreateHandler;