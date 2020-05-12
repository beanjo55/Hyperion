/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
import {Guild} from "eris";
class GuildAvailableHandler{
    name: string;
    constructor(){
        this.name = "guildAvailable";
    }
    async handle(this: HyperionInterface, guild: Guild): Promise<void>{

    }
}
exports.event = new GuildAvailableHandler;