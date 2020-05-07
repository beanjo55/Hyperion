/* eslint-disable no-unused-vars */
import {inspect} from "util";
import {HyperionInterface} from "../types";
class RawWSHandler{
    name: string;
    constructor(){
        this.name = "rawWS";
    }
    async handle(this: HyperionInterface, packet: any, shardID: Number){
        if(packet.op !== 7){return;}
        console.log(`Shard: ${shardID} packet: ${inspect(packet)}`);
    }
}
exports.event = new RawWSHandler;