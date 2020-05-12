/* eslint-disable no-unused-vars */
import {inspect} from "util";
import {HyperionInterface} from "../types";
class RawWSHandler{
    name: string;
    constructor(){
        this.name = "rawWS";
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async handle(this: HyperionInterface, packet: any, shardID: number): Promise<void>{
        if(packet.op !== 7){return;}
        console.log(`Shard: ${shardID} packet: ${inspect(packet)}`);
    }
}
exports.event = new RawWSHandler;