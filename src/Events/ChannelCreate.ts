/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
import {GuildChannel} from "eris";
class ChannelCreateHandler{
    name: string;
    constructor(){
        this.name = "channelCreate";
    }
    async handle(this: HyperionInterface, channel: GuildChannel): Promise<void>{

    }
}
exports.event = new ChannelCreateHandler;