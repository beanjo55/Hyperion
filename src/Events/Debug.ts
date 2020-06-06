/* eslint-disable no-unused-vars */
import {IHyperion} from "../types";
class DebugHandler{
    name: string;
    constructor(){
        this.name = "debug";
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async handle(this: IHyperion, message: string, shardID: number): Promise<void>{
        if(message.toLowerCase().includes("unexpected 429")){this.logger.warn("Hyperion", `Encountered a 429, ${message}`, "Rate Limit");}
        if(this.logLevel<5){return;}
        if(message.toLowerCase().includes("duplicate presence")){return;}
        this.logger.info("Hyperion", message, "Debug");
    }
}
export default new DebugHandler;