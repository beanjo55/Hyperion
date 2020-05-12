/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
import {GuildChannel} from "eris";
class ChannelDeleteHandler{
    name: string;
    constructor(){
        this.name = "channelDelete";
    }
    async handle(this: HyperionInterface, channel: GuildChannel): Promise<void>{

    }
}
exports.event = new ChannelDeleteHandler;