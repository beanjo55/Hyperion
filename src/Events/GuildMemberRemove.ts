import {HyperionInterface} from "../types";
import {Guild, Member} from 'eris';
class GuildMemberRemoveHandler{
    name: string;
    constructor(){
        this.name = "guildMemberRemove";
    }
    async handle(this: HyperionInterface, guild: Guild, member: Member|any){

    }
}
exports.event = new GuildMemberRemoveHandler;