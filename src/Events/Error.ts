import {HyperionInterface} from "../types";
class ErrorHandler{
    name: string;
    constructor(){
        this.name = "error";
    }
    async handle(this: HyperionInterface, err: Error, shardID: Number){

    }
}
exports.event = new ErrorHandler;