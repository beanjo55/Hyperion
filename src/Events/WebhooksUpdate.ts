/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {HyperionInterface} from "../types";
class WebhooksUpdateHandler{
    name: string;
    constructor(){
        this.name = "webhooksUpdate";
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async handle(this: HyperionInterface, data: any, channelID: string, guildID: string): Promise<void>{

    }
}
exports.event = new WebhooksUpdateHandler;