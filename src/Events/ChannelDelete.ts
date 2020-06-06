/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-vars */
import {IHyperion} from "../types";
import {GuildChannel} from "eris";
class ChannelDeleteHandler{
    name: string;
    constructor(){
        this.name = "channelDelete";
    }
    async handle(this: IHyperion, channel: GuildChannel): Promise<void>{

    }
}
export default new ChannelDeleteHandler;