/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
import {GuildChannel} from "eris";
class ChannelUpdateHandler{
    name: string;
    constructor(){
        this.name = "channelUpdate";
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async handle(this: HyperionInterface, channel: GuildChannel, oldChannel: any): Promise<void>{

    }
}
exports.event = new ChannelUpdateHandler;