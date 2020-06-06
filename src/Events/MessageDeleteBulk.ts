/* eslint-disable no-unused-vars */
import {IHyperion} from "../types";
import {Message} from "eris";
import {Module} from "../Core/Structures/Module";
const eventName = "messageDeleteBulk";
class MessageDeleteBulkHandler{
    name: string;
    constructor(){
        this.name = "messageDeleteBulk";
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async handle(this: IHyperion, messages: Array<Message|any>): Promise<void>{
        const subscribed: Array<Module> = this.modules.filter((M: Module) => M.subscribedEvents.includes(eventName));
        subscribed.forEach((m: Module) => {
            m.messageDeleteBulk(this, messages);
        });
    }
}
export default new MessageDeleteBulkHandler;