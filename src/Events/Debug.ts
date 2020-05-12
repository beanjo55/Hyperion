/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
class DebugHandler{
    name: string;
    constructor(){
        this.name = "debug";
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async handle(this: HyperionInterface, message: string, shardID: number): Promise<void>{
        if(this.logLevel<5){return;}
        if(message.toLowerCase().includes("duplicate presence")){return;}
        this.logger.info("Hyperion", "Debug", message);
    }
}
exports.event = new DebugHandler;