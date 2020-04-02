import {HyperionInterface} from "../types";
import {Guild, User} from 'eris';
class GuildBanRemoveHandler{
    name: string;
    constructor(){
        this.name = "guildBanRemove";
    }
    async handle(this: HyperionInterface, guild: Guild, user: User){

    }
}
exports.event = new GuildBanRemoveHandler;