/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
import {Guild} from "eris";
class GuildUnavailableHandler{
    name: string;
    constructor(){
        this.name = "guildUnavailable";
    }
    async handle(this: HyperionInterface, guild: Guild){

    }
}
exports.event = new GuildUnavailableHandler;