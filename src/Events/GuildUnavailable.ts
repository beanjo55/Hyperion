/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import {IHyperion} from "../types";
import {Guild} from "eris";
class GuildUnavailableHandler{
    name: string;
    constructor(){
        this.name = "guildUnavailable";
    }
    async handle(this: IHyperion, guild: Guild): Promise<void>{

    }
}
export default new GuildUnavailableHandler;