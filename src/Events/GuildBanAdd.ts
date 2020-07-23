import {IHyperion} from "../types";
import {Guild, User} from "eris";
const eventName = "guildBanAdd";
class GuildBanAddHandler{
    name: string;
    constructor(){
        this.name = "guildBanAdd";
    }
    async handle(this: IHyperion, guild: Guild, user: User): Promise<void>{
        const subscribed = this.modules.filter(M => M.subscribedEvents.includes(eventName));
        subscribed.forEach(m => {
            m.guildBanAdd(this, guild, user);
        });
    }
}
export default new GuildBanAddHandler;