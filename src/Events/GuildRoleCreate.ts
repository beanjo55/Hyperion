import {HyperionInterface} from "../types";
import {Guild, Role} from 'eris';
class GuildRoleCreateHandler{
    name: string;
    constructor(){
        this.name = "guildRoleCreate";
    }
    async handle(this: HyperionInterface, guild: Guild, role: Role){

    }
}
exports.event = new GuildRoleCreateHandler;