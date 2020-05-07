/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
class DebugHandler{
    name: string;
    constructor(){
        this.name = "debug";
    }
    async handle(this: HyperionInterface, message: string, shardID: Number){
        if(this.logLevel<5){return;}
        if(message.toLowerCase().includes("duplicate presence")){return;}
        this.logger.info("Hyperion", "Debug", message);
    }
}
exports.event = new DebugHandler;