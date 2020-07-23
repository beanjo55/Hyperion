/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import {IHyperion} from "../types";
import {GuildChannel} from "eris";
class ChannelCreateHandler{
    name: string;
    constructor(){
        this.name = "channelCreate";
    }
    async handle(this: IHyperion, channel: GuildChannel): Promise<void>{

    }
}
export default new ChannelCreateHandler;