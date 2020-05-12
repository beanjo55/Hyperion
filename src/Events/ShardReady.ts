// eslint-disable-next-line no-unused-vars
import {HyperionInterface} from "../types";
class ShardReadyHandler{
    name: string;
    constructor(){
        this.name = "shardReady";
    }
    async handle(this: HyperionInterface, shardID: number): Promise<void>{
        this.logger.success("Hyperion", "Sharding", `Shard ${shardID} ready!`);
    }
}
exports.event = new ShardReadyHandler;