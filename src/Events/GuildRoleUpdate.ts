/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {IHyperion} from "../types";
import {Guild, Role} from "eris";
class GuildRoleUpdateHandler{
    name: string;
    constructor(){
        this.name = "guildRoleUpdate";
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async handle(this: IHyperion, guild: Guild, role: Role, oldRole: any): Promise<void>{

    }
}
export default new GuildRoleUpdateHandler;