import {HyperionInterface} from "../types";
class WebhooksUpdateHandler{
    name: string;
    constructor(){
        this.name = "webhooksUpdate";
    }
    async handle(this: HyperionInterface, data: any, channelID: string, guildID: string){

    }
}
exports.event = new WebhooksUpdateHandler;