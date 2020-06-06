/* eslint-disable no-unused-vars */
import {IHyperion} from "../types";
import {Guild, Member} from "eris";
import {Module} from "../Core/Structures/Module";
const eventName = "guildMemberAdd";
class GuildMemberAddHandler{
    name: string;
    constructor(){
        this.name = "guildMemberAdd";
    }
    async handle(this: IHyperion, guild: Guild, member: Member): Promise<void>{
        const subscribed: Array<Module> = this.modules.filter((M: Module) => M.subscribedEvents.includes(eventName));
        subscribed.forEach((m: Module) => {
            m.guildMemberAdd(this, guild, member);
        });
    }
}
export default new GuildMemberAddHandler;