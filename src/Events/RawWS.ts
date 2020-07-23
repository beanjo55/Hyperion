import {inspect} from "util";
import {IHyperion} from "../types";
class RawWSHandler{
    name: string;
    constructor(){
        this.name = "rawWS";
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async handle(this: IHyperion, packet: any, shardID: number): Promise<void>{
        if(packet.op !== 7){return;}
        console.log(`Shard: ${shardID} packet: ${inspect(packet)}`);
    }
}
export default new RawWSHandler;