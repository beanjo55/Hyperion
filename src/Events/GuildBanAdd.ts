/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
import {Guild, User} from "eris";
class GuildBanAddHandler{
    name: string;
    constructor(){
        this.name = "guildBanAdd";
    }
    async handle(this: HyperionInterface, guild: Guild, user: User){

    }
}
exports.event = new GuildBanAddHandler;