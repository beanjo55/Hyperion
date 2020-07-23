import {IHyperion} from "../types";
import {Message} from "eris";
const eventName = "messageDelete";
class MessageDeleteHandler{
    name: string;
    constructor(){
        this.name = "messageDelete";
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async handle(this: IHyperion, msg: Message | any): Promise<void>{
        const subscribed = this.modules.filter(M => M.subscribedEvents.includes(eventName));
        subscribed.forEach(m => {
            m.messageDelete(this, msg);
        });
    }
}
export default new MessageDeleteHandler;