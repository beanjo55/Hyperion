import {HyperionInterface} from "../types";
import {Guild, Role} from 'eris';
class GuildRoleDeleteHandler{
    name: string;
    constructor(){
        this.name = "guildRoleDelete";
    }
    async handle(this: HyperionInterface, guild: Guild, role: Role){

    }
}
exports.event = new GuildRoleDeleteHandler;