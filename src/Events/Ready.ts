// eslint-disable-next-line no-unused-vars
import {IHyperion} from "../types";
import {Module} from "../Core/Structures/Module";
const eventName = "ready";
class ReadyHandler{
    name: string;
    constructor(){
        this.name = "ready";
    }
    async handle(this: IHyperion): Promise<void>{
        this.logger.success("Hyperion", "Hyperion Ready"), "Ready Event";
        this.client.editStatus(undefined, {name: `%help | ${this.client.guilds.size} servers`, type: 0});
        const subscribed: Array<Module> = this.modules.filter((M: Module) => M.subscribedEvents.includes(eventName));
        subscribed.forEach((m: Module) => {
            m.ready(this);
        });
    }
}
export default new ReadyHandler;
