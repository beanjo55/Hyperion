/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
import {GuildChannel} from "eris";
class ChannelUpdateHandler{
    name: string;
    constructor(){
        this.name = "channelUpdate";
    }
    async handle(this: HyperionInterface, channel: GuildChannel, oldChannel: any){

    }
}
exports.event = new ChannelUpdateHandler;