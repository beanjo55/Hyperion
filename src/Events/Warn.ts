/* eslint-disable no-unused-vars */

import {HyperionInterface} from "../types";
class WarnHandler{
    name: string;
    constructor(){
        this.name = "warn";
    }
    async handle(this: HyperionInterface, warnMsg: string, shardID: number){

    }
}
exports.event = new WarnHandler;