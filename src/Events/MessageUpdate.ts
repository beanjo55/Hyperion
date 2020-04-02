import {HyperionInterface} from "../types";
import {Message} from 'eris';
class MessageUpdateHandler{
    name: string;
    constructor(){
        this.name = "messageUpdate";
    }
    async handle(this: HyperionInterface, msg: Message, oldMessage: any){

    }
}
exports.event = new MessageUpdateHandler;