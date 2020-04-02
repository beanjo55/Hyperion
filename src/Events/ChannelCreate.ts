import {HyperionInterface} from "../types";
import {Channel} from 'eris';
class ChannelCreateHandler{
    name: string;
    constructor(){
        this.name = "channelCreate";
    }
    async handle(this: HyperionInterface, channel: Channel){

    }
}
exports.event = new ChannelCreateHandler;