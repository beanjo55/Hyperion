/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
import {GuildChannel} from "eris";
class ChannelDeleteHandler{
    name: string;
    constructor(){
        this.name = "channelDelete";
    }
    async handle(this: HyperionInterface, channel: GuildChannel){

    }
}
exports.event = new ChannelDeleteHandler;