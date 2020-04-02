import {HyperionInterface} from "../types";
import {Channel} from 'eris';
class ChannelUpdateHandler{
    name: string;
    constructor(){
        this.name = "channelUpdate";
    }
    async handle(this: HyperionInterface, channel: Channel, oldChannel: any){

    }
}
exports.event = new ChannelUpdateHandler;