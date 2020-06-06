/* eslint-disable @typescript-eslint/no-unused-vars */
import {IHyperion} from "../types";
class WarnHandler{
    name: string;
    constructor(){
        this.name = "warn";
    }
    async handle(this: IHyperion, warnMsg: string, shardID: number): Promise<void>{
        this.logger.warn("Hyperion", `Warning on shard ${shardID}, ${warnMsg}`, "Warning");
    }
}
export default new WarnHandler;