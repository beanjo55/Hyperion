/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
import {Guild, Role} from "eris";
class GuildRoleUpdateHandler{
    name: string;
    constructor(){
        this.name = "guildRoleUpdate";
    }
    async handle(this: HyperionInterface, guild: Guild, role: Role, oldRole: any){

    }
}
exports.event = new GuildRoleUpdateHandler;