/* eslint-disable no-unused-vars */
import {IHyperion} from "../types";
import {Guild, User} from "eris";
import {Module} from "../Core/Structures/Module";
const eventName = "guildBanRemove";
class GuildBanRemoveHandler{
    name: string;
    constructor(){
        this.name = "guildBanRemove";
    }
    async handle(this: IHyperion, guild: Guild, user: User): Promise<void>{
        const subscribed: Array<Module> = this.modules.filter((M: Module) => M.subscribedEvents.includes(eventName));
        subscribed.forEach((m: Module) => {
            m.guildBanRemove(this, guild, user);
        });
    }
}
export default new GuildBanRemoveHandler;