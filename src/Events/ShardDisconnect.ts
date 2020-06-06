// eslint-disable-next-line no-unused-vars
import {IHyperion} from "../types";
class ShardDisconnectHandler{
    name: string;
    constructor(){
        this.name = "shardDisconnect";
    }
    async handle(this: IHyperion, err: Error, shardID: number): Promise<void>{
        this.logger.warn("Hyperion", `Shard ${shardID} disconnected, ${err}`, "Sharding");
    }
}
export default new ShardDisconnectHandler;