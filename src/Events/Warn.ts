/* eslint-disable no-unused-vars */

import {HyperionInterface} from "../types";
class WarnHandler{
    name: String;
    constructor(){
        this.name = "warn";
    }
    async handle(this: HyperionInterface, warnMsg: string, shardID: number){

    }
}
exports.event = new WarnHandler;