/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
import {Guild} from "eris";
class GuildCreateHandler{
    name: string;
    constructor(){
        this.name = "guildCreate";
    }
    async handle(this: HyperionInterface, guild: Guild){
        this.managers.guild.createConfig(guild.id);
    }
}
exports.event = new GuildCreateHandler;