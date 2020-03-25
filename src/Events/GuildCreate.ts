import {HyperionInterface} from "../types";
import {Guild} from 'eris';
class GuildCreateHandler{
    name: string;
    constructor(){
        this.name = "guildCreate";
    }
    async handle(this: HyperionInterface, guild: Guild){
        let guildconf = new this.models.guildconf({
            guild: guild.id
        })
    }
}
exports.event = new GuildCreateHandler;