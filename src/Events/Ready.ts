// eslint-disable-next-line no-unused-vars
import {HyperionInterface} from "../types";
class ReadyHandler{
    name: string;
    constructor(){
        this.name = "ready";
    }
    async handle(this: HyperionInterface): Promise<void>{
        this.logger.success("Hyperion", "Ready Event", "Hyperion Ready");
        this.client.editStatus(undefined, {name: `%help | ${this.client.guilds.size} servers`, type: 0});
    }
}
exports.event = new ReadyHandler;