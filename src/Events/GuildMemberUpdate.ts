import {HyperionInterface} from "../types";
import {Guild, Member} from 'eris';
class GuildMemberUpdateHandler{
    name: string;
    constructor(){
        this.name = "guildMemberUpdate";
    }
    async handle(this: HyperionInterface, guild: Guild, member: Member, oldMember: any){

    }
}
exports.event = new GuildMemberUpdateHandler;