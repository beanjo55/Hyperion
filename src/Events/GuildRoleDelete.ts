/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import {IHyperion} from "../types";
import {Guild, Role} from "eris";
class GuildRoleDeleteHandler{
    name: string;
    constructor(){
        this.name = "guildRoleDelete";
    }
    async handle(this: IHyperion, guild: Guild, role: Role): Promise<void>{

    }
}
export default new GuildRoleDeleteHandler;