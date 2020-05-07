/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
import {Guild, Member} from "eris";
class GuildMemberAddHandler{
    name: string;
    constructor(){
        this.name = "guildMemberAdd";
    }
    async handle(this: HyperionInterface, guild: Guild, member: Member){

    }
}
exports.event = new GuildMemberAddHandler;