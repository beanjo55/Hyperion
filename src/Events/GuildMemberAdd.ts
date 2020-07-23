import {IHyperion} from "../types";
import {Guild, Member} from "eris";
const eventName = "guildMemberAdd";
class GuildMemberAddHandler{
    name: string;
    constructor(){
        this.name = "guildMemberAdd";
    }
    async handle(this: IHyperion, guild: Guild, member: Member): Promise<void>{
        const subscribed = this.modules.filter(M => M.subscribedEvents.includes(eventName));
        subscribed.forEach(m => {
            m.guildMemberAdd(this, guild, member);
        });
    }
}
export default new GuildMemberAddHandler;