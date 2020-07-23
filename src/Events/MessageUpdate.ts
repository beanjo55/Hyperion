import {IHyperion} from "../types";
import {Message} from "eris";
const eventName = "messageUpdate";
class MessageUpdateHandler{
    name: string;
    constructor(){
        this.name = "messageUpdate";
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async handle(this: IHyperion, msg: Message, oldMessage: any): Promise<void>{
        const subscribed = this.modules.filter(M => M.subscribedEvents.includes(eventName));
        subscribed.forEach(m => {
            m.messageUpdate(this, msg, oldMessage);
        });
    }
}
export default new MessageUpdateHandler;