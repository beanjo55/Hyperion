/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
import {Guild} from "eris";
class GuildAvailableHandler{
    name: string;
    constructor(){
        this.name = "guildAvailable";
    }
    async handle(this: HyperionInterface, guild: Guild){

    }
}
exports.event = new GuildAvailableHandler;