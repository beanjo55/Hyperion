/* eslint-disable @typescript-eslint/no-unused-vars */
import {HyperionInterface} from "../types";
class WarnHandler{
    name: string;
    constructor(){
        this.name = "warn";
    }
    async handle(this: HyperionInterface, warnMsg: string, shardID: number): Promise<void>{
        this.logger.warn("Hyperion", "Warning", `Warning on shard ${shardID}, ${warnMsg}`);
    }
}
exports.event = new WarnHandler;