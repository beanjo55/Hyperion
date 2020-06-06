/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-vars */
import {IHyperion} from "../types";
import {Guild} from "eris";
class GuildAvailableHandler{
    name: string;
    constructor(){
        this.name = "guildAvailable";
    }
    async handle(this: IHyperion, guild: Guild): Promise<void>{

    }
}
export default new GuildAvailableHandler;