
import {IHyperion} from "../types";
import {Guild, Role} from "eris";
const eventName = "guildRoleCreate";
class GuildRoleCreateHandler{
    name: string;
    constructor(){
        this.name = "guildRoleCreate";
    }
    async handle(this: IHyperion, guild: Guild, role: Role): Promise<void>{
        const subscribed = this.modules.filter(M => M.subscribedEvents.includes(eventName));
        subscribed.forEach(m => {
            m.roleCreate(this, guild, role);
        });
    }
}
export default new GuildRoleCreateHandler;