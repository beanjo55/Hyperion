/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import {IHyperion} from "../types";
import {Guild, Role} from "eris";
class GuildRoleCreateHandler{
    name: string;
    constructor(){
        this.name = "guildRoleCreate";
    }
    async handle(this: IHyperion, guild: Guild, role: Role): Promise<void>{

    }
}
export default new GuildRoleCreateHandler;