/* eslint-disable no-unused-vars */
import {HyperionInterface} from "../types";
import {Message} from "eris";
import {Module} from "../Core/Structures/Module";
const eventName = "messageDelete";
class MessageDeleteHandler{
    name: string;
    constructor(){
        this.name = "messageDelete";
    }
    async handle(this: HyperionInterface, msg: Message | any){
        let subscribed: Array<Module> = this.modules.filter((M: Module) => M.subscribedEvents.includes(eventName));
        subscribed.forEach((m: Module) => {
            m.messageDelete(this, msg);
        });
    }
}
exports.event = new MessageDeleteHandler;