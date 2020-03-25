import {HyperionInterface} from "../types";
import {Guild} from 'eris';
class GuildDeleteHandler{
    name: string;
    constructor(){
        this.name = "guildDelete";
    }
    async handle(this: HyperionInterface, guild: Guild){

    }
}
exports.event = new GuildDeleteHandler;