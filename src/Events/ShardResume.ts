// eslint-disable-next-line no-unused-vars
import {IHyperion} from "../types";
class ShardResumeHandler{
    name: string;
    constructor(){
        this.name = "shardResume";
    }
    async handle(this: IHyperion, shardID: number): Promise<void>{
        this.logger.success("Hyperion", `Shard ${shardID} resumed`, "Sharding");
    }
}
export default new ShardResumeHandler;