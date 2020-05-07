// eslint-disable-next-line no-unused-vars
import {HyperionInterface} from "../types";
class ShardResumeHandler{
    name: string;
    constructor(){
        this.name = "shardResume";
    }
    async handle(this: HyperionInterface, shardID: Number){
        this.logger.success("Hyperion", "Sharding", `Shard ${shardID} resumed`);
    }
}
exports.event = new ShardResumeHandler;