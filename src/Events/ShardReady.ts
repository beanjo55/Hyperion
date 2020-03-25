import {HyperionInterface} from "../types";
class ShardReadyHandler{
    name: String;
    constructor(){
        this.name = "shardReady";
    }
    async handle(this: HyperionInterface, shardID: Number){
        this.logger.success("Hyperion", "Sharding", `Shard ${shardID} ready!`);
    }
}
exports.event = new ShardReadyHandler;