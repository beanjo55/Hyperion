import {HyperionInterface} from "../types";
import {Channel} from 'eris';
class ChannelDeleteHandler{
    name: string;
    constructor(){
        this.name = "channelDelete";
    }
    async handle(this: HyperionInterface, channel: Channel){

    }
}
exports.event = new ChannelDeleteHandler;