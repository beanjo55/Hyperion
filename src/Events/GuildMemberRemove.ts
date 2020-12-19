
import {IHyperion} from "../types";
import {Guild, Member} from "eris";
const eventName = "guildMemberRemove";
class GuildMemberRemoveHandler{
    name: string;
    constructor(){
        this.name = "guildMemberRemove";
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async handle(this: IHyperion, guild: Guild, member: Member|any): Promise<void>{
        const subscribed = this.modules.filter(M => M.subscribedEvents.includes(eventName));
        subscribed.forEach(m => {
            m.guildMemberRemove(this, guild, member);
        });
    }
}
export default new GuildMemberRemoveHandler;