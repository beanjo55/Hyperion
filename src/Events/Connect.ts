import {HyperionInterface} from "../types";
class ConnectHandler{
    name: String;
    constructor(){
        this.name = "connect";
    }
    async handle(this: HyperionInterface, shardID: Number){
        this.logger.info("Hyperion", "Sharding", `Shard ${shardID} has connected`);
    }
}
exports.event = new ConnectHandler;