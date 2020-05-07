/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
import {Message} from "eris";
class MessageDeleteBulkHandler{
    name: string;
    constructor(){
        this.name = "messageDeleteBulk";
    }
    async handle(this: HyperionInterface, messages: Array<Message|any>){

    }
}
exports.event = new MessageDeleteBulkHandler;