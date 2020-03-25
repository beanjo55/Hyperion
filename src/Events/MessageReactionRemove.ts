import {HyperionInterface} from "../types";
import {Message, Emoji} from 'eris';
class MessageReactionRemoveHandler{
    name: String;
    constructor(){
        this.name = "messageReactionRemove";
    }
    async handle(this: HyperionInterface, msg: Message, emote: Emoji, userID: String){

    }
}
exports.event = new MessageReactionRemoveHandler;