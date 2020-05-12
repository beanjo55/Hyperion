/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {HyperionInterface} from "../types";
import {Guild} from "eris";
class GuildUpdateHandler{
    name: string;
    constructor(){
        this.name = "guildUpdate";
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async handle(this: HyperionInterface, guild: Guild, oldGuild: any): Promise<void>{

    }
}
exports.event = new GuildUpdateHandler;