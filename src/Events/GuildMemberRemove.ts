
import {IHyperion} from "../types";
import {Guild, Member} from "eris";
import {Module} from "../Core/Structures/Module";
const eventName = "guildMemberRemove";
class GuildMemberRemoveHandler{
    name: string;
    constructor(){
        this.name = "guildMemberRemove";
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async handle(this: IHyperion, guild: Guild, member: Member|any): Promise<void>{
        const subscribed: Array<Module> = this.modules.filter((M: Module) => M.subscribedEvents.includes(eventName));
        subscribed.forEach((m: Module) => {
            m.guildMemberRemove(this, guild, member);
        });
    }
}
export default new GuildMemberRemoveHandler;