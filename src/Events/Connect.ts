/* eslint-disable no-unused-vars */
import {IHyperion} from "../types";
class ConnectHandler{
    name: string;
    constructor(){
        this.name = "connect";
    }
    async handle(this: IHyperion, shardID: number): Promise<void>{
        this.logger.info("Hyperion", `Shard ${shardID} has connected`, "Sharding");
    }
}
export default new ConnectHandler;