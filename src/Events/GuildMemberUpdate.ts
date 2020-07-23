import {IHyperion} from "../types";
import {Guild, Member} from "eris";
const eventName = "guildMemberUpdate";
class GuildMemberUpdateHandler{
    name: string;
    constructor(){
        this.name = "guildMemberUpdate";
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async handle(this: IHyperion, guild: Guild, member: Member, oldMember: any): Promise<void>{
        const subscribed = this.modules.filter(M => M.subscribedEvents.includes(eventName));
        subscribed.forEach(m => {
            m.guildMemberUpdate(this, guild, member, oldMember);
        });
    }
}
export default new GuildMemberUpdateHandler;
