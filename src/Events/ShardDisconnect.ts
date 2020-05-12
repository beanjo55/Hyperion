// eslint-disable-next-line no-unused-vars
import {HyperionInterface} from "../types";
class ShardDisconnectHandler{
    name: string;
    constructor(){
        this.name = "shardDisconnect";
    }
    async handle(this: HyperionInterface, err: Error, shardID: number): Promise<void>{
        this.logger.warn("Hyperion", "Sharding", `Shard ${shardID} disconnected, ${err}`);
    }
}
exports.event = new ShardDisconnectHandler;