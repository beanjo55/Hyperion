/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
import {inspect} from "util";
class ErrorHandler{
    name: string;
    constructor(){
        this.name = "error";
    }
    async handle(this: HyperionInterface, err: Error, shardID: number): Promise<void>{
        if(err === undefined || err === null || err.message.includes("heartbeat") || err.message.includes("Connection reset by peer") || err.message.includes("proxy") || err.message.includes("1001")){
            return this.logger.error("Hyperion", "Error Event", `Shard ${shardID} encountered an error! Error: ${err}`);
        }
        this.logger.error("Hyperion", "Error Event", `Shard ${shardID} encountered an error! Error: ${inspect(err)}`);
        this.sentry.captureException(err);
        

    }
}
exports.event = new ErrorHandler;