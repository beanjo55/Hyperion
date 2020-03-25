import {HyperionInterface} from "../types";
class WarnHandler{
    name: String;
    constructor(){
        this.name = "warn";
    }
    async handle(this: HyperionInterface, warnMsg: String, shardID: Number){

    }
}
exports.event = new WarnHandler;