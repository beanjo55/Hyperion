/* eslint-disable no-unused-vars */
import {IHyperion} from "../types";
import {Guild, User} from "eris";
const eventName = "guildBanRemove";
class GuildBanRemoveHandler{
    name: string;
    constructor(){
        this.name = "guildBanRemove";
    }
    async handle(this: IHyperion, guild: Guild, user: User): Promise<void>{
        const subscribed = this.modules.filter(M => M.subscribedEvents.includes(eventName));
        subscribed.forEach(m => {
            m.guildBanRemove(this, guild, user);
        });
    }
}
export default new GuildBanRemoveHandler;