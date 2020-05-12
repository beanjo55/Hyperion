/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
import {Guild, Member} from "eris";
import {Module} from "../Core/Structures/Module";
const eventName = "guildMemberUpdate";
class GuildMemberUpdateHandler{
    name: string;
    constructor(){
        this.name = "guildMemberUpdate";
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async handle(this: HyperionInterface, guild: Guild, member: Member, oldMember: any): Promise<void>{
        const subscribed: Array<Module> = this.modules.filter((M: Module) => M.subscribedEvents.includes(eventName));
        subscribed.forEach((m: Module) => {
            m.guildMemberUpdate(this, guild, member, oldMember);
        });
    }
}
exports.event = new GuildMemberUpdateHandler;
