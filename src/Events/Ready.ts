import {IHyperion} from "../types";
const eventName = "ready";
class ReadyHandler{
    name: string;
    constructor(){
        this.name = "ready";
    }
    async handle(this: IHyperion): Promise<void>{
        this.logger.success("Hyperion", "Hyperion Ready"), "Ready Event";
        this.client.editStatus(undefined, {name: `%help | ${this.client.guilds.size} servers`, type: 0});
        const subscribed = this.modules.filter(M => M.subscribedEvents.includes(eventName));
        subscribed.forEach(m => {
            m.ready(this);
        });
    }
}
export default new ReadyHandler;
