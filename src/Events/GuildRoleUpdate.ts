/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {IHyperion} from "../types";
import {Guild, Role} from "eris";
import {inspect} from "util";
const eventName = "guildRoleUpdate";
class GuildRoleUpdateHandler{
    name: string;
    constructor(){
        this.name = "guildRoleUpdate";
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async handle(this: IHyperion, guild: Guild, role: Role, oldRole: any): Promise<void>{
        const subscribed = this.modules.filter(M => M.subscribedEvents.includes(eventName));
        subscribed.forEach(m => {
            m.roleUpdate(this, guild, role, oldRole);
        });
    }
}
export default new GuildRoleUpdateHandler;