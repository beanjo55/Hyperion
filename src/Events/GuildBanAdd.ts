/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
import {Guild, User} from "eris";
import {Module} from "../Core/Structures/Module";
const eventName = "guildBanAdd";
class GuildBanAddHandler{
    name: string;
    constructor(){
        this.name = "guildBanAdd";
    }
    async handle(this: HyperionInterface, guild: Guild, user: User): Promise<void>{
        const subscribed: Array<Module> = this.modules.filter((M: Module) => M.subscribedEvents.includes(eventName));
        subscribed.forEach((m: Module) => {
            m.guildBanAdd(this, guild, user);
        });
    }
}
exports.event = new GuildBanAddHandler;