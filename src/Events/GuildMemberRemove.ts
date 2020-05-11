/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
import {Guild, Member} from "eris";
import {Module} from "../Core/Structures/Module";
const eventName = "guildMemberRemove";
class GuildMemberRemoveHandler{
    name: string;
    constructor(){
        this.name = "guildMemberRemove";
    }
    async handle(this: HyperionInterface, guild: Guild, member: Member|any){
        let subscribed: Array<Module> = this.modules.filter((M: Module) => M.subscribedEvents.includes(eventName));
        subscribed.forEach((m: Module) => {
            m.guildMemberRemove(this, guild, member);
        });
    }
}
exports.event = new GuildMemberRemoveHandler;