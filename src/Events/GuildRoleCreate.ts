/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import {HyperionInterface} from "../types";
import {Guild, Role} from "eris";
class GuildRoleCreateHandler{
    name: string;
    constructor(){
        this.name = "guildRoleCreate";
    }
    async handle(this: HyperionInterface, guild: Guild, role: Role): Promise<void>{

    }
}
exports.event = new GuildRoleCreateHandler;