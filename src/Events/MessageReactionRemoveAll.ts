/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
import {Message} from "eris";
class MessageReactionRemoveAllHandler{
    name: string;
    constructor(){
        this.name = "messageReactionRemoveAll";
    }
    async handle(this: HyperionInterface, msg: Message): Promise<void>{

    }
}
exports.event = new MessageReactionRemoveAllHandler;