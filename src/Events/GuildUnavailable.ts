/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import {HyperionInterface} from "../types";
import {Guild} from "eris";
class GuildUnavailableHandler{
    name: string;
    constructor(){
        this.name = "guildUnavailable";
    }
    async handle(this: HyperionInterface, guild: Guild): Promise<void>{

    }
}
exports.event = new GuildUnavailableHandler;