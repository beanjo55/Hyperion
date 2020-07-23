import {IHyperion} from "../types";
import {Message} from "eris";
const eventName = "messageDeleteBulk";
class MessageDeleteBulkHandler{
    name: string;
    constructor(){
        this.name = "messageDeleteBulk";
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async handle(this: IHyperion, messages: Array<Message|any>): Promise<void>{
        const subscribed = this.modules.filter(M => M.subscribedEvents.includes(eventName));
        subscribed.forEach(m => {
            m.messageDeleteBulk(this, messages);
        });
    }
}
export default new MessageDeleteBulkHandler;