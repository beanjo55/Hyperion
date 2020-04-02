import {HyperionInterface} from "../types";
import {Message} from 'eris';
class MessageDeleteBulkHandler{
    name: string;
    constructor(){
        this.name = "messageDeleteBulk";
    }
    async handle(this: HyperionInterface, messages: Array<Message|Object>){

    }
}
exports.event = new MessageDeleteBulkHandler;