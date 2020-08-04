/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import {IHyperion} from "../types";
import {Guild, Role} from "eris";
const eventName = "guildRoleDelete";
class GuildRoleDeleteHandler{
    name: string;
    constructor(){
        this.name = "guildRoleDelete";
    }
    async handle(this: IHyperion, guild: Guild, role: Role): Promise<void>{
        const subscribed = this.modules.filter(M => M.subscribedEvents.includes(eventName));
        subscribed.forEach(m => {
            m.roleDelete(this, guild, role);
        });
    }
}
export default new GuildRoleDeleteHandler;