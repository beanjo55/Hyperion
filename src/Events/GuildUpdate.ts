import {HyperionInterface} from "../types";
import {Guild} from 'eris';
class GuildUpdateHandler{
    name: string;
    constructor(){
        this.name = "guildUpdate";
    }
    async handle(this: HyperionInterface, guild: Guild, oldGuild: any){

    }
}
exports.event = new GuildUpdateHandler;