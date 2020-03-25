import {HyperionInterface} from "../types";
import {Message, Emoji} from 'eris';
class MessageReactionAddHandler{
    name: String;
    constructor(){
        this.name = "messageReactionAdd";
    }
    async handle(this: HyperionInterface, msg: Message, emote: Emoji, userID: String){

    }
}
exports.event = new MessageReactionAddHandler;