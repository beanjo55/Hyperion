/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import {HyperionInterface} from "../types";
import {Guild, Role} from "eris";
class GuildRoleDeleteHandler{
    name: string;
    constructor(){
        this.name = "guildRoleDelete";
    }
    async handle(this: HyperionInterface, guild: Guild, role: Role): Promise<void>{

    }
}
exports.event = new GuildRoleDeleteHandler;