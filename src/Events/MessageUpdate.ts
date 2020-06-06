/* eslint-disable no-unused-vars */
import {IHyperion} from "../types";
import {Message} from "eris";
import {Module} from "../Core/Structures/Module";
const eventName = "messageUpdate";
class MessageUpdateHandler{
    name: string;
    constructor(){
        this.name = "messageUpdate";
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async handle(this: IHyperion, msg: Message, oldMessage: any): Promise<void>{
        const subscribed: Array<Module> = this.modules.filter((M: Module) => M.subscribedEvents.includes(eventName));
        subscribed.forEach((m: Module) => {
            m.messageUpdate(this, msg, oldMessage);
        });
    }
}
export default new MessageUpdateHandler;