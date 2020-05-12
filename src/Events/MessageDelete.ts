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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async handle(this: HyperionInterface, msg: Message | any): Promise<void>{
        const subscribed: Array<Module> = this.modules.filter((M: Module) => M.subscribedEvents.includes(eventName));
        subscribed.forEach((m: Module) => {
            m.messageDelete(this, msg);
        });
    }
}
exports.event = new MessageDeleteHandler;