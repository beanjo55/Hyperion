/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
import {Guild, User} from "eris";
import {Module} from "../Core/Structures/Module";
const eventName = "guildBanRemove";
class GuildBanRemoveHandler{
    name: string;
    constructor(){
        this.name = "guildBanRemove";
    }
    async handle(this: HyperionInterface, guild: Guild, user: User){
        let subscribed: Array<Module> = this.modules.filter((M: Module) => M.subscribedEvents.includes(eventName));
        subscribed.forEach((m: Module) => {
            m.guildBanRemove(this, guild, user);
        });
    }
}
exports.event = new GuildBanRemoveHandler;