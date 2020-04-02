import {HyperionInterface} from "../types";
class ReadyHandler{
    name: string;
    constructor(){
        this.name = "ready";
    }
    async handle(this: HyperionInterface){
        this.logger.success("Hyperion", "Ready Event", "Hyperion Ready");
        this.client.editStatus(undefined, {name: "v2", type: 0});
    }
}
exports.event = new ReadyHandler;