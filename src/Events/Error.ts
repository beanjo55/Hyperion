/* eslint-disable no-unused-vars */
import {IHyperion} from "../types";
import {inspect} from "util";
class ErrorHandler{
    name: string;
    constructor(){
        this.name = "error";
    }
    async handle(this: IHyperion, err: Error, shardID: number): Promise<void>{
        if(err === undefined || err === null || err.message.includes("heartbeat") || err.message.includes("Connection reset by peer") || err.message.includes("proxy") || err.message.includes("1001")){
            return this.logger.error("Hyperion", `Shard ${shardID} encountered an error! Error: ${err}`, "Error Event");
        }
        this.logger.error("Hyperion", `Shard ${shardID} encountered an error! Error: ${inspect(err)}`, "Error Event");
        this.sentry.captureException(err);
        

    }
}
export default new ErrorHandler;