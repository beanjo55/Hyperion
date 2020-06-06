// eslint-disable-next-line no-unused-vars
import {IHyperion} from "../types";
class ShardReadyHandler{
    name: string;
    constructor(){
        this.name = "shardReady";
    }
    async handle(this: IHyperion, shardID: number): Promise<void>{
        this.logger.success("Hyperion", `Shard ${shardID} ready!`, "Sharding");
    }
}
export default new ShardReadyHandler;