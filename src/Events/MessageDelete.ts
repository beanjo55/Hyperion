import {HyperionInterface} from "../types";
import {Message} from 'eris';
class MessageDeleteHandler{
    name: string;
    constructor(){
        this.name = "messageDelete";
    }
    async handle(this: HyperionInterface, msg: Message){

    }
}
exports.event = new MessageDeleteHandler;