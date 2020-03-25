import {HyperionInterface} from "../types";
class ShardResumeHandler{
    name: String;
    constructor(){
        this.name = "shardResume";
    }
    async handle(this: HyperionInterface, shardID: Number){
        this.logger.success("Hyperion", "Sharding", `Shard ${shardID} resumed`);
    }
}
exports.event = new ShardResumeHandler;