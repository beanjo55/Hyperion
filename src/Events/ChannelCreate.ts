/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
import {GuildChannel} from "eris";
class ChannelCreateHandler{
    name: string;
    constructor(){
        this.name = "channelCreate";
    }
    async handle(this: HyperionInterface, channel: GuildChannel){

    }
}
exports.event = new ChannelCreateHandler;