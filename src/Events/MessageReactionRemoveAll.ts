import {HyperionInterface} from "../types";
import {Message} from 'eris';
class MessageReactionRemoveAllHandler{
    name: String;
    constructor(){
        this.name = "messageReactionRemoveAll";
    }
    async handle(this: HyperionInterface, msg: Message){

    }
}
exports.event = new MessageReactionRemoveAllHandler;